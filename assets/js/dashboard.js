import { supabase, requireAuth } from "./supabase-client.js";


// Check for Demo Login (localStorage) or Real Supabase Session
let session = null;
const demoUser = localStorage.getItem('userEmail');

if (demoUser) {
    // Mock Session
    session = { user: { email: demoUser, id: 'demo-user-123' } };
} else {
    try {
        session = await requireAuth();
    } catch (e) {
        // If requireAuth redirects, this line might not be reached, 
        // but if we want to support a hybrid, we might need to modify requireAuth.
        // For now, we assume requireAuth handles non-logged in users by redirecting.
    }
}

// Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
    if (localStorage.getItem('userEmail')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('myOrders');
        window.location.replace("login.html");
    } else {
        await supabase.auth.signOut();
        window.location.replace("login.html");
    }
});

// Load Orders
const ordersList = document.getElementById("orders-list");

async function loadOrders() {
  let allOrders = [];

  // 1. Load from Supabase (if real session)
  if (session && !demoUser) {
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      
      if (!error && dbOrders) {
          allOrders = [...dbOrders];
      }
  }

  // 2. Load from LocalStorage (Demo Orders)
  const localOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
  // Normalize local orders to match structure
  const normalizedLocal = localOrders.map(o => ({
      id: o.id,
      title: o.title,
      description: `Deadline: ${o.deadline} | Progress: ${o.status}`, // Mapping some fields
      status: o.status.toLowerCase(),
      created_at: new Date().toISOString(), // Recent
      is_local: true,
      price: o.price
  }));

  allOrders = [...normalizedLocal, ...allOrders];

  if (allOrders.length === 0) {
    ordersList.innerHTML = `
      <div style="text-align:center; padding:40px; background:white; border-radius:12px; border:1px solid #eee;">
        <ion-icon name="document-text-outline" style="font-size:3rem; color:#ccc;"></ion-icon>
        <p style="color:#666; margin:10px 0;">Anda belum memiliki pesanan aktif.</p>
        <a href="services.html" class="btn btn-primary">Buat Pesanan Baru</a>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = allOrders.map(order => {
    // Status styling
    let statusClass = "status-pending";
    const s = order.status ? order.status.toLowerCase() : 'pending';
    
    if (s.includes("proses")) statusClass = "status-proses";
    if (s.includes("selesai")) statusClass = "status-selesai";
    if (s.includes("menunggu")) statusClass = "status-pending";

    // Date formatting
    const date = new Date(order.created_at || Date.now()).toLocaleDateString("id-ID", {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });

    // Download button if finished
    let downloadHtml = "";
    if (s === "selesai" && order.file_url) {
      downloadHtml = `
        <a href="${order.file_url}" target="_blank" class="download-link">
          <ion-icon name="cloud-download-outline"></ion-icon> Download Hasil Pekerjaan
        </a>`;
    }

    // Price badge if local
    const priceHtml = order.price ? `<div style="margin-top:5px; font-weight:bold; color:var(--salmon-pink);">${order.price}</div>` : '';

    return `
      <div class="order-card" data-status="${s}">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
           <span class="status-badge ${statusClass}">${order.status || 'Pending'}</span>
           <span style="font-size:0.8rem; color:#999;">${date}</span>
        </div>
        
        <h3 class="order-title">${order.title}</h3>
        <p class="order-desc">${order.description || 'Layanan Jurnal'}</p>
        ${priceHtml}
        
        ${downloadHtml}
        
        <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
             <a href="order-details.html?id=${order.id}" style="font-size:0.85rem; text-decoration:none; color:var(--sonic-silver);">
                <ion-icon name="eye-outline"></ion-icon> Lihat Detail
             </a>
        </div>
      </div>
    `;
  }).join("");
}

loadOrders();

