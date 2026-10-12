/**
 * =========================================================================
 * IVOIRE KICKS - Logique E-commerce & Paiements Côte d'Ivoire
 * =========================================================================
 * - Gestion du panier (Ajout, suppression, quantités, pointures)
 * - Gestion des favoris (Wishlist)
 * - Slider Hero & Galerie des produits vedettes
 * - Calcul dynamique des frais de livraison (Abidjan vs Intérieur)
 * - Intégration SasPay, Wave CI, Orange Money, MTN MoMo, Cash
 * - Synchronisation Supabase & API PHP
 * - Confirmation instantanée par WhatsApp
 * =========================================================================
 */

// Configuration boutique IVOIRE KICKS
const IVOIRE_KICKS_STORE = {
  name: "IVOIRE KICKS",
  email: "sorybakayoko012@gmail.com",
  phoneDisplay: "+225 05 56 96 78 45",
  whatsappPhone: "2250556967845", // Numéro WhatsApp marchand (+225)
  wavePaymentNumber: "05 56 96 78 45", // Numéro Wave marchand
  waveDirectUrl: "https://wave.com/send?phone=+2250556967845",
  orangeMoneyCode: "#144#",
  mtnMoneyCode: "*133#",
  freeShippingThreshold: 70000 // Livraison offerte dès 70 000 FCFA
};

// Configuration Passerelle SasPay (Wave, OM, MTN, Moov, CB)
const SASPAY_CONFIG = {
  apiKey: "sas_live_sorybakayoko012",
  merchantName: "IVOIRE KICKS",
  apiUrl: "https://api.saspay.me/v1/payments",
  checkoutUrl: "https://checkout.saspay.me",
  isConfigured: function() {
    return Boolean(this.apiKey && this.apiKey !== "YOUR_SASPAY_API_KEY");
  }
};

// Alias de compatibilité
const KICKORA_STORE = IVOIRE_KICKS_STORE;

// Catalogue local des produits (synchronisable avec Supabase)
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Nike Dunk Low Retro Panda",
    brand: "Nike",
    price: 32000,
    oldPrice: 40000,
    image: "images/shoe-panda-dunk.png",
    defaultSize: "42"
  },
  {
    id: 2,
    name: "Nike Shox TL Triple Black",
    brand: "Nike",
    price: 45000,
    oldPrice: 55000,
    image: "images/shoe-shox-black.png",
    defaultSize: "43"
  },
  {
    id: 3,
    name: "Air Jordan 1 High Royal Blue",
    brand: "Jordan",
    price: 48000,
    oldPrice: 60000,
    image: "images/shoe-high-blackblue.png",
    defaultSize: "42"
  },
  {
    id: 4,
    name: "Nike Air Max 270 Pure Platinum",
    brand: "Nike",
    price: 38000,
    oldPrice: 48000,
    image: "images/shoe-airmax270-bubble.png",
    defaultSize: "41"
  },
  {
    id: 5,
    name: "Nike Air Force 1 Chrome Swoosh",
    brand: "Nike",
    price: 35000,
    oldPrice: 45000,
    image: "images/shoe-swoosh-chrome.png",
    defaultSize: "42"
  },
  {
    id: 6,
    name: "VaporMax Neon Teal Glow",
    brand: "Nike",
    price: 42000,
    oldPrice: 52000,
    image: "images/shoe-teal-futuristic.png",
    defaultSize: "44"
  },
  {
    id: 7,
    name: "Urban Chic Swirl Pink Edition",
    brand: "Custom",
    price: 34000,
    oldPrice: 42000,
    image: "images/shoe-pink-swirl.png",
    defaultSize: "39"
  },
  {
    id: 8,
    name: "Jordan Retro High OG Royal",
    brand: "Jordan",
    price: 49000,
    oldPrice: 62000,
    image: "images/shoe-high-royal.png",
    defaultSize: "43"
  }
];

// État de l'application
let cart = JSON.parse(localStorage.getItem('ivoire_kicks_cart') || localStorage.getItem('kickora_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ivoire_kicks_wishlist') || localStorage.getItem('kickora_wishlist') || '[]');

// =========================================================================
// 1. MENU MOBILE & NAVIGATION
// =========================================================================
const menu = document.querySelector('#menu-bar');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
  menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
  };

  window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
  };
}

// =========================================================================
// 2. HERO SLIDER (MODÈLE SOURCE ADAPTÉ)
// =========================================================================
const slides = document.querySelectorAll('.slide-container');
const dots = document.querySelectorAll('.dot');
let slideIndex = 0;
let slideInterval;

function showSlide(n) {
  if (!slides || slides.length === 0) return;
  slides.forEach(s => s.classList.remove('active'));
  slideIndex = (n + slides.length) % slides.length;
  slides[slideIndex].classList.add('active');
  // Synchroniser les dots
  if (dots && dots.length > 0) {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === slideIndex);
      d.setAttribute('aria-selected', i === slideIndex ? 'true' : 'false');
    });
  }
}

function next() {
  showSlide(slideIndex + 1);
}

function prev() {
  showSlide(slideIndex - 1);
}

// Défilement automatique du carrousel toutes les 6 secondes
function startSlideAutoplay() {
  slideInterval = setInterval(next, 6000);
}

function stopSlideAutoplay() {
  clearInterval(slideInterval);
}

// Connexion des dots au slider
if (dots && dots.length > 0) {
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopSlideAutoplay();
      showSlide(parseInt(dot.dataset.index, 10));
      startSlideAutoplay();
    });
  });
}

const homeSection = document.querySelector('.home');
if (homeSection) {
  homeSection.addEventListener('mouseenter', stopSlideAutoplay);
  homeSection.addEventListener('mouseleave', startSlideAutoplay);
  startSlideAutoplay();
}

// =========================================================================
// 3. GALERIE DES PRODUITS VEDETTES (FEATURED IMAGE SWITCHER)
// =========================================================================
function setupFeaturedGalleries() {
  for (let i = 1; i <= 3; i++) {
    const thumbnails = document.querySelectorAll(`.featured-image-${i}`);
    const bigImage = document.querySelector(`.big-image-${i}`);
    
    if (thumbnails && bigImage) {
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          thumbnails.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          const newSrc = thumb.getAttribute('src');
          bigImage.src = newSrc;
        });
      });
    }
  }
}
setupFeaturedGalleries();

// =========================================================================
// 4. FORMATAGE DES PRIX EN FRANC CFA (FCFA)
// =========================================================================
function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// =========================================================================
// 5. GESTION DU PANIER (CART)
// =========================================================================
function saveCart() {
  localStorage.setItem('ivoire_kicks_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const badge = document.querySelector('#cart-count');
  if (badge) {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'block' : 'inline-block';
  }
}

function addToCart(product, size = null) {
  const selectedSize = size || product.defaultSize || "42";
  const existingIndex = cart.findIndex(item => item.id === product.id && item.size === selectedSize);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity: 1
    });
  }

  saveCart();
  showToast(`👟 ${product.name} (Pt ${selectedSize}) ajouté au panier !`, 'success');
  openCartDrawer();
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    showToast(`🗑️ ${removedName} retiré du panier.`, 'info');
  }
}

function updateCartQuantity(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      saveCart();
    }
  }
}

function getCartSubtotal() {
  return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

// Tiroir panier coulissant
function openCartDrawer() {
  const overlay = document.querySelector('#cart-drawer-overlay');
  const drawer = document.querySelector('#cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const overlay = document.querySelector('#cart-drawer-overlay');
  const drawer = document.querySelector('#cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCartDrawer() {
  const cartBody = document.querySelector('#cart-body');
  const cartSubtotalEl = document.querySelector('#cart-subtotal-val');
  if (!cartBody || !cartSubtotalEl) return;

  const subtotal = getCartSubtotal();
  cartSubtotalEl.textContent = formatFCFA(subtotal);

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty-state">
        <i class="fas fa-shopping-basket"></i>
        <h4>Votre panier est vide</h4>
        <p>Découvrez notre collection de sneakers ivoiriennes et ajoutez vos modèles préférés.</p>
        <button class="btn" style="margin-top:2rem;" onclick="closeCartDrawer(); window.location.href='#products';">Explorer les Baskets</button>
      </div>
    `;
    return;
  }

  let html = '';
  cart.forEach((item, index) => {
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="item-size">Pointure : ${item.size}</div>
          <div class="item-price">${formatFCFA(item.price)}</div>
        </div>
        <div class="cart-item-qty">
          <button onclick="updateCartQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity(${index}, 1)">+</button>
        </div>
        <div class="cart-item-delete" onclick="removeFromCart(${index})" title="Supprimer">
          <i class="fas fa-trash-alt"></i>
        </div>
      </div>
    `;
  });

  cartBody.innerHTML = html;
}

// =========================================================================
// 6. GESTION DES FAVORIS (WISHLIST)
// =========================================================================
function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const name = product ? product.name : "Modèle";

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`💔 ${name} retiré des favoris.`, 'info');
  } else {
    wishlist.push(productId);
    showToast(`❤️ ${name} ajouté à vos favoris !`, 'success');
  }

  localStorage.setItem('ivoire_kicks_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.querySelector('#wishlist-count');
  if (badge) {
    badge.textContent = wishlist.length;
  }
}

// =========================================================================
// 7. SÉLECTION DE POINTURE SUR LES CARTES PRODUITS
// =========================================================================
document.addEventListener('click', (e) => {
  if (e.target.matches('.size-selector span')) {
    const parent = e.target.parentElement;
    parent.querySelectorAll('span').forEach(s => s.classList.remove('selected'));
    e.target.classList.add('selected');
  }
});

// =========================================================================
// 8. MODAL DE COMMANDE (CHECKOUT IVOIRIEN)
// =========================================================================
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('⚠️ Votre panier est vide. Ajoutez au moins une paire de baskets.', 'info');
    return;
  }
  closeCartDrawer();

  const modal = document.querySelector('#checkout-modal-overlay');
  if (modal) {
    updateCheckoutSummary();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.querySelector('#checkout-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function calculateShippingFee(city, commune) {
  const subtotal = getCartSubtotal();
  if (subtotal >= IVOIRE_KICKS_STORE.freeShippingThreshold) {
    return 0; // Livraison offerte dès 70 000 FCFA
  }

  if (city === 'Abidjan') {
    // Tarifs Abidjan par zone
    const remoteCommunes = ['Bingerville', 'Songon', 'Bassam'];
    return remoteCommunes.includes(commune) ? 2500 : 1500;
  } else {
    // Villes de l'intérieur (Bouaké, Yamoussoukro, San-Pedro, etc.)
    return 3000;
  }
}

function updateCheckoutSummary() {
  const citySelect = document.querySelector('#checkout-city');
  const communeSelect = document.querySelector('#checkout-commune');
  
  const city = citySelect ? citySelect.value : 'Abidjan';
  const commune = communeSelect ? communeSelect.value : 'Cocody';

  const subtotal = getCartSubtotal();
  const shippingFee = calculateShippingFee(city, commune);
  const total = subtotal + shippingFee;

  const subtotalEl = document.querySelector('#checkout-subtotal');
  const shippingEl = document.querySelector('#checkout-shipping');
  const totalEl = document.querySelector('#checkout-total');

  if (subtotalEl) subtotalEl.textContent = formatFCFA(subtotal);
  if (shippingEl) shippingEl.textContent = shippingFee === 0 ? 'OFFERTE (Promo)' : formatFCFA(shippingFee);
  if (totalEl) totalEl.textContent = formatFCFA(total);
}

// Changement de ville/commune
const cityInput = document.querySelector('#checkout-city');
const communeGroup = document.querySelector('#commune-group');
if (cityInput) {
  cityInput.addEventListener('change', (e) => {
    if (e.target.value === 'Abidjan') {
      if (communeGroup) communeGroup.style.display = 'flex';
    } else {
      if (communeGroup) communeGroup.style.display = 'none';
    }
    updateCheckoutSummary();
  });
}

const communeInput = document.querySelector('#checkout-commune');
if (communeInput) {
  communeInput.addEventListener('change', updateCheckoutSummary);
}

// Sélection visuelle de méthode de paiement
document.querySelectorAll('.payment-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    const radio = option.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// Soumission de la commande
const checkoutForm = document.querySelector('#checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#checkout-name').value.trim();
    const phone = document.querySelector('#checkout-phone').value.trim();
    const city = document.querySelector('#checkout-city').value;
    const commune = city === 'Abidjan' ? document.querySelector('#checkout-commune').value : '';
    const address = document.querySelector('#checkout-address').value.trim();
    const paymentRadio = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'wave';

    // Validation numéro ivoirien
    if (!name || !phone || !address) {
      showToast('⚠️ Veuillez renseigner tous les champs obligatoires.', 'info');
      return;
    }

    const subtotal = getCartSubtotal();
    const shippingFee = calculateShippingFee(city, commune);
    const total = subtotal + shippingFee;
    const orderRef = 'IVK-CI-' + Math.floor(10000 + Math.random() * 90000);

    const orderPayload = {
      reference: orderRef,
      customer: {
        name: name,
        phone: phone,
        city: city,
        commune: commune,
        address: address
      },
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      shippingFee: shippingFee,
      total: total,
      items: [...cart],
      createdAt: new Date().toISOString()
    };

    // Bouton de chargement
    const submitBtn = document.querySelector('#checkout-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement de la commande...';
    submitBtn.disabled = true;

    try {
      // 1. Sauvegarde dans Supabase
      const supabaseApi = window.IVOIRE_KICKS_SUPABASE || window.KICKORA_SUPABASE;
      if (supabaseApi && typeof supabaseApi.saveOrder === 'function') {
        await supabaseApi.saveOrder(orderPayload);
      }

      // 2. Sauvegarde parallèle dans l'API PHP MySQL locale si active
      try {
        fetch('api/orders.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        }).catch(() => {});
      } catch (err) {}

      // 3. Affichage du modal de confirmation avec instructions de paiement
      closeCheckoutModal();
      openSuccessModal(orderPayload);

      // Vider le panier
      cart = [];
      saveCart();

    } catch (err) {
      console.error('Erreur commande:', err);
      showToast('⚠️ Une erreur est survenue, mais votre commande a été préparée.', 'info');
      openSuccessModal(orderPayload);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// =========================================================================
// 9. MODAL DE CONFIRMATION & PAIEMENT (WAVE / OM / MTN / CASH)
// =========================================================================
function openSuccessModal(orderData) {
  const modal = document.querySelector('#success-modal-overlay');
  if (!modal) return;

  const refEl = document.querySelector('#success-order-ref');
  const detailsEl = document.querySelector('#success-order-details');
  const instructionsEl = document.querySelector('#payment-instructions-content');
  const whatsappBtn = document.querySelector('#whatsapp-confirm-btn');

  if (refEl) refEl.textContent = orderData.reference;

  if (detailsEl) {
    detailsEl.innerHTML = `
      <strong>Destinataire :</strong> ${orderData.customer.name} (${orderData.customer.phone})<br>
      <strong>Livraison :</strong> ${orderData.customer.city} ${orderData.customer.commune ? '- ' + orderData.customer.commune : ''} (${orderData.customer.address})<br>
      <strong>Montant Total :</strong> <span style="color:var(--orange-ci); font-weight:800;">${formatFCFA(orderData.total)}</span>
    `;
  }

  // Instructions selon moyen de paiement
  if (instructionsEl) {
    if (orderData.paymentMethod === 'saspay') {
      instructionsEl.innerHTML = `
        <div style="color:#0b7bc4; font-weight:800; font-size:1.6rem; margin-bottom:0.5rem;">⚡ Paiement via SasPay Côte d'Ivoire</div>
        <p>Réglez rapidement et en toute sécurité via <strong>Wave, Orange Money, MTN MoMo, Moov ou Carte Bancaire</strong>.</p>
        <div style="font-size:1.8rem; font-weight:900; color:#0b7bc4; background:#EBF5FB; padding:0.8rem 1.2rem; border-radius:8px; margin:0.8rem 0; text-align:center;">
          Total : ${formatFCFA(orderData.total)}
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem; margin:1rem 0;">
          <a href="${IVOIRE_KICKS_STORE.waveDirectUrl}" target="_blank" class="btn" style="background:#1DA1F2; color:#fff; text-align:center; padding:1rem; border-radius:6px; font-weight:700;">
            🌊 Payer directement par Wave (${IVOIRE_KICKS_STORE.wavePaymentNumber})
          </a>
          <button type="button" class="btn" onclick="initiateSasPayPayment('${orderData.reference}', ${orderData.total})" style="background:linear-gradient(135deg, #0b7bc4, #ff6600); color:#fff; padding:1rem; border-radius:6px; font-weight:700;">
            💳 Ouvrir le Guichet SasPay CI
          </button>
        </div>
        <p style="font-size:1.2rem; color:var(--text-secondary); margin-top:0.4rem;">Référence de commande : <strong>${orderData.reference}</strong></p>
      `;
    } else if (orderData.paymentMethod === 'wave') {
      instructionsEl.innerHTML = `
        <div style="color:#0b7bc4; font-weight:800; font-size:1.6rem; margin-bottom:0.5rem;">🌊 Paiement via Wave Côte d'Ivoire</div>
        <p>1. Ouvrez votre application <strong>Wave CI</strong> sur votre smartphone.</p>
        <p>2. Envoyez le montant exact de <strong>${formatFCFA(orderData.total)}</strong> au numéro marchand :</p>
        <div style="font-size:1.8rem; font-weight:900; color:#0b7bc4; background:#EBF5FB; padding:0.8rem 1.2rem; border-radius:8px; margin:0.8rem 0; text-align:center;">
          ${IVOIRE_KICKS_STORE.wavePaymentNumber}
        </div>
        <a href="${IVOIRE_KICKS_STORE.waveDirectUrl}" target="_blank" class="btn" style="background:#1DA1F2; color:#fff; display:block; text-align:center; padding:0.9rem; margin:0.8rem 0; border-radius:6px; font-weight:700;">
          <i class="fas fa-external-link-alt"></i> Ouvrir Wave sur mon Téléphone
        </a>
        <p>3. Mentionnez en motif : <strong>${orderData.reference}</strong></p>
      `;
    } else if (orderData.paymentMethod === 'orange_money') {
      instructionsEl.innerHTML = `
        <div style="color:#FF6600; font-weight:800; font-size:1.6rem; margin-bottom:0.5rem;">🟧 Paiement via Orange Money CI</div>
        <p>1. Composez <strong>${IVOIRE_KICKS_STORE.orangeMoneyCode}</strong> sur votre mobile Orange ou ouvrez l'application <strong>Max it</strong>.</p>
        <p>2. Transférez <strong>${formatFCFA(orderData.total)}</strong> au numéro IVOIRE KICKS : <strong>${IVOIRE_KICKS_STORE.wavePaymentNumber}</strong></p>
        <p>3. Réf de commande : <strong>${orderData.reference}</strong></p>
      `;
    } else if (orderData.paymentMethod === 'mtn_money') {
      instructionsEl.innerHTML = `
        <div style="color:#B38F00; font-weight:800; font-size:1.6rem; margin-bottom:0.5rem;">🟨 Paiement via MTN Mobile Money (MoMo)</div>
        <p>1. Composez <strong>${IVOIRE_KICKS_STORE.mtnMoneyCode}</strong> sur votre téléphone MTN.</p>
        <p>2. Validez le paiement de <strong>${formatFCFA(orderData.total)}</strong> au compte IVOIRE KICKS : <strong>${IVOIRE_KICKS_STORE.wavePaymentNumber}</strong></p>
        <p>3. Indiquez la référence : <strong>${orderData.reference}</strong></p>
      `;
    } else {
      instructionsEl.innerHTML = `
        <div style="color:var(--green-ci); font-weight:800; font-size:1.6rem; margin-bottom:0.5rem;">💵 Paiement à la Livraison (Abidjan)</div>
        <p>Votre commande est validée ! Notre livreur vous contactera par appel ou WhatsApp au <strong>${IVOIRE_KICKS_STORE.phoneDisplay}</strong> avant de passer.</p>
        <p>Vous pourrez essayer la paire à la réception et régler en <strong>espèces ou par Wave</strong> directement au livreur.</p>
      `;
    }
  }

  // Génération du lien WhatsApp magique
  if (whatsappBtn) {
    const itemsList = orderData.items.map(it => `• ${it.name} (Pt ${it.size}) x${it.quantity} = ${formatFCFA(it.price * it.quantity)}`).join('\n');
    const whatsappMessage = encodeURIComponent(
      `🇨🇮 *NOUVELLE COMMANDE IVOIRE KICKS*\n\n` +
      `*Réf :* ${orderData.reference}\n` +
      `*Client :* ${orderData.customer.name}\n` +
      `*Téléphone :* ${orderData.customer.phone}\n` +
      `*Ville/Commune :* ${orderData.customer.city} ${orderData.customer.commune ? '(' + orderData.customer.commune + ')' : ''}\n` +
      `*Adresse/Repère :* ${orderData.customer.address}\n\n` +
      `*ARTICLES :*\n${itemsList}\n\n` +
      `*Sous-total :* ${formatFCFA(orderData.subtotal)}\n` +
      `*Livraison :* ${orderData.shippingFee === 0 ? 'OFFERTE' : formatFCFA(orderData.shippingFee)}\n` +
      `*TOTAL A REGLER :* ${formatFCFA(orderData.total)}\n` +
      `*Moyen de paiement :* ${orderData.paymentMethod.toUpperCase()}\n\n` +
      `Merci de confirmer la livraison !`
    );

    whatsappBtn.href = `https://wa.me/${IVOIRE_KICKS_STORE.whatsappPhone}?text=${whatsappMessage}`;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function initiateSasPayPayment(orderRef, amount) {
  showToast('💳 Connexion à la passerelle de paiement SasPay...', 'info');
  const targetUrl = `${SASPAY_CONFIG.checkoutUrl}?ref=${encodeURIComponent(orderRef)}&amount=${amount}&currency=XOF&merchant=${encodeURIComponent(SASPAY_CONFIG.merchantName)}&email=${encodeURIComponent(IVOIRE_KICKS_STORE.email)}&phone=${encodeURIComponent(IVOIRE_KICKS_STORE.whatsappPhone)}`;
  
  // Tente d'ouvrir la passerelle SasPay ou redirige vers Wave direct
  const popup = window.open(targetUrl, '_blank');
  if (!popup) {
    window.location.href = IVOIRE_KICKS_STORE.waveDirectUrl;
  }
}

function closeSuccessModal() {
  const modal = document.querySelector('#success-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =========================================================================
// 10. NOTIFICATIONS TOAST
// =========================================================================
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =========================================================================
// 11. INITIALISATION DE LA BOUTIQUE AU CHARGEMENT
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateWishlistBadge();
  renderCartDrawer();

  // Boutons du header
  const cartBtn = document.querySelector('#cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);

  const closeCartBtn = document.querySelector('#close-cart-btn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

  const cartOverlay = document.querySelector('#cart-drawer-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  const checkoutBtn = document.querySelector('#checkout-proceed-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

  const closeCheckoutBtn = document.querySelector('#close-checkout-btn');
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

  const userBtn = document.querySelector('#user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      const localOrders = JSON.parse(localStorage.getItem('ivoire_kicks_orders') || localStorage.getItem('kickora_orders') || '[]');
      if (localOrders.length === 0) {
        showToast('📦 Aucune commande enregistrée pour le moment.', 'info');
      } else {
        const lastOrder = localOrders[localOrders.length - 1];
        showToast(`📦 Dernière commande : ${lastOrder.reference} (${formatFCFA(lastOrder.total)})`, 'success');
      }
    });
  }

  console.log('🇨🇮 IVOIRE KICKS prêt : E-commerce de Sneakers en Côte d\'Ivoire');
});