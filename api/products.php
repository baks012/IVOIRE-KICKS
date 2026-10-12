<?php
/**
 * =========================================================================
 * IVOIRE KICKS - API Catalogue Produits (PHP / MySQL)
 * =========================================================================
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(false, [], 'Méthode non autorisée. Utilisez GET.', 405);
}

if (!$pdo) {
    sendJsonResponse(false, [], 'Base de données non disponible.', 500);
}

try {
    $featuredOnly = isset($_GET['featured']) && $_GET['featured'] == '1';
    
    $sql = "SELECT * FROM `products` WHERE `is_active` = 1";
    if ($featuredOnly) {
        $sql .= " AND `is_featured` = 1";
    }
    $sql .= " ORDER BY `id` ASC";

    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll();

    sendJsonResponse(true, $products, 'Catalogue chargé avec succès.');

} catch (Exception $e) {
    sendJsonResponse(false, ['error' => $e->getMessage()], 'Erreur lors du chargement des produits.', 500);
}
