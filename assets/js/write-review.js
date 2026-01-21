import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Only run if the review section exists on the page
    const section = document.querySelector('.write-review-section'); 
    // Or check if form exists. In index.html it might be loaded via 'components/write-review.html' using html-loader.js
    // Since html-loader.js injects HTML dynamically, we need to wait or rely on event delegation.
    // The previous implementation used a custom event 'componentsLoaded'. Let's keep that pattern if possible,
    // or just use event delegation on document.body for simplicity and robustness.

    document.body.addEventListener('click', (e) => {
        // Star Rating Logic (Delegation)
        if (e.target.closest('.stars ion-icon')) {
            const star = e.target.closest('ion-icon');
            const starsContainer = star.closest('.stars');
            if (!starsContainer) return;
            
            const allStars = starsContainer.querySelectorAll('ion-icon');
            const value = star.getAttribute('data-value');
            const input = document.getElementById('review-rating-value');
            if(input) input.value = value;

            allStars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.setAttribute('name', 'star');
                    s.style.color = '#ffb700';
                } else {
                    s.setAttribute('name', 'star-outline');
                    s.style.color = '#ff9900';
                }
            });
        }
    });

    // Form Submission (Delegation)
    document.body.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('review-form')) {
            e.preventDefault();
            const form = e.target;
            
            // Check Auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Anda harus login untuk mengirim ulasan.");
                window.location.href = "login.html";
                return;
            }

            const formData = new FormData(form);
            const rating = formData.get('rating');
            const comment = formData.get('comment');

            if (!rating || rating == "0") {
                alert("Pilih bintang dulu!");
                return;
            }

            const { error } = await supabase.from('reviews').insert({
                user_id: user.id,
                rating: parseInt(rating),
                comment: comment
            });

            if (error) {
                alert("Gagal kirim review: " + error.message);
            } else {
                alert("Terima kasih! Review Anda berhasil dikirim.");
                form.reset();
                // Reset stars visually
                const stars = form.querySelectorAll('.stars ion-icon');
                stars.forEach(s => {
                    s.setAttribute('name', 'star-outline');
                });
            }
        }
    });

});
