# 🇨🇮 IVOIRE KICKS — Le Temple de la Sneaker en Côte d'Ivoire

**IVOIRE KICKS** est une boutique e-commerce moderne et haut de gamme de sneakers et baskets authentiques, spécialement conçue pour le marché ivoirien (Abidjan et intérieur du pays), avec intégration de paiement **SasPay** (Wave, Orange Money, MTN MoMo, Moov Money, Carte), Wave direct et Cash à la livraison.

> 👨‍💻 **Fondateur & Développeur :** [Bakayoko Sory](https://portfolio-gules-six-86.vercel.app/)  
> 📧 **Email :** [sorybakayoko012@gmail.com](mailto:sorybakayoko012@gmail.com)  
> 📱 **WhatsApp & Infoline :** [+225 05 56 96 78 45](https://wa.me/2250556967845)  
> 🌐 **Site Web :** [https://ivoire-kicks.vercel.app/](https://ivoire-kicks.vercel.app/)  

---

## ✨ Fonctionnalités Clés

- 🛒 **Panier interactif & dynamique** : sélection de pointures, gestion des quantités, calcul automatique.
- 💳 **Passerelle de Paiement SasPay & Mobile Money ivoirien** :
  - **SasPay Gateway** : Encaissage unifié (Wave CI, Orange Money, MTN MoMo, Moov Money, Carte Bancaire).
  - **Wave Direct** : Envoi direct et rapide vers le numéro marchand `05 56 96 78 45`.
  - **Orange Money CI** : Transfert direct via `#144#` ou l'application *Max it*.
  - **MTN Mobile Money** : Validation via `*133#` (*MoMo*).
  - **Cash à la livraison** : Règlement en espèces ou Wave auprès du livreur à Abidjan après essayage.
- 🚚 **Livraison ciblée Côte d'Ivoire** : calcul automatique des frais pour les 10+ communes d'Abidjan et les grandes villes de l'intérieur (Bouaké, Yamoussoukro, San-Pédro, Korhogo, etc.).
- 💬 **Confirmation instantanée par WhatsApp** : génération automatique d'un récapitulatif détaillé avec panier et adresse prêt à envoyer en 1 clic.
- 📦 **Double Persistance Cloud & Locale** :
  - **Supabase Cloud (PostgreSQL)** : Base de données en temps réel avec Row Level Security (RLS).
  - **API PHP / MySQL** : Backend REST prêt à l'emploi.
  - **LocalStorage de secours** : Sauvegarde hors-ligne instantanée si le réseau est indisponible.
- 🔒 **Sécurité renforcée** : En-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options, XSS Protection).
- 📈 **SEO & Référencement Google CI** : Balises Open Graph, Twitter Cards, Schema.org ShoeStore et sitemap XML complet.

---

## 🛠️ Stack Technique

- **Frontend** : HTML5 sémantique, CSS3 moderne (design responsive), JavaScript Vanilla ES6+
- **Base de données Cloud** : Supabase (PostgreSQL 15)
- **API Backend** : PHP 8+ / MySQL PDO
- **Paiements** : SasPay CI API & liens directs Wave CI
- **Hébergement & Déploiement** : Vercel

---

## 📁 Structure du Projet

```
IVOIRE KICKS/
├── index.html            # Interface vitrine et boutique principale
├── styles.css            # Feuille de styles moderne et responsive
├── script.js             # Logique métier, panier, SasPay et WhatsApp
├── supabase.js           # Connecteur client Supabase Cloud
├── supabase_setup.sql    # Schéma SQL PostgreSQL pour Supabase
├── database.sql          # Schéma SQL MySQL pour serveur PHP
├── favicon.png           # Favicon officiel IVOIRE KICKS
├── api/                  # API REST PHP
│   ├── config.php        # Configuration PDO & en-têtes CORS
│   ├── orders.php        # Traitement et validation des commandes
│   └── products.php      # Service catalogue produits
├── images/               # Photos haute résolution des sneakers & logos
├── vercel.json           # Configuration de routage et sécurité Vercel
├── robots.txt            # Directives d'indexation pour robots d'exploration
└── sitemap.xml           # Plan du site pour Google Search Console
```

---

## 🚀 Déploiement sur Vercel

1. Pousser le code sur votre dépôt GitHub :
   ```bash
   git add .
   git commit -m "Branding complet IVOIRE KICKS, favicon, SasPay & contacts"
   git push origin main
   ```
2. Connecter le projet sur [Vercel](https://vercel.com) en sélectionnant votre dépôt GitHub.
3. Le site se déploie instantanément sans aucune configuration complexe.

---

🇨🇮 **IVOIRE KICKS** — *C'est ton moment. Sneakers & Baskets à Abidjan, livraison partout en Côte d'Ivoire.*
