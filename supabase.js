/**
 * =========================================================================
 * IVOIRE KICKS - Configuration & Intégration Supabase (Côte d'Ivoire)
 * =========================================================================
 * Ce fichier gère la persistance en temps réel dans votre base Supabase :
 * - Enregistrement des commandes clients (Wave, OM, MTN, SasPay, Cash)
 * - Récupération dynamique des produits
 * - Avis clients vérifiés
 *
 * Pour connecter votre propre projet Supabase :
 * 1. Rendez-vous sur https://supabase.com et créez un projet gratuit.
 * 2. Allez dans Paramètres du Projet -> API.
 * 3. Copiez l'URL du projet et la clé 'anon public', puis collez-les ci-dessous.
 * 4. Exécutez le script SQL 'supabase_setup.sql' dans l'éditeur SQL de Supabase.
 * =========================================================================
 */

const SUPABASE_CONFIG = {
    // Remplacez par vos identifiants Supabase (ou laissez les placeholders pour le mode démo)
    url: 'https://votre-projet-id.supabase.co',
    anonKey: 'votre_cle_anon_publique_supabase_ici',
    // Activer ou désactiver le mode démo hors-ligne
    isConfigured: function() {
        return this.url !== 'https://votre-projet-id.supabase.co' && 
               this.anonKey !== 'votre_cle_anon_publique_supabase_ici';
    }
};

// Initialisation du client Supabase
let supabaseClient = null;

if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.isConfigured()) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ IVOIRE KICKS : Connecté avec succès à Supabase Cloud');
    } catch (e) {
        console.warn('⚠️ IVOIRE KICKS : Impossible d\'initialiser Supabase. Mode local actif.', e);
    }
} else {
    console.info('ℹ️ IVOIRE KICKS : Mode démonstration actif. Pour activer la sauvegarde cloud, renseignez vos clés dans supabase.js');
}

/**
 * Enregistrer une commande dans Supabase
 * @param {Object} orderData Données de la commande
 * @returns {Promise<Object>} Résultat de l'insertion
 */
async function saveOrderToSupabase(orderData) {
    if (!supabaseClient) {
        // Enregistrement local de secours (LocalStorage)
        const localOrders = JSON.parse(localStorage.getItem('ivoire_kicks_orders') || localStorage.getItem('kickora_orders') || '[]');
        localOrders.push({
            ...orderData,
            saved_at: new Date().toISOString(),
            storage_type: 'local_storage_backup'
        });
        localStorage.setItem('ivoire_kicks_orders', JSON.stringify(localOrders));
        
        return {
            success: true,
            mode: 'local',
            order_ref: orderData.reference,
            message: 'Commande enregistrée localement (Supabase non configuré).'
        };
    }

    try {
        // 1. Insertion de la commande principale
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert([{
                order_ref: orderData.reference,
                customer_name: orderData.customer.name,
                customer_phone: orderData.customer.phone,
                customer_city: orderData.customer.city,
                customer_commune: orderData.customer.commune,
                customer_address: orderData.customer.address,
                payment_method: orderData.paymentMethod,
                payment_status: orderData.paymentMethod === 'cash' ? 'a_la_livraison' : 'en_attente',
                subtotal: orderData.subtotal,
                shipping_fee: orderData.shippingFee,
                total_amount: orderData.total,
                status: 'nouvelle',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insertion des articles de la commande
        if (orderData.items && orderData.items.length > 0) {
            const itemsToInsert = orderData.items.map(item => ({
                order_id: order.id,
                order_ref: orderData.reference,
                product_id: item.id || null,
                product_name: item.name,
                product_size: item.size || 'Standard',
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await supabaseClient
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) console.warn('Erreur lors de l\'enregistrement des articles:', itemsError);
        }

        return {
            success: true,
            mode: 'supabase',
            order_id: order.id,
            order_ref: order.order_ref,
            message: 'Commande synchronisée avec succès dans Supabase !'
        };

    } catch (error) {
        console.error('Erreur Supabase Order:', error);
        
        // Sauvegarde de secours en cas d'erreur réseau
        const localOrders = JSON.parse(localStorage.getItem('ivoire_kicks_orders') || localStorage.getItem('kickora_orders') || '[]');
        localOrders.push(orderData);
        localStorage.setItem('ivoire_kicks_orders', JSON.stringify(localOrders));

        return {
            success: true,
            mode: 'fallback_local',
            order_ref: orderData.reference,
            error: error.message
        };
    }
}

/**
 * Récupérer les produits depuis Supabase (avec fallback catalogue local)
 */
async function getProductsFromSupabase() {
    if (!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('id', { ascending: true });

        if (error) throw error;
        return data;
    } catch (e) {
        console.warn('Erreur chargement produits Supabase, utilisation du catalogue local:', e);
        return null;
    }
}

// Exposer globalement
window.IVOIRE_KICKS_SUPABASE = {
    saveOrder: saveOrderToSupabase,
    getProducts: getProductsFromSupabase,
    isReady: () => !!supabaseClient
};

// Alias de compatibilité
window.KICKORA_SUPABASE = window.IVOIRE_KICKS_SUPABASE;
