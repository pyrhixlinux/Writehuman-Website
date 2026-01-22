import { supabase, getSession } from "./supabase-client.js";
import { showToast } from "./toast.js";

/**
 * Submit order to Supabase or save to localStorage if not logged in
 * @param {Object} orderData - Order data object
 * @returns {boolean} - Success status
 */
export async function submitOrder(orderData) {
    try {
        // Check session
        const session = await getSession();

        if (!session) {
            // Save to localStorage for guest checkout
            const pendingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
            
            const newOrder = {
                id: 'local-' + Date.now(),
                ...orderData,
                created_at: new Date().toISOString()
            };
            
            pendingOrders.unshift(newOrder);
            localStorage.setItem('myOrders', JSON.stringify(pendingOrders));
            
            showToast('Pesanan disimpan! Silakan login untuk melanjutkan.', 'info');
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return true;
        }

        // User is logged in - insert to Supabase
        // Combine extra info into description since schema only has: title, description, status, file_url
        const fullDescription = [
            orderData.description,
            orderData.service ? `Layanan: ${orderData.service}` : '',
            orderData.price ? `Harga: ${orderData.price}` : '',
            orderData.deadline ? `Deadline: ${orderData.deadline}` : ''
        ].filter(Boolean).join(' | ');

        const { error } = await supabase.from("orders").insert({
            user_id: session.user.id,
            title: orderData.title,
            description: fullDescription,
            status: 'pending', // Must be: pending, proses, or selesai per schema constraint
            file_url: orderData.file_url
        });

        if (error) {
            console.error('Order Error:', error);
            showToast('Gagal membuat pesanan: ' + error.message, 'error');
            return false;
        }

        showToast('Pesanan berhasil dibuat!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

        return true;

    } catch (err) {
        console.error('Submit Order Error:', err);
        showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        return false;
    }
}
