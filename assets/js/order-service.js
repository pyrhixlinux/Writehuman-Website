import { supabase, getSession } from './supabase-client.js';
import { showToast } from './toast.js';

export async function submitOrder(orderData) {
    // 1. Check Authentication
    const session = await getSession();
    if (!session) {
        // Not logged in -> Redirect to Login
        // Store order data in localStorage to retrieve later (Optional v2)
        showToast("Silakan login terlebih dahulu untuk memesan.", "error");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 2. Prepare Payload
    const payload = {
        user_id: userId,
        title: orderData.title,
        description: orderData.description || '',
        service_type: orderData.service,
        status: 'Menunggu Konfirmasi',
        price: orderData.price,
        deadline: orderData.deadline,
        // If you have file upload, handle it separately or store URL here
        file_url: orderData.file_url || null 
    };

    // 3. Insert into Supabase
    const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select();

    if (error) {
        console.error('Order Error:', error);
        showToast("Gagal membuat pesanan: " + error.message, "error");
        return false;
    }

    // 4. Success
    showToast("Pesanan Berhasil Dibuat!", "success");
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
    return true;
}
