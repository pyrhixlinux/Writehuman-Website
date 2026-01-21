import { supabase, requireAuth } from "./supabase-client.js";
import { showToast } from "./toast.js";

// Strict Auth Check
await requireAuth();

// Logout
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.replace("login.html");
});

const container = document.getElementById("admin-orders");

async function loadAdminOrders() {
  // Fetch ALL orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return container.innerHTML = `<p style="color:red; text-align:center">Gagal memuat: ${error.message}</p>`;

  if (!orders || orders.length === 0) {
     container.innerHTML = `<div style="text-align:center; padding:50px; color:#999;">Tidak ada pesanan masuk.</div>`;
     return;
  }

  container.innerHTML = orders.map(o => `
    <div class="order-card" data-id="${o.id}" data-status="${o.status}">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
        <div>
            <h3 class="order-title">${o.title}</h3>
            <div style="font-size:0.75rem; color:#aaa; margin-top:2px;">User ID: ${o.user_id}</div>
        </div>
        <span class="status-badge status-${o.status}">${o.status}</span>
      </div>
      
      <p class="order-desc" style="border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
        ${o.description || 'Tidak ada deskripsi.'}
      </p>
      
      <!-- Controls -->
      <div class="admin-controls">
        <label style="font-size:0.8rem; font-weight:600; display:block; margin-bottom:5px; color:#555;">Update Status:</label>
        <div class="admin-row">
            <select class="status-select">
              <option value="pending" ${o.status=='pending'?'selected':''}>Pending</option>
              <option value="proses" ${o.status=='proses'?'selected':''}>Proses</option>
              <option value="selesai" ${o.status=='selesai'?'selected':''}>Selesai</option>
            </select>
            <button class="btn btn-primary btn-sm btn-update">Simpan</button>
        </div>
      </div>

      <div class="admin-controls" style="border-top:none; padding-top:0;">
        <label style="font-size:0.8rem; font-weight:600; display:block; margin-bottom:5px; color:#555;">Upload Hasil Kerja:</label>
        <div class="admin-row">
            <input type="file" class="file-input">
            <button class="btn btn-primary btn-sm btn-upload">Upload & Kirim</button>
        </div>
        ${o.file_url ? `<div style="margin-top:10px;"><a href="${o.file_url}" target="_blank" style="color:green; font-weight:600; font-size:0.9rem; text-decoration:none;">✅ File Sudah Diupload</a></div>` : ''}
      </div>

    </div>
  `).join("");

  // Event Listeners (Delegation)
  container.addEventListener('click', async (e) => {
    const target = e.target;
    const btn = target.closest('button'); // Handle icon clicks
    if (!btn) return;
    
    const card = btn.closest('.order-card');
    if (!card) return;
    
    const id = card.dataset.id;

    // UPDATE STATUS ACTION
    if (btn.classList.contains('btn-update')) {
        const select = card.querySelector('.status-select');
        const status = select.value;
        
        const originalText = btn.textContent;
        btn.textContent = "...";
        btn.disabled = true;

        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        
        if (error) {
           showToast(error.message, 'error');
        } else {
           showToast("Status diperbarui!", 'success');
           // Update Badge Color Locally
           const badge = card.querySelector('.status-badge');
           badge.className = `status-badge status-${status}`;
           badge.textContent = status;
           card.setAttribute('data-status', status);
           card.style.borderLeftColor = status === 'pending' ? '#ffca28' : status === 'proses' ? '#42a5f5' : '#66bb6a';
        }
        btn.textContent = originalText;
        btn.disabled = false;
    }

    // UPLOAD FILE ACTION
    if (btn.classList.contains('btn-upload')) {
        const fileInput = card.querySelector('.file-input');
        const file = fileInput.files[0];
        
        if(!file) return showToast('Pilih file dulu!', 'info');
        
        btn.textContent = "Mengunggah...";
        btn.disabled = true;

        const path = `${id}/${file.name}`;
        
        // 1. Upload to Storage
        const { error: upErr } = await supabase.storage.from('order-results').upload(path, file, { upsert: true });
        
        if(upErr) {
            showToast("Upload Gagal: " + upErr.message, 'error');
            btn.textContent = "Upload & Kirim";
            btn.disabled = false;
            return;
        }

        // 2. Generate Signed URL (7 hari)
        const { data: signData } = await supabase.storage.from('order-results').createSignedUrl(path, 604800);

        // 3. Save URL to Database & Set status to Selesai
        const { error: dbErr } = await supabase.from('orders').update({
            status: 'selesai',
            file_url: signData.signedUrl
        }).eq('id', id);

        if(dbErr) {
           showToast("DB Error: " + dbErr.message, 'error');
        } else {
            showToast("File terupload & Order Selesai!", 'success');
            // Refresh page to show link
            setTimeout(() => window.location.reload(), 1000);
        }
    }
  });
}

loadAdminOrders();
