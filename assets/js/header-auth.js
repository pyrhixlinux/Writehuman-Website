import { getSession } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const authBtn = document.querySelector('.header-user-actions .action-btn ion-icon[name="person-outline"]').parentElement;
    
    if (authBtn) {
        const session = await getSession();
        
        if (session) {
            // User is logged in -> Go to Dashboard
            authBtn.setAttribute('title', 'Dashboard Saya');
            authBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
            
            // Optional: Add a small indicator
            authBtn.style.color = 'var(--salmon-pink)';
        } else {
            // User is logged out -> Go to Login
            authBtn.setAttribute('title', 'Login / Register');
            authBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }
});
