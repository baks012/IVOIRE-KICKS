<?php
/**
 * =========================================================================
 * IVOIRE KICKS - Traitement Sécurisé des Commandes Clients (PHP / MySQL)
 * Enregistrement des paiements Wave, OM, MTN & Cash à la livraison
 * =========================================================================
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, [], 'Méthode non autorisée. Utilisez POST.', 405);
}

// Récupération des données brutes
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    sendJsonResponse(false, [], 'Données JSON invalides ou manquantes.', 400);
}

// Vérification de la connexion BDD
if (!$pdo) {
    sendJsonResponse(false, [
        'error_detail' => isset($db_connection_error) ? $db_connection_error : 'Connexion BDD indisponible'
    ], 'Erreur de connexion à la base de données MySQL locale.', 500);
}

// Extraction et assainissement des champs
$orderRef      = !empty($input['reference']) ? htmlspecialchars(trim($input['reference'])) : 'IVK-CI-' . rand(10000, 99999);
$customerName  = !empty($input['customer']['name']) ? htmlspecialchars(trim($input['customer']['name'])) : '';
$customerPhone = !empty($input['customer']['phone']) ? htmlspecialchars(trim($input['customer']['phone'])) : '';
$customerCity  = !empty($input['customer']['city']) ? htmlspecialchars(trim($input['customer']['city'])) : 'Abidjan';
$customerCommune = !empty($input['customer']['commune']) ? htmlspecialchars(trim($input['customer']['commune'])) : '';
$customerAddress = !empty($input['customer']['address']) ? htmlspecialchars(trim($input['customer']['address'])) : '';
$paymentMethod = !empty($input['paymentMethod']) ? htmlspecialchars(trim($input['paymentMethod'])) : 'wave';
$subtotal      = isset($input['subtotal']) ? intval($input['subtotal']) : 0;
$shippingFee   = isset($input['shippingFee']) ? intval($input['shippingFee']) : 0;
$total         = isset($input['total']) ? intval($input['total']) : ($subtotal + $shippingFee);
$items         = !empty($input['items']) && is_array($input['items']) ? $input['items'] : [];

// Validation stricte
if (empty($customerName) || empty($customerPhone)) {
    sendJsonResponse(false, [], 'Veuillez renseigner votre nom complet et votre numéro de téléphone.', 422);
}

// Statut initial du paiement
$paymentStatus = ($paymentMethod === 'cash') ? 'a_la_livraison' : 'en_attente';

try {
    $pdo->beginTransaction();

    // 1. Insertion dans la table orders
    $stmt = $pdo->prepare("
        INSERT INTO `orders` 
        (`order_ref`, `customer_name`, `customer_phone`, `customer_city`, `customer_commune`, `customer_address`, `payment_method`, `payment_status`, `subtotal`, `shipping_fee`, `total_amount`, `status`) 
        VALUES 
        (:ref, :name, :phone, :city, :commune, :address, :payment, :p_status, :subtotal, :shipping, :total, 'nouvelle')
    ");

    $stmt->execute([
        ':ref'      => $orderRef,
        ':name'     => $customerName,
        ':phone'    => $customerPhone,
        ':city'     => $customerCity,
        ':commune'  => $customerCommune,
        ':address'  => $customerAddress,
        ':payment'  => $paymentMethod,
        ':p_status' => $paymentStatus,
        ':subtotal' => $subtotal,
        ':shipping' => $shippingFee,
        ':total'    => $total
    ]);

    $orderId = $pdo->lastInsertId();

    // 2. Insertion des articles de commande
    if (!empty($items)) {
        $itemStmt = $pdo->prepare("
            INSERT INTO `order_items` 
            (`order_id`, `order_ref`, `product_id`, `product_name`, `product_size`, `quantity`, `unit_price`, `total_price`) 
            VALUES 
            (:order_id, :order_ref, :prod_id, :prod_name, :prod_size, :qty, :unit_price, :total_price)
        ");

        foreach ($items as $item) {
            $pName  = !empty($item['name']) ? htmlspecialchars($item['name']) : 'Sneaker IVOIRE KICKS';
            $pSize  = !empty($item['size']) ? htmlspecialchars($item['size']) : '42';
            $pQty   = isset($item['quantity']) ? max(1, intval($item['quantity'])) : 1;
            $pPrice = isset($item['price']) ? intval($item['price']) : 0;
            $pTotal = $pPrice * $pQty;
            $pId    = isset($item['id']) ? intval($item['id']) : null;

            $itemStmt->execute([
                ':order_id'    => $orderId,
                ':order_ref'   => $orderRef,
                ':prod_id'     => $pId,
                ':prod_name'   => $pName,
                ':prod_size'   => $pSize,
                ':qty'         => $pQty,
                ':unit_price'  => $pPrice,
                ':total_price' => $pTotal
            ]);
        }
    }

    $pdo->commit();

    sendJsonResponse(true, [
        'order_id' => $orderId,
        'order_ref' => $orderRef,
        'total' => $total,
        'payment_method' => $paymentMethod
    ], 'Votre commande a été enregistrée avec succès chez IVOIRE KICKS !', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, ['error' => $e->getMessage()], 'Erreur interne lors de l\'enregistrement de la commande.', 500);
}
