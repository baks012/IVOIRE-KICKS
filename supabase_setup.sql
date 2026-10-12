-- =========================================================================
-- KICKORA - Schéma Base de Données Supabase (PostgreSQL)
-- Thème : E-commerce de Sneakers en Côte d'Ivoire (Abidjan)
-- =========================================================================
-- Instructions : 
-- 1. Connectez-vous sur votre tableau de bord Supabase (https://supabase.com).
-- 2. Rendez-vous dans la section "SQL Editor" (Éditeur SQL).
-- 3. Créez une "New query", collez l'intégralité de ce script et cliquez sur "Run".
-- =========================================================================

-- Activer l'extension UUID pour générer des identifiants uniques
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE DES PRODUITS (Catalogue KICKORA)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT 'Nike',
    category VARCHAR(100) DEFAULT 'Sneakers',
    description TEXT,
    price_fcfa INTEGER NOT NULL,          -- Prix de vente réel en FCFA
    old_price_fcfa INTEGER,               -- Prix barré en FCFA
    image_url VARCHAR(500) NOT NULL,
    available_sizes TEXT[] DEFAULT ARRAY['39', '40', '41', '42', '43', '44', '45'],
    stock_quantity INTEGER DEFAULT 15,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES COMMANDES (Clients & Livraisons CI)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_ref VARCHAR(50) UNIQUE NOT NULL,      -- Exemple: KCK-CI-84729
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,       -- Format ivoirien: +225 07...
    customer_city VARCHAR(100) NOT NULL,        -- Abidjan, Bouaké, Yamoussoukro, etc.
    customer_commune VARCHAR(100),              -- Cocody, Yopougon, Marcory, Plateau...
    customer_address TEXT NOT NULL,             -- Repère ou rue
    payment_method VARCHAR(50) NOT NULL,        -- 'wave', 'orange_money', 'mtn_money', 'cash'
    payment_status VARCHAR(50) DEFAULT 'en_attente', -- 'paye', 'en_attente', 'a_la_livraison'
    subtotal INTEGER NOT NULL,                  -- Sous-total en FCFA
    shipping_fee INTEGER NOT NULL,              -- Frais de livraison en FCFA
    total_amount INTEGER NOT NULL,              -- Total en FCFA
    status VARCHAR(50) DEFAULT 'nouvelle',      -- 'nouvelle', 'en_preparation', 'en_cours_de_livraison', 'livree', 'annulee'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES ARTICLES DE COMMANDE
CREATE TABLE IF NOT EXISTS public.order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_ref VARCHAR(50) NOT NULL,
    product_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    product_size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES AVIS CLIENTS (Abidjan & Villes de CI)
CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,            -- Ex: Cocody Angré, Marcory Zone 4
    comment TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    verified_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security - RLS)
-- =========================================================================

-- Activer RLS sur les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Les visiteurs peuvent LIRE le catalogue de produits actifs
CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Les visiteurs peuvent CRÉER une commande en ligne (Checkout)
CREATE POLICY "Public can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Les visiteurs peuvent insérer les articles de leur commande
CREATE POLICY "Public can insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- Les visiteurs peuvent LIRE les avis clients
CREATE POLICY "Public can view reviews" 
ON public.reviews FOR SELECT 
USING (true);

-- =========================================================================
-- DONNÉES INITIALES (Produits réels KICKORA & Prix en FCFA)
-- =========================================================================

INSERT INTO public.products (name, brand, price_fcfa, old_price_fcfa, image_url, is_featured, rating) VALUES
('Nike Dunk Low Retro Panda', 'Nike', 32000, 40000, 'images/shoe-panda-dunk.png', true, 5.0),
('Nike Shox TL Triple Black', 'Nike', 45000, 55000, 'images/shoe-shox-black.png', true, 5.0),
('Air Jordan 1 High Royal Blue', 'Jordan', 48000, 60000, 'images/shoe-high-blackblue.png', true, 4.9),
('Nike Air Max 270 Pure Platinum', 'Nike', 38000, 48000, 'images/shoe-airmax270-bubble.png', true, 4.8),
('Nike Air Force 1 Chrome Swoosh', 'Nike', 35000, 45000, 'images/shoe-swoosh-chrome.png', false, 4.9),
('VaporMax Neon Teal Glow', 'Nike', 42000, 52000, 'images/shoe-teal-futuristic.png', false, 4.8),
('Urban Chic Swirl Pink Edition', 'Custom', 34000, 42000, 'images/shoe-pink-swirl.png', false, 4.7),
('Jordan Retro High OG Royal', 'Jordan', 49000, 62000, 'images/shoe-high-royal.png', false, 5.0)
ON CONFLICT DO NOTHING;

-- Avis clients ivoiriens authentiques
INSERT INTO public.reviews (customer_name, location, comment, rating) VALUES
('Kouassi Jean-Marc', 'Cocody Angré 8ème Tranche', 'Livraison super rapide en moins de 3 heures ! Paire de Shox originale, exactement conforme à la photo. Paiement direct par Wave au livreur.', 5),
('Aïcha Koné', 'Marcory Zone 4', 'J ai pris la Air Max 270 en pointure 38. La taille est parfaite, le livreur m a attendu pour que j essaye. Service client WhatsApp très réactif.', 5),
('Cédric Bahi', 'Yopougon Maroc', 'Franchement le style est au rendez-vous. La Jordan Royal Blue est lourde ! Merci KICKORA pour le sérieux.', 5)
ON CONFLICT DO NOTHING;
