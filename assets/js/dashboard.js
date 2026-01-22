import { supabase, requireAuth } from "./supabase-client.js";
import { showToast } from "./toast.js";

// 🔐 Pastikan login
const session = await requireAuth();

// DOM
const ordersContainer = document.getElementById("orders-list");

// Ambil pesanan user
async function loadOrders() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      title,
      status,
      result_file_url,
      created_at,
    `)
    .order("created_at", { ascending: false });

  if (error) {
    showToast("Gagal memuat pesanan", "error");
    console.error(error);
    return;
  }

  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-state">
        <p>Anda belum memiliki pesanan.</p>
        <a href="services.html" class="btn btn-primary">Buat Pesanan</a>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = orders
    .map((order) => renderOrderCard(order))
    .join("");
}

// Render satu kartu pesanan
function renderOrderCard(order) {
  const statusClass = getStatusClass(order.status);
  const date = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const downloadBtn =
    order.status === "selesai" && order.result_file_url
      ? `<a href="${order.result_file_url}" target="_blank" class="btn btn-success">
           Download Hasil
         </a>`
      : "";

  return `
    <div class="order-card">
      <div class="order-header">
        <span class="order-service">Pesanan Layanan</span>

        <span class="order-status ${statusClass}">${order.status}</span>
      </div>

      <h3 class="order-title">${order.title}</h3>

      <div class="order-meta">
        <span>${date}</span>
      </div>

      <div class="order-actions">
        <a href="order-detail.html?id=${order.id}" class="btn btn-outline">
          Detail
        </a>
        ${downloadBtn}
      </div>
    </div>
  `;
}

// Status ke class CSS
function getStatusClass(status) {
  if (!status) return "status-pending";
  const s = status.toLowerCase();
  if (s.includes("menunggu")) return "status-pending";
  if (s.includes("proses")) return "status-proses";
  if (s.includes("revisi")) return "status-revisi";
  if (s.includes("selesai")) return "status-selesai";
  return "status-pending";
}

// Run
loadOrders();
