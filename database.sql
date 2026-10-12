-- =========================================================================
-- KICKORA - Schéma Base de Données MySQL / MariaDB (PHP Backend)
-- Thème : E-commerce de Sneakers en Côte d'Ivoire (Abidjan)
-- =========================================================================
-- Compatible avec WampServer, XAMPP, cPanel, phpMyAdmin et serveurs Linux.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `kickora_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kickora_db`;

-- 1. TABLE DES PRODUITS
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(100) DEFAULT 'Nike',
    `category` VARCHAR(100) DEFAULT 'Sneakers',
    `description` TEXT NULL,
    `price_fcfa` INT NOT NULL,              -- Prix en FCFA
    `old_price_fcfa` INT NULL,              -- Prix barré
    `image_url` VARCHAR(500) NOT NULL,
    `available_sizes` VARCHAR(255) DEFAULT '39,40,41,42,43,44,45',
    `stock_quantity` INT DEFAULT 20,
    `is_featured` TINYINT(1) DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `rating` DECIMAL(2,1) DEFAULT 5.0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_ref` VARCHAR(50) UNIQUE NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(50) NOT NULL,       -- Format ivoirien (10 chiffres)
    `customer_city` VARCHAR(100) NOT NULL,        -- Ex: Abidjan
    `customer_commune` VARCHAR(100) NULL,         -- Ex: Cocody, Yopougon, Marcory
    `customer_address` TEXT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,        -- wave, orange_money, mtn_money, cash
    `payment_status` VARCHAR(50) DEFAULT 'en_attente', -- en_attente, paye, a_la_livraison
    `subtotal` INT NOT NULL,
    `shipping_fee` INT NOT NULL,
    `total_amount` INT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'nouvelle',      -- nouvelle, en_cours, livree, annulee
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLE DES ARTICLES DE COMMANDE
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `order_ref` VARCHAR(50) NOT NULL,
    `product_id` INT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_size` VARCHAR(20) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` INT NOT NULL,
    `total_price` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. DONNÉES DE BASE (Produits KICKORA Côte d'Ivoire)
INSERT INTO `products` (`name`, `brand`, `price_fcfa`, `old_price_fcfa`, `image_url`, `is_featured`, `rating`) VALUES
('Nike Dunk Low Retro Panda', 'Nike', 32000, 40000, 'images/shoe-panda-dunk.png', 1, 5.0),
('Nike Shox TL Triple Black', 'Nike', 45000, 55000, 'images/shoe-shox-black.png', 1, 5.0),
('Air Jordan 1 High Royal Blue', 'Jordan', 48000, 60000, 'images/shoe-high-blackblue.png', 1, 4.9),
('Nike Air Max 270 Pure Platinum', 'Nike', 38000, 48000, 'images/shoe-airmax270-bubble.png', 1, 4.8),
('Nike Air Force 1 Chrome Swoosh', 'Nike', 35000, 45000, 'images/shoe-swoosh-chrome.png', 0, 4.9),
('VaporMax Neon Teal Glow', 'Nike', 42000, 52000, 'images/shoe-teal-futuristic.png', 0, 4.8),
('Urban Chic Swirl Pink Edition', 'Custom', 34000, 42000, 'images/shoe-pink-swirl.png', 0, 4.7),
('Jordan Retro High OG Royal', 'Jordan', 49000, 62000, 'images/shoe-high-royal.png', 0, 5.0);
