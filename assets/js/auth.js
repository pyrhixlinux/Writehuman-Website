import { supabase, redirectIfAuthenticated } from "./supabase-client.js";
import { showToast } from "./toast.js";

// Check if user is already logged in
await redirectIfAuthenticated();

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = loginForm.querySelector("button");
    
    btn.disabled = true;
    btn.innerHTML = `<span class="loader"></span> Loading...`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = "Login";
    } else {
      showToast("Login Berhasil!", 'success');
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    }
  });
}

// REGISTER
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const btn = registerForm.querySelector("button");

    btn.disabled = true;
    btn.innerHTML = `<span class="loader"></span> Mendaftar...`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = "Daftar Akun Baru";
    } else {
      showToast("Sukses! Cek email Anda untuk verifikasi.", 'success');
      btn.disabled = false;
      btn.textContent = "Daftar Akun Baru";
      registerForm.reset();
    }
  });
}

// GOOGLE AUTH
const googleBtn = document.getElementById("google-login");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard.html",
      },
    });

    if (error) {
      showToast(error.message, 'error');
    }
  });
}
