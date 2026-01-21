import { supabase, requireAuth } from "./supabase-client.js";
import { showToast } from "./toast.js";

// Strict Auth Check
const session = await requireAuth();

// Form Handling
const form = document.getElementById("order-form");
if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const btn = form.querySelector("button");

      // Disable button
      btn.disabled = true;
      btn.innerHTML = `<span class="loader"></span> Mengirim...`;

      // Insert strict RLS compliant data
      const { error } = await supabase.from("orders").insert({
        user_id: session.user.id, // Explicitly set user_id
        title: title,
        description: description,
        status: "pending"
      });

      if (error) {
        showToast("Error: " + error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = `<ion-icon name="paper-plane-outline"></ion-icon> Kirim Pesanan`;
      } else {
        showToast("Pesanan berhasil dibuat!", 'success');
        // Redirect after delay
        setTimeout(() => {
            window.location.replace("dashboard.html");
        }, 1500);
      }
    });
}
