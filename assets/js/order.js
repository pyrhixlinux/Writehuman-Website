import { supabase, getSession } from "./supabase-client.js";
import { showToast } from "./toast.js";

// === UTIL: generate teks pesanan ===
function generateOrderText(serviceName, data) {
  return `
Pesanan Layanan: ${serviceName}

Judul: ${data.title}
Deskripsi: ${data.description || '-'}
`;
}

// === FORM HANDLER ===
const form = document.getElementById("order-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const serviceSlug = form.dataset.service; // contoh: jasaskripsi

    if (!title) {
      showToast("Judul wajib diisi", "error");
      return;
    }

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.innerHTML = `<span class="loader"></span> Mengirim...`;

    // 1️⃣ cek login
    const session = await getSession();

    // data order sementara
    const pendingOrder = {
      title,
      description,
      serviceSlug
    };

    // 2️⃣ kalau belum login → simpan & redirect
    if (!session) {
      sessionStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
      window.location.href = "login.html";
      return;
    }

    // 3️⃣ ambil service dari DB
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("slug", serviceSlug)
      .single();

    if (serviceError || !service) {
      showToast("Layanan tidak ditemukan", "error");
      btn.disabled = false;
      btn.innerHTML = "Kirim Pesanan";
      return;
    }

    // 4️⃣ generate order_text
    const orderText = generateOrderText(service.name, pendingOrder);

    // 5️⃣ insert ke orders
    const { error } = await supabase.from("orders").insert({
      user_id: session.user.id,
      service_id: service.id,
      title: title,
      order_text: orderText,
      status: "menunggu pembayaran"
    });

    if (error) {
      showToast("Gagal membuat pesanan: " + error.message, "error");
      btn.disabled = false;
      btn.innerHTML = "Kirim Pesanan";
      return;
    }

    showToast("Pesanan berhasil dibuat!", "success");
    sessionStorage.removeItem("pendingOrder");

    window.location.replace("dashboard.html");
  });
}
