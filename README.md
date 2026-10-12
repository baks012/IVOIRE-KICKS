# 🇨🇮 KICKORA - Le Temple de la Sneaker en Côte d'Ivoire

Bienvenue sur le projet **KICKORA**, site e-commerce de sneakers et baskets conçu sur mesure pour le marché de **Côte d'Ivoire (Abidjan et intérieur du pays)**.

> 👨‍💻 **Créé et développé par :** [Bakayoko Sory](https://portfolio-gules-six-86.vercel.app/)

---

## 🚀 Fonctionnalités Clés

- **Design Moderne & Streetwear Ivoirien** : Palette nationale harmonieuse (Orange chaleureux, Vert profond, Blanc pur et Dark Sneakerhead).
- **Prix Réels du Marché en FCFA** : Basés sur les prix réels constatés à Abidjan (Nike Dunk, Shox TL, Air Max 270, Jordan 1 Retro, etc.).
- **Paiements Ivoiriens Intégrés** :
  - 🌊 **Wave Côte d'Ivoire** (avec numéro marchand et référence automatique)
  - 🟧 **Orange Money CI** (#144# / Max it)
  - 🟨 **MTN Mobile Money** (*133# MoMo)
  - 💵 **Paiement Cash à la livraison** (Abidjan avec essayage sur place)
  - 💬 **Confirmation instantanée par WhatsApp** (génération d'un récapitulatif prêt à envoyer en un clic)
- **Logistique & Livraison CI** :
  - Abidjan Express (Cocody, Yopougon, Marcory, Plateau, Koumassi, Treichville, Port-Bouët, Abobo, etc.)
  - Expédition 48h vers l'intérieur du pays (Bouaké, Yamoussoukro, San-Pédro, Korhogo, etc.)
  - Calcul dynamique des frais de livraison (Offerte dès 70 000 FCFA).
- **Panier & Sélecteur de Pointures** : Pointures 39 à 45 sélectionnables, tiroir panier coulissant, calcul en temps réel.
- **Base de Données Cloud Supabase** : Tables `products`, `orders`, `order_items`, `reviews` avec RLS (Row Level Security).
- **Backend PHP & MySQL** : API REST sécurisée avec PDO transactionnel (`api/orders.php`, `api/products.php`).
- **Prêt pour Vercel** : Fichier `vercel.json` configuré avec en-têtes de sécurité stricts (CSP, HSTS, X-Frame-Options).
- **Optimisé pour Google (SEO)** : Balises Open Graph, balisage Schema.org JSON-LD ShoeStore, `robots.txt` et `sitemap.xml`.

---

## 📁 Structure des Fichiers

```text
KICKORA/
├── images/                   # Vos images réelles de sneakers, logos et bannières
├── index.html                # Frontend complet avec SEO Google et structure e-commerce
├── styles.css                # Design system ivoirien, responsive mobile & animations
├── script.js                 # Panier, sliders, calcul livraison, paiement & WhatsApp
├── supabase.js               # Client Supabase Cloud & sauvegarde locale de secours
├── supabase_setup.sql        # Script SQL à exécuter dans Supabase (Tables + RLS)
├── database.sql              # Schéma MySQL pour hébergement PHP (phpMyAdmin / cPanel)
├── api/
│   ├── config.php            # Connexion PDO sécurisée & headers CORS
│   ├── orders.php            # Traitement sécurisé des commandes clients
│   └── products.php          # Catalogue de produits MySQL
├── vercel.json               # Configuration de déploiement et sécurité Vercel
├── robots.txt                # Directives d'indexation pour Googlebot
├── sitemap.xml               # Plan du site pour Google Search Console
└── README.md                 # Guide de déploiement et configuration
```

---

## 🛠️ Guide de Déploiement Étape par Étape

### 1. Pousser le Code sur GitHub

Ouvrez un terminal dans le dossier `KICKORA` et tapez :

```bash
git init
git add .
git commit -m "Initial commit - KICKORA Sneaker Store CI"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/KICKORA.git
git push -u origin main
```

---

### 2. Déployer sur Vercel (En 2 minutes)

1. Rendez-vous sur [Vercel](https://vercel.com) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **"Add New..."** -> **"Project"**.
3. Sélectionnez votre dépôt **KICKORA** puis cliquez sur **"Deploy"**.
4. Vercel déploie automatiquement votre site avec HTTPS gratuit et CDN mondial ultra-rapide.

---

### 3. Configurer la Base de Données Supabase

1. Créez un compte gratuit sur [Supabase](https://supabase.com) et créez un projet (choisissez une région proche, ex: *West Europe*).
2. Dans le menu de gauche, allez dans **"SQL Editor"** -> **"New query"**.
3. Ouvrez le fichier `supabase_setup.sql`, copiez tout son contenu, collez-le dans l'éditeur Supabase et cliquez sur **"Run"**. Vos tables (`orders`, `products`, `order_items`, `reviews`) sont créées avec les règles de sécurité.
4. Rendez-vous dans **Project Settings** -> **API**.
5. Copiez :
   - **Project URL**
   - **anon public key**
6. Ouvrez le fichier `supabase.js` sur votre projet et collez-les dans `SUPABASE_CONFIG` :
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://votre-projet-id.supabase.co',
       anonKey: 'votre_cle_anon_publique'
   };
   ```
7. Poussez à nouveau sur GitHub (`git commit -am "Supabase keys" && git push`), Vercel se mettra à jour automatiquement !

---

### 4. Indexer votre Site sur Google

Pour que les internautes ivoiriens trouvent votre site en tapant *"baskets abidjan"*, *"sneakers cote d'ivoire"*, etc. :

1. Rendez-vous sur [Google Search Console](https://search.google.com/search-console).
2. Ajoutez votre domaine Vercel (ex: `https://kickora.vercel.app`).
3. Validez la propriété (via balise HTML ou DNS).
4. Allez dans l'onglet **Sitemaps** et soumettez l'adresse de votre plan de site :
   ```text
   https://kickora.vercel.app/sitemap.xml
   ```
5. Google commencera à indexer vos pages et produits sous 24 à 48h.

---

### 5. Personnaliser vos Numéros de Téléphone

Dans `script.js`, modifiez les paramètres pour mettre vos coordonnées réelles :
```javascript
const KICKORA_STORE = {
  name: "KICKORA",
  whatsappPhone: "2250700000000",      // Remplacez par votre numéro WhatsApp de vente
  wavePaymentNumber: "07 00 00 00 00", // Votre numéro marchand Wave CI
};
```

---

## 🔒 Sécurité Intégrée

- **En-têtes HTTP Sécurisés** : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.
- **Validation Côté Client & Serveur** : Contrôle du format des téléphones ivoiriens (10 chiffres).
- **Row Level Security (RLS)** sur Supabase empêchant la modification non autorisée des commandes par des tiers.
- **Requêtes PDO Préparées** sur PHP empêchant toute injection SQL.

---

🇨🇮 **KICKORA** - Développé pour propulser le commerce de sneakers en Côte d'Ivoire.
