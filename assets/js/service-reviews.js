import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('reviews-container');
    if (!container) return; // Only run on pages with this container

    // 1. Fake Testimonials (Static Data)
    const STATIC_REVIEWS = [
        {
            service: 'Jasa Skripsi',
            rating: 5,
            comment: "Alhamdulillah skripsi saya akhirnya kelar juga. Pembimbingannya enak, sabar banget jelasin bab 4 yang rumit.",
            name: "Rina S. (Univ. Brawijaya)",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
            service: 'Jasa Jurnal',
            rating: 5,
            comment: "Fast response! Submit sinta 3 lolos dalam sebulan. Revisi juga dibantuin sampe publish.",
            name: "Dimas A. (Dosen Praktisi)",
            created_at: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
            service: 'Jasa Parafrase',
            rating: 4,
            comment: "Turnitin turun dari 45% jadi 12%. Mantap, bahasa tetep nyambung gak kaku.",
            name: "Sarah (Mahasiswa S2)",
            created_at: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
            service: 'Cek Turnitin',
            rating: 5,
            comment: "Murah & cepet banget. Cuma 5 menit hasil udah dikirim via WA. Recommended!",
            name: "Fajar (UIN Jakarta)",
            created_at: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
        },
        {
            service: 'Jasa Desain',
            rating: 5,
            comment: "Desain PPT nya estetik banget, beda sama template pasaran. Dosen penguji suka visualnya.",
            name: "Tiara (FEB UI)",
            created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            service: 'Jasa Ketik',
            rating: 5,
            comment: "Ngetik ulang pdf 50 halaman rapi banget, format sesuai permintaan. Thanks min!",
            name: "Budi Santoso",
            created_at: new Date(Date.now() - 86400000 * 7).toISOString()
        },
        {
            service: 'Jasa Makalah',
            rating: 5,
            comment: "Makalahnya original, referensi jurnal semua valid. Aman buat tugas kuliah.",
            name: "Putri (UNPAD)",
            created_at: new Date(Date.now() - 86400000 * 10).toISOString()
        },
         {
            service: 'Jasa Editing',
            rating: 5,
            comment: "Typo di tesis ilang semua, kalimat jadi lebih efektif. Layout juga dirapihin.",
            name: "Kevin (Magister Hukum)",
            created_at: new Date(Date.now() - 86400000 * 4).toISOString()
        }
    ];

    // 2. Fetch Real Reviews from Supabase
    let realReviews = [];
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (!error && data) {
        realReviews = data;
    }

    // 3. Merge Data
    const allReviews = [...realReviews, ...STATIC_REVIEWS];

    if (allReviews.length === 0) {
        const noReviews = document.getElementById('no-reviews');
        if (noReviews) noReviews.style.display = 'block';
        
        // Remove spinner
        const spinner = container.querySelector('.loading-spinner');
        if(spinner) spinner.remove();
        
        return;
    }

    // 4. Render
    const html = allReviews.map(r => {
        const stars = Array(5).fill(0).map((_, i) => i < r.rating ? '<ion-icon name="star"></ion-icon>' : '<ion-icon name="star-outline"></ion-icon>').join('');
        const dateStr = new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return `
            <div class="review-card-premium">
                <div class="review-header">
                    <div class="reviewer-avatar">
                        ${r.name ? r.name.charAt(0) : 'U'}
                    </div>
                    <div class="reviewer-info">
                        <h4>${r.name || 'User Anonim'}</h4>
                        <span class="service-tag">${r.service || 'General'}</span>
                    </div>
                    <div class="review-date">${dateStr}</div>
                </div>
                <div class="review-stars">${stars}</div>
                <p class="review-body">"${r.comment}"</p>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
});
