// ===================== VARIABLES =====================
const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generateBtn');
const generateGoldBtn = document.getElementById('generateGoldBtn');
const copyBtn = document.getElementById('copy-btn');
const notification = document.getElementById('notification');
const historyContainer = document.querySelector('.history-container');
const historyList = document.querySelector('.history-list');
const authControls = document.getElementById('auth-controls');
const openAuthModalBtn = document.getElementById('open-auth-modal');
const authModal = document.getElementById('auth-modal');
const authModalClose = document.getElementById('auth-modal-close');
const gsiButtonModal = document.getElementById('gsi-button-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabs = document.querySelectorAll('.auth-tab');
const panels = document.querySelectorAll('.auth-panel');
const togglePwButtons = document.querySelectorAll('.toggle-pw');

// Nouvelles variables pour KironGold et menu utilisateur
const goldModal = document.getElementById('gold-modal');
const goldModalClose = document.getElementById('gold-modal-close');
const subscriptionModal = document.getElementById('subscription-modal');
const subscriptionModalClose = document.getElementById('subscription-modal-close');
const userMenu = document.getElementById('user-menu');
const hamburgerBtn = document.getElementById('hamburger-btn');
const userDropdown = document.getElementById('user-dropdown');
const discoverGoldBtn = document.querySelector('.btn-gold-top');

const includeUppercase = document.getElementById('includeUppercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const passwordLength = document.getElementById('passwordLength');
const passwordLengthValue = document.getElementById('passwordLengthValue');

// Nouvelles variables pour passphrase
const passwordTypeRadios = document.querySelectorAll('input[name="passwordType"]');
const passwordOptions = document.getElementById('password-options');
const passphraseOptions = document.getElementById('passphrase-options');
const passphraseUppercase = document.getElementById('passphraseUppercase');
const passphraseNumbers = document.getElementById('passphraseNumbers');
const passphraseSymbols = document.getElementById('passphraseSymbols');
const passphraseLength = document.getElementById('passphraseLength');
const passphraseLengthValue = document.getElementById('passphraseLengthValue');
const passphraseDecrease = document.getElementById('passphraseDecrease');
const passphraseIncrease = document.getElementById('passphraseIncrease');

let history = [];

// ===================== STRIPE ET ABONNEMENT =====================
let stripe = null;
let elements = null;
let paymentElement = null;

// Configuration Stripe - Variables d'environnement
const STRIPE_PUBLISHABLE_KEY = window.ENV?.STRIPE_PUBLISHABLE_KEY || '';
const STRIPE_PRICE_ID = window.ENV?.STRIPE_PRICE_ID || '';
const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : '/.netlify/functions';

// Gestion de l'abonnement utilisateur
let userSubscription = JSON.parse(localStorage.getItem('kironSubscription') || 'null');

// ===================== AUTH SOCIALE =====================
let googleCredential = null;
let googleProfile = null;
let appleCredential = null;
let appleProfile = null;
let facebookCredential = null;
let facebookProfile = null;
let appUser = JSON.parse(localStorage.getItem('kironUser') || 'null');

// REMPLACEZ par votre Client ID OAuth 2.0 (type Web) créé dans Google Cloud Console
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID = window.ENV?.APPLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = window.ENV?.FACEBOOK_APP_ID || '';

// Exposé global pour l'attribut onload du script GIS dans index.html
window.initGoogleSignIn = function initGoogleSignIn() {
    if (!window.google || !google.accounts || !google.accounts.id) {
        console.warn('⚠️ Google Identity Services non chargé');
        return;
    }

    if (!GOOGLE_CLIENT_ID) {
        console.warn('⚠️ GOOGLE_CLIENT_ID non configuré. Veuillez ajouter votre Client ID Google.');
        // Afficher un message dans la console pour aider au développement
        const gsiButtonModal = document.getElementById('gsi-button-modal');
        if (gsiButtonModal) {
            gsiButtonModal.innerHTML = '<div style="padding: 12px; background: #ff6b6b; color: white; border-radius: 8px; font-size: 14px; text-align: center;">Google Auth non configuré</div>';
        }
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Bouton Google dans la modale
        renderGoogleButtonInModal();

        // Tentative de récupération de session auto
        google.accounts.id.prompt();
        console.log('✅ Google Identity Services initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation Google:', error);
        const gsiButtonModal = document.getElementById('gsi-button-modal');
        if (gsiButtonModal) {
            gsiButtonModal.innerHTML = '<div style="padding: 12px; background: #ff6b6b; color: white; border-radius: 8px; font-size: 14px; text-align: center;">Erreur Google Auth</div>';
        }
    }
}

function handleGoogleCredential(response) {
    googleCredential = response.credential;
    try {
        const payload = JSON.parse(atob(googleCredential.split('.')[1]));
        googleProfile = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    } catch (e) {
        googleProfile = null;
    }
    updateAuthUI();
    // Ferme la modale si elle est ouverte après connexion Google
    closeAuthModal();
    showNotification('Connecté avec Google');
}

function signOutGoogle() {
    googleCredential = null;
    googleProfile = null;
    // Révoque l'auto-sélection pour ce navigateur
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    updateAuthUI();
    showNotification('Déconnecté de Google');
}

// ===================== AUTH APPLE =====================
function handleAppleSignIn() {
    // Simulation de connexion Apple (en production, utiliser Apple Sign In JS)
    const mockAppleProfile = {
        sub: 'apple_' + Date.now(),
        email: 'user@privaterelay.appleid.com',
        name: 'Utilisateur Apple',
        picture: null
    };
    
    appleCredential = 'apple_token_' + Date.now();
    appleProfile = mockAppleProfile;
    
    updateAuthUI();
    closeAuthModal();
    showNotification('Connecté avec Apple');
}

function signOutApple() {
    appleCredential = null;
    appleProfile = null;
    updateAuthUI();
    showNotification('Déconnecté d\'Apple');
}

// ===================== AUTH FACEBOOK =====================
function handleFacebookSignIn() {
    // Simulation de connexion Facebook (en production, utiliser Facebook SDK)
    const mockFacebookProfile = {
        id: 'facebook_' + Date.now(),
        email: 'user@example.com',
        name: 'Utilisateur Facebook',
        picture: 'https://ui-avatars.com/api/?name=Facebook+User&background=1877f2&color=fff'
    };
    
    facebookCredential = 'facebook_token_' + Date.now();
    facebookProfile = mockFacebookProfile;
    
    updateAuthUI();
    closeAuthModal();
    showNotification('Connecté avec Facebook');
}

function signOutFacebook() {
    facebookCredential = null;
    facebookProfile = null;
    updateAuthUI();
    showNotification('Déconnecté de Facebook');
}

// ===================== SIGNOUT GÉNÉRAL =====================
function signOutAllSocial() {
    signOutGoogle();
    signOutApple();
    signOutFacebook();
}

function updateAuthUI() {
    if (!authControls) return;
    authControls.innerHTML = '';

    const sessionName = (googleProfile && (googleProfile.name || googleProfile.email)) || 
                       (appleProfile && (appleProfile.name || appleProfile.email)) ||
                       (facebookProfile && (facebookProfile.name || facebookProfile.email)) ||
                       (appUser && appUser.email);
    if (googleProfile || appleProfile || facebookProfile || appUser) {
        const wrapper = document.createElement('div');
        wrapper.className = 'auth-user';

        const img = document.createElement('img');
        img.className = 'auth-avatar';
        img.src = (googleProfile && googleProfile.picture) || 
                 (facebookProfile && facebookProfile.picture) ||
                 'https://ui-avatars.com/api/?name=' + encodeURIComponent(sessionName || 'U');
        img.alt = sessionName || 'Utilisateur';

        const span = document.createElement('span');
        span.className = 'auth-name';
        span.textContent = sessionName || 'Compte';

        const btn = document.createElement('button');
        btn.className = 'btn auth-signout';
        btn.textContent = 'Se déconnecter';
        btn.addEventListener('click', () => { 
            appUser = null; 
            localStorage.removeItem('kironUser'); 
            signOutAllSocial(); 
        });

        wrapper.appendChild(img);
        wrapper.appendChild(span);
        wrapper.appendChild(btn);
        authControls.appendChild(wrapper);
    } else {
        const btn = document.createElement('button');
        btn.id = 'open-auth-modal';
        btn.className = 'btn';
        btn.textContent = 'Se connecter';
        btn.addEventListener('click', openAuthModal);
        authControls.appendChild(btn);
    }
}

function renderGoogleButtonInModal() {
    if (!gsiButtonModal) return;
    gsiButtonModal.innerHTML = '';
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.renderButton(gsiButtonModal, {
            theme: document.body.classList.contains('theme-dark') ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with'
        });
    }
}

function openAuthModal() {
    if (!authModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    authModal.classList.add('show');
    authModal.setAttribute('aria-hidden', 'false');
    renderGoogleButtonInModal();
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = authModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}
function closeAuthModal() {
    if (!authModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    authModal.classList.remove('show');
    authModal.setAttribute('aria-hidden', 'true');
}

// Event listeners seront attachés dans DOMContentLoaded

// Tabs
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.getAttribute('data-tab');
        const panel = document.getElementById(id === 'login' ? 'panel-login' : 'panel-signup');
        if (panel) panel.classList.add('active');
        renderGoogleButtonInModal();
    });
});

// ===================== LOGIN / SIGNUP (DEMO FRONT) =====================
function validateEmail(email) {
    return /.+@.+\..+/.test(email);
}

function hashPasswordDemo(value) {
    // Démo: ne pas utiliser en prod
    return btoa(unescape(encodeURIComponent(value))).split('').reverse().join('');
}

function createVerificationToken(email) {
    const raw = email + '|' + Date.now();
    return btoa(raw);
}

function parseVerificationToken(token) {
    try {
        const [email, ts] = atob(token).split('|');
        return { email, ts: Number(ts) };
    } catch {
        return null;
    }
}

// EmailJS
const EMAILJS_PUBLIC_KEY = window.ENV?.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = window.ENV?.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = window.ENV?.EMAILJS_TEMPLATE_ID || '';

function sendVerificationEmail(toEmail, verifyUrl) {
    if (!window.emailjs) return Promise.reject(new Error('EmailJS non chargé'));
    const templateParams = {
        to_email: toEmail,
        verify_link: verifyUrl,
        site_name: 'KironPass'
    };
    // Utilise la clé publique directement avec send (robuste sur v4)
    return window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
    );
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const pass = document.getElementById('signup-password').value;
        const pass2 = document.getElementById('signup-password-confirm').value;
        if (!validateEmail(email)) return showNotification('Email invalide');
        if (pass.length < 8) return showNotification('Mot de passe trop court');
        if (pass !== pass2) return showNotification('Les mots de passe ne correspondent pas');

        const hashed = hashPasswordDemo(pass);
        localStorage.setItem('kironPendingUser', JSON.stringify({ email, hashed }));
        const token = createVerificationToken(email);
        const verifyUrl = `${location.origin}${location.pathname}?verify=${encodeURIComponent(token)}`;
        try {
            await sendVerificationEmail(email, verifyUrl);
            try { await navigator.clipboard.writeText(verifyUrl); showNotification('Email envoyé. Lien copié.'); }
            catch { showNotification('Email envoyé. Cliquez le lien reçu.'); }
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            document.querySelector('[data-tab="login"]').classList.add('active');
            document.getElementById('panel-login').classList.add('active');
        } catch (err) {
            console.error('EmailJS error:', err);
            const msg = (err && (err.text || err.message)) ? String(err.text || err.message) : 'Erreur envoi email';
            showNotification(msg);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;
        const pending = JSON.parse(localStorage.getItem('kironPendingUser') || 'null');
        const verifiedUsers = JSON.parse(localStorage.getItem('kironUsers') || '[]');
        const user = verifiedUsers.find(u => u.email === email);
        if (user) {
            if (user.hashed !== hashPasswordDemo(pass)) return showNotification('Identifiants invalides');
            appUser = { email };
            localStorage.setItem('kironUser', JSON.stringify(appUser));
            updateAuthUI();
            closeAuthModal();
            return showNotification('Connecté');
        }
        if (pending && pending.email === email) {
            return showNotification('Veuillez valider votre email');
        }
        return showNotification('Compte introuvable');
    });
}

// Afficher / masquer mots de passe
function bindTogglePwButtons(scope = document) {
    const buttons = scope.querySelectorAll ? scope.querySelectorAll('.toggle-pw') : [];
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const toShow = input.type === 'password';
            input.type = toShow ? 'text' : 'password';
            // Toggle icônes
            const eye = btn.querySelector('.icon-eye');
            const eyeOff = btn.querySelector('.icon-eye-off');
            if (eye && eyeOff) {
                btn.classList.toggle('is-visible', toShow);
            }
        });
    });
}

bindTogglePwButtons(document);

// Gestion de la validation par lien
(function handleVerifyFromUrl() {
    const params = new URLSearchParams(location.search);
    const token = params.get('verify');
    if (!token) return;
    const parsed = parseVerificationToken(token);
    if (!parsed) return showNotification('Lien invalide');
    const pending = JSON.parse(localStorage.getItem('kironPendingUser') || 'null');
    if (!pending || pending.email !== parsed.email) return showNotification('Aucun compte à valider');
    // Déplace de pending -> users
    const users = JSON.parse(localStorage.getItem('kironUsers') || '[]');
    users.push({ email: pending.email, hashed: pending.hashed, createdAt: Date.now() });
    localStorage.setItem('kironUsers', JSON.stringify(users));
    localStorage.removeItem('kironPendingUser');
    appUser = { email: parsed.email };
    localStorage.setItem('kironUser', JSON.stringify(appUser));
    updateAuthUI();
    showNotification('Email validé, compte activé');
    // Nettoie l’URL
    history.replaceState({}, document.title, location.pathname);
})();

// Session au chargement
updateAuthUI();

// Initialiser Stripe au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que Stripe soit chargé
    if (typeof Stripe !== 'undefined') {
        console.log('✅ Stripe SDK détecté, initialisation...');
        // Ne pas initialiser tout de suite, juste préparer
    } else {
        console.warn('⚠️ Stripe SDK non encore chargé');
    }
});

// ===================== INITIALISATION STRIPE =====================
function initializeStripe() {
    console.log('✅ Système d\'abonnement simplifié activé');
    return true;
}

// ===================== GESTION DES MODALES =====================
function openGoldModal() {
    if (!goldModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Afficher la modale
    goldModal.classList.add('show');
    goldModal.setAttribute('aria-hidden', 'false');
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = goldModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeGoldModal() {
    if (!goldModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    goldModal.classList.remove('show');
    goldModal.setAttribute('aria-hidden', 'true');
}

function openSubscriptionModal() {
    if (!subscriptionModal) return;
    subscriptionModal.classList.add('show');
    subscriptionModal.setAttribute('aria-hidden', 'false');
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    updateSubscriptionDisplay();
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = subscriptionModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeSubscriptionModal() {
    if (!subscriptionModal) return;
    subscriptionModal.classList.remove('show');
    subscriptionModal.setAttribute('aria-hidden', 'true');
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
}

// ===================== GESTION DU MENU HAMBURGER =====================
function toggleUserDropdown() {
    if (!userDropdown) return;
    userDropdown.classList.toggle('show');
}

function closeUserDropdown() {
    if (!userDropdown) return;
    userDropdown.classList.remove('show');
}

// ===================== GESTION D'ABONNEMENT =====================
function updateSubscriptionDisplay() {
    const noSubscription = document.getElementById('no-subscription');
    const activeSubscription = document.getElementById('active-subscription');
    const cancelledSubscription = document.getElementById('cancelled-subscription');
    
    // Masquer tous les états
    [noSubscription, activeSubscription, cancelledSubscription].forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    if (!userSubscription) {
        // Pas d'abonnement
        if (noSubscription) noSubscription.style.display = 'block';
    } else if (userSubscription.status === 'cancelled') {
        // Abonnement résilié
        if (cancelledSubscription) {
            cancelledSubscription.style.display = 'block';
            const cancellationDate = document.getElementById('cancellation-date');
            if (cancellationDate && userSubscription.cancellationDate) {
                cancellationDate.textContent = new Date(userSubscription.cancellationDate).toLocaleDateString('fr-FR');
            }
        }
    } else {
        // Abonnement actif
        if (activeSubscription) {
            activeSubscription.style.display = 'block';
            const nextPayment = document.getElementById('next-payment');
            const paymentMethod = document.getElementById('payment-method');
            
            if (nextPayment && userSubscription.nextPayment) {
                nextPayment.textContent = new Date(userSubscription.nextPayment).toLocaleDateString('fr-FR');
            }
            if (paymentMethod && userSubscription.paymentMethod) {
                paymentMethod.textContent = userSubscription.paymentMethod;
            }
        }
    }
}

async function processSubscriptionPayment() {
    const submitBtn = document.getElementById('stripe-submit');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Traitement...';
        
        // Valider le formulaire
        const userName = document.getElementById('user-name').value.trim();
        const userEmail = document.getElementById('user-email').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;
        const termsAccepted = document.getElementById('terms-accepted').checked;
        
        if (!userName || !userEmail || !paymentMethod || !termsAccepted) {
            throw new Error('Veuillez remplir tous les champs et accepter les conditions');
        }
        
        // Vérifier l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            throw new Error('Veuillez entrer un email valide');
        }
        
        // Simulation de traitement d'abonnement
        showNotification('Traitement de votre demande...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulation de création d'abonnement réussi
        const subscriptionData = {
            subscriptionId: 'sub_' + Date.now(),
            status: 'active',
            customerId: 'cus_' + Date.now()
        };
        
        // Sauvegarder l'abonnement localement
        userSubscription = {
            id: subscriptionData.subscriptionId,
            status: subscriptionData.status,
            customerName: userName,
            customerEmail: userEmail,
            customerId: subscriptionData.customerId,
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
            paymentMethod: paymentMethod,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('kironSubscription', JSON.stringify(userSubscription));
        showNotification('Abonnement KironGold activé !');
        closeGoldModal();
        updateSubscriptionDisplay();
        
    } catch (error) {
        console.error('Erreur de paiement:', error);
        showNotification('Erreur de paiement: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function cancelSubscription() {
    if (!userSubscription) return;
    
    if (confirm('Êtes-vous sûr de vouloir résilier votre abonnement KironGold ?')) {
        try {
            const response = await fetch(`${BACKEND_URL}/cancel-subscription/${userSubscription.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la résiliation');
            }
            
            const data = await response.json();
            
            userSubscription.status = 'active'; // Stripe garde l'abonnement actif jusqu'à la fin de la période
            userSubscription.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
            userSubscription.cancellationDate = new Date(data.currentPeriodEnd * 1000).toISOString();
            localStorage.setItem('kironSubscription', JSON.stringify(userSubscription));
            
            showNotification('Abonnement sera résilié à la fin de la période de facturation');
            updateSubscriptionDisplay();
            
        } catch (error) {
            console.error('Erreur résiliation:', error);
            showNotification('Erreur: ' + error.message);
        }
    }
}

async function reactivateSubscription() {
    if (!userSubscription) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/reactivate-subscription/${userSubscription.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la réactivation');
        }
        
        const data = await response.json();
        
        userSubscription.status = data.status;
        userSubscription.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
        userSubscription.cancellationDate = null;
        localStorage.setItem('kironSubscription', JSON.stringify(userSubscription));
        
        showNotification('Abonnement réactivé !');
        updateSubscriptionDisplay();
        
    } catch (error) {
        console.error('Erreur réactivation:', error);
        showNotification('Erreur: ' + error.message);
    }
}

// ===================== FONCTIONS UTILES =====================
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// FONCTION DE GENERATION DE MOT DE PASSE
function generatePassword(length = 12, options = {}) {
    let chars = '';
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+{}[]<>?/|';
    
    // Si aucun caractère spécial n'est sélectionné, utiliser seulement des minuscules
    if (!chars) {
        chars = 'abcdefghijklmnopqrstuvwxyz';
    } else {
        // Toujours inclure les minuscules par défaut
        chars += 'abcdefghijklmnopqrstuvwxyz';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(getRandomInt(0, chars.length - 1));
    }
    return password;
}

// FONCTION DE GENERATION DE PHRASE DE PASSE
function generatePassphrase(wordCount = 4, options = {}) {
    const words = [
        // A
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
        'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
        'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
        'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
        'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
        'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
        'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
        'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
        'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
        'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
        // B
        'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
        'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
        'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
        'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
        'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
        'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
        'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
        'blossom', 'blow', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
        'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
        'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
        'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
        'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
        'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
        'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
        'business', 'busy', 'butter', 'buyer', 'buzz',
        // C
        'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm',
        'camera', 'camp', 'can', 'canal', 'cancel', 'candy', 'cannon', 'canoe',
        'canvas', 'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card',
        'care', 'career', 'careful', 'careless', 'cargo', 'carpet', 'carry', 'cart',
        'case', 'cash', 'casino', 'cast', 'casual', 'cat', 'catalog', 'catch',
        'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery',
        'cement', 'census', 'century', 'cereal', 'certain', 'chair', 'chalk', 'champion',
        'change', 'chaos', 'chapter', 'charge', 'chase', 'cheap', 'check', 'cheese',
        'chef', 'cherry', 'chest', 'chicken', 'chief', 'child', 'chimney', 'choice',
        'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
        'citizen', 'city', 'civil', 'claim', 'clamp', 'clarify', 'claw', 'clay',
        'clean', 'clerk', 'clever', 'click', 'client', 'cliff', 'climb', 'cling',
        'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud', 'clown',
        'club', 'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut', 'code',
        'coffee', 'coil', 'coin', 'collect', 'color', 'column', 'come', 'comfort',
        'comic', 'common', 'company', 'concert', 'conduct', 'confirm', 'congress', 'connect',
        'consider', 'control', 'convince', 'cook', 'cool', 'copper', 'copy', 'coral',
        'core', 'corn', 'correct', 'cost', 'cotton', 'couch', 'country', 'couple',
        'course', 'cousin', 'cover', 'coyote', 'crack', 'cradle', 'craft', 'cram',
        'crane', 'crash', 'crater', 'crawl', 'crazy', 'cream', 'credit', 'creek',
        'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch',
        'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry',
        'crystal', 'cube', 'culture', 'cup', 'cupboard', 'curious', 'current', 'curtain',
        'curve', 'cushion', 'custom', 'cute', 'cycle'
    ];
    
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let passphrase = '';
    let totalDigits = 0;
    let totalSymbols = 0;
    const maxDigits = options.numbers ? getRandomInt(1, 2) : 0; // Max 1-2 chiffres au total
    const maxSymbols = options.symbols ? getRandomInt(1, 2) : 0; // Max 1-2 symboles au total
    
    for (let i = 0; i < wordCount; i++) {
        const randomWord = words[getRandomInt(0, words.length - 1)];
        
        // Appliquer les options
        let finalWord = randomWord;
        
        if (options.uppercase) {
            finalWord = finalWord.charAt(0).toUpperCase() + finalWord.slice(1);
        }
        
        // Ajouter des chiffres seulement si on n'a pas atteint le maximum
        if (options.numbers && totalDigits < maxDigits) {
            const shouldAddDigit = getRandomInt(0, 1) === 1; // 50% de chance
            if (shouldAddDigit) {
                const randomDigit = getRandomInt(0, 9);
                // Ajouter le chiffre au début ou à la fin du mot
                const addAtEnd = getRandomInt(0, 1) === 1;
                if (addAtEnd) {
                    finalWord = finalWord + randomDigit;
                } else {
                    finalWord = randomDigit + finalWord;
                }
                totalDigits++;
            }
        }
        
        // Ajouter des symboles seulement si on n'a pas atteint le maximum
        if (options.symbols && totalSymbols < maxSymbols) {
            const shouldAddSymbol = getRandomInt(0, 2) === 1; // 33% de chance
            if (shouldAddSymbol) {
                const randomSymbol = symbols[getRandomInt(0, symbols.length - 1)];
                // Ajouter le symbole au début ou à la fin du mot
                const addAtEnd = getRandomInt(0, 1) === 1;
                if (addAtEnd) {
                    finalWord = finalWord + randomSymbol;
                } else {
                    finalWord = randomSymbol + finalWord;
                }
                totalSymbols++;
            }
        }
        
        passphrase += finalWord;
        if (i < wordCount - 1) {
            passphrase += '-';
        }
    }
    
    return passphrase;
}

function calculateStrength(password) {
    let strength = 0;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    if (password.length >= 12) strength += 1;
    return strength;
}

function updateStrengthBar(password) {
    const fill = document.querySelector('.strength-fill');
    const text = document.querySelector('.strength-text');
    const strength = calculateStrength(password);
    const percent = (strength / 5) * 100;
    fill.style.width = `${percent}%`;

    if (percent <= 40) fill.style.background = '#ff4d6d';
    else if (percent <= 80) fill.style.background = '#ffd700';
    else fill.style.background = '#7CFC00';

    text.textContent = ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Très bonne'][strength-1] || 'Vide';
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1500);
}

function updateHistory(passwords) {
    if (!Array.isArray(passwords)) passwords = [passwords];
    history = [...passwords, ...history].slice(0, 20); // Limite à 20
    
    // Sauvegarder dans l'historique complet
    const fullHistory = JSON.parse(localStorage.getItem('kironFullHistory') || '[]');
    const selectedType = document.querySelector('input[name="passwordType"]:checked').value;
    
    passwords.forEach(pwd => {
        fullHistory.unshift({
            password: pwd,
            type: selectedType === 'password' ? 'Mot de passe' : 'Phrase de passe',
            timestamp: Date.now()
        });
    });
    
    // Limiter à 100 éléments dans l'historique complet
    const limitedHistory = fullHistory.slice(0, 100);
    localStorage.setItem('kironFullHistory', JSON.stringify(limitedHistory));
    
    renderHistory();
}

// Fonction pour colorier les caractères du mot de passe
function colorizePassword(password) {
    let coloredPassword = '';
    for (let char of password) {
        if (/[A-Z]/.test(char)) {
            // Majuscules en rose
            coloredPassword += `<span class="char-uppercase">${char}</span>`;
        } else if (/[0-9]/.test(char)) {
            // Chiffres en bleu
            coloredPassword += `<span class="char-number">${char}</span>`;
        } else if (/[^A-Za-z0-9]/.test(char)) {
            // Symboles en rouge pétant
            coloredPassword += `<span class="char-symbol">${char}</span>`;
        } else {
            // Minuscules normales
            coloredPassword += char;
        }
    }
    return coloredPassword;
}

// Fonction pour afficher le mot de passe coloré
function displayColoredPassword(password) {
    const coloredPassword = colorizePassword(password);
    const passwordOutput = document.getElementById('password-output');
    if (passwordOutput) {
        passwordOutput.innerHTML = coloredPassword;
    }
}

function renderHistory() {
    if (!historyList) return;
    const items = historyList.querySelectorAll('.password-item');
    items.forEach(i => i.remove());

    history.forEach(pwd => {
        const div = document.createElement('div');
        div.classList.add('password-item');

        const textSpan = document.createElement('span');
        textSpan.textContent = pwd;
        textSpan.style.flex = '1';
        textSpan.style.overflow = 'hidden';
        textSpan.style.textOverflow = 'ellipsis';
        textSpan.style.whiteSpace = 'nowrap';

        const notesSpan = document.createElement('span');
        notesSpan.classList.add('notes-icon');
        notesSpan.title = 'Ajouter une note';
        notesSpan.innerHTML = '\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n                <circle cx="12" cy="12" r="1"/>\n                <circle cx="19" cy="12" r="1"/>\n                <circle cx="5" cy="12" r="1"/>\n            </svg>\n        ';
        notesSpan.addEventListener('click', () => {
            openNotesModal(pwd);
        });

        const copySpan = document.createElement('span');
        copySpan.classList.add('copy-icon');
        copySpan.title = 'Copier';
        copySpan.innerHTML = '\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n                <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"/>\n            </svg>\n        ';
        copySpan.addEventListener('click', () => {
            navigator.clipboard.writeText(pwd).then(() => showNotification('Copié !'));
        });

        div.appendChild(textSpan);
        div.appendChild(notesSpan);
        div.appendChild(copySpan);
        historyList.appendChild(div);
    });
}

// Boutons de contrôle passphrase
if (passphraseDecrease && passphraseIncrease && passphraseLength) {
    passphraseDecrease.addEventListener('click', () => {
        const currentValue = parseInt(passphraseLength.value);
        if (currentValue > parseInt(passphraseLength.min)) {
            passphraseLength.value = currentValue - 1;
            passphraseLengthValue.textContent = passphraseLength.value;
            passphraseLength.dispatchEvent(new Event('input'));
        }
    });
    
    passphraseIncrease.addEventListener('click', () => {
        const currentValue = parseInt(passphraseLength.value);
        if (currentValue < parseInt(passphraseLength.max)) {
            passphraseLength.value = currentValue + 1;
            passphraseLengthValue.textContent = passphraseLength.value;
            passphraseLength.dispatchEvent(new Event('input'));
        }
    });
}

// ===================== EVENEMENTS =====================

// ===================== GÉNÉRATION DE MOT DE PASSE - NOUVEAU CODE =====================
function generatePasswordNew() {
    const selectedType = document.querySelector('input[name="passwordType"]:checked').value;
    let password = '';
    
    if (selectedType === 'password') {
        const length = parseInt(passwordLength.value) || 12;
        password = generatePassword(length, {
            uppercase: includeUppercase.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        });
    } else {
        const words = parseInt(passphraseLength.value) || 4;
        password = generatePassphrase(words, {
            uppercase: passphraseUppercase.checked,
            numbers: passphraseNumbers.checked,
            symbols: passphraseSymbols.checked
        });
    }
    
    // Afficher le mot de passe
    displayColoredPassword(password);
    updateStrengthBar(password);
    updateHistory([password]);
}

function generatePasswordGold() {
    const selectedType = document.querySelector('input[name="passwordType"]:checked').value;
    const passwords = [];
    
    for (let i = 0; i < 5; i++) {
        let password = '';
        
        if (selectedType === 'password') {
            const length = parseInt(passwordLength.value) || 12;
            password = generatePassword(length, {
                uppercase: includeUppercase.checked,
                numbers: includeNumbers.checked,
                symbols: includeSymbols.checked
            });
        } else {
            const words = parseInt(passphraseLength.value) || 4;
            password = generatePassphrase(words, {
                uppercase: passphraseUppercase.checked,
                numbers: passphraseNumbers.checked,
                symbols: passphraseSymbols.checked
            });
        }
        
        passwords.push(password);
    }
    
    // Afficher le premier mot de passe
    displayColoredPassword(passwords[0]);
    updateStrengthBar(passwords[0]);
    updateHistory(passwords);
}

// Event listeners pour les nouveaux boutons
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const generateGoldBtn = document.getElementById('generateGoldBtn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePasswordNew);
    }
    
    if (generateGoldBtn) {
        generateGoldBtn.addEventListener('click', generatePasswordGold);
    }
});


// ===================== COPIER AVEC GLOW - NOUVEAU CODE =====================
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copy-btn');
    const passwordOutput = document.getElementById('password-output');
    
    if (copyBtn && passwordOutput) {
        copyBtn.addEventListener('click', () => {
            // Récupérer le texte brut du mot de passe (sans les balises HTML)
            const passwordText = passwordOutput.textContent || passwordOutput.innerText;
            if (!passwordText) return;
            
            navigator.clipboard.writeText(passwordText).then(() => {
                showNotification('Copié !');
                copyBtn.classList.add('active');
                setTimeout(() => copyBtn.classList.remove('active'), 400);
            });
        });
    }
});

// (Toggle historique supprimé, liste désormais scrollable)

// ===================== MICRO-INTERACTIONS BOUTONS - NOUVEAU CODE =====================
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const generateGoldBtn = document.getElementById('generateGoldBtn');
    const copyBtn = document.getElementById('copy-btn');
    
    [generateBtn, generateGoldBtn, copyBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.01)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        }
    });
});

// ===================== BARRE DE FORCE DYNAMIQUE =====================
// L'event listener input n'est plus nécessaire car c'est maintenant un div

// ===================== GESTION DU TYPE DE MOT DE PASSE =====================
function togglePasswordType() {
    const selectedType = document.querySelector('input[name="passwordType"]:checked').value;
    
    if (selectedType === 'password') {
        passwordOptions.style.display = 'flex';
        passphraseOptions.style.display = 'none';
    } else {
        passwordOptions.style.display = 'none';
        passphraseOptions.style.display = 'flex';
    }
}

// Event listeners pour le type de mot de passe
passwordTypeRadios.forEach(radio => {
    radio.addEventListener('change', togglePasswordType);
});

// Slider longueur - mise à jour valeur affichée
if (passwordLength && passwordLengthValue) {
    passwordLengthValue.textContent = passwordLength.value;
    passwordLength.addEventListener('input', () => {
        passwordLengthValue.textContent = passwordLength.value;
    });
}

// Slider passphrase - mise à jour valeur affichée
if (passphraseLength && passphraseLengthValue) {
    passphraseLengthValue.textContent = passphraseLength.value;
    passphraseLength.addEventListener('input', () => {
        passphraseLengthValue.textContent = passphraseLength.value;
    });
}

// Boutons de contrôle de longueur
const lengthDecrease = document.getElementById('lengthDecrease');
const lengthIncrease = document.getElementById('lengthIncrease');

if (lengthDecrease && lengthIncrease && passwordLength) {
    lengthDecrease.addEventListener('click', () => {
        const currentValue = parseInt(passwordLength.value);
        if (currentValue > parseInt(passwordLength.min)) {
            passwordLength.value = currentValue - 1;
            passwordLengthValue.textContent = passwordLength.value;
            // Déclencher l'événement input pour mettre à jour l'affichage
            passwordLength.dispatchEvent(new Event('input'));
        }
    });
    
    lengthIncrease.addEventListener('click', () => {
        const currentValue = parseInt(passwordLength.value);
        if (currentValue < parseInt(passwordLength.max)) {
            passwordLength.value = currentValue + 1;
            passwordLengthValue.textContent = passwordLength.value;
            // Déclencher l'événement input pour mettre à jour l'affichage
            passwordLength.dispatchEvent(new Event('input'));
        }
    });
}

// ===================== THEME DYNAMIQUE =====================
const themeBtn = document.getElementById('theme-btn');
let savedTheme = localStorage.getItem('kironTheme') || 'theme-dark';
document.body.classList.add(savedTheme);

// Définir l'icône correcte au chargement
const themeIcon = document.querySelector('.theme-icon');
if (savedTheme === 'theme-dark') {
    themeIcon.textContent = '🌙'; // Lune pour le thème sombre
} else {
    themeIcon.textContent = '☀️'; // Soleil pour le thème clair
}

themeBtn.addEventListener('click', () => {
    let current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
    let next = current === 'theme-dark' ? 'theme-light' : 'theme-dark';
    document.body.classList.remove(current);
    document.body.classList.add(next);
    localStorage.setItem('kironTheme', next);
    
    // Mettre à jour l'icône du thème
    const themeIcon = document.querySelector('.theme-icon');
    if (next === 'theme-dark') {
        themeIcon.textContent = '🌙'; // Lune pour le thème sombre
    } else {
        themeIcon.textContent = '☀️'; // Soleil pour le thème clair
    }
});

// ===================== EVENT LISTENERS POUR NOUVELLES FONCTIONNALITÉS =====================

// Bouton "Découvrir Gold"
if (discoverGoldBtn) {
    discoverGoldBtn.addEventListener('click', openGoldModal);
} else {
    console.warn('Bouton "Découvrir Gold" non trouvé');
}

// Fermeture modale Gold et Abonnement - event listeners dans DOMContentLoaded

// Menu hamburger
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleUserDropdown);
}

// Fermer le dropdown en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeUserDropdown();
    }
});

// Actions du menu dropdown
document.addEventListener('click', (e) => {
    if (e.target.closest('#subscription-item')) {
        openSubscriptionModal();
        closeUserDropdown();
    }
    if (e.target.closest('#profile-item')) {
        openSettingsModal();
        closeUserDropdown();
    }
    if (e.target.closest('#history-item')) {
        openHistoryModal();
        closeUserDropdown();
    }
    if (e.target.closest('#settings-item')) {
        openSettingsModal();
        closeUserDropdown();
    }
    if (e.target.closest('#help-item')) {
        openHelpModal();
        closeUserDropdown();
    }
    if (e.target.closest('#language-item')) {
        openLanguageModal();
        closeUserDropdown();
    }
    if (e.target.closest('#logout-item')) {
        appUser = null;
        localStorage.removeItem('kironUser');
        signOutAllSocial();
        closeUserDropdown();
    }
});

// Gestion des abonnements
document.addEventListener('click', (e) => {
    if (e.target.id === 'subscribe-now') {
        openGoldModal();
        closeSubscriptionModal();
    }
    if (e.target.id === 'cancel-subscription') {
        cancelSubscription();
    }
    if (e.target.id === 'reactivate-subscription') {
        reactivateSubscription();
    }
});

// Fermer les modales en cliquant sur le backdrop
document.addEventListener('click', (e) => {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-close-modal')) {
        closeGoldModal();
        closeSubscriptionModal();
        closeSettingsModal();
        closeHistoryModal();
        closeHelpModal();
        closeLanguageModal();
        closeNotesModal();
        closeSecurityTestModal();
    }
});

// Bouton de paiement Stripe
document.addEventListener('click', (e) => {
    if (e.target.id === 'stripe-submit') {
        e.preventDefault();
        processSubscriptionPayment();
    }
    if (e.target.id === 'save-note') {
        e.preventDefault();
        saveNote();
    }
    if (e.target.id === 'cancel-note') {
        e.preventDefault();
        closeNotesModal();
    }
    if (e.target.id === 'security-test-link') {
        e.preventDefault();
        openSecurityTestModal();
    }
});

// ===================== EVENT LISTENERS POUR AUTHENTIFICATION SOCIALE =====================
document.addEventListener('click', (e) => {
    if (e.target.id === 'apple-signin-btn') {
        handleAppleSignIn();
    }
    if (e.target.id === 'facebook-signin-btn') {
        handleFacebookSignIn();
    }
});

// ===================== GESTION DES PARAMÈTRES =====================
const settingsModal = document.getElementById('settings-modal');
const settingsModalClose = document.getElementById('settings-modal-close');
const historyModal = document.getElementById('history-modal');
const historyModalClose = document.getElementById('history-modal-close');
const helpModal = document.getElementById('help-modal');
const helpModalClose = document.getElementById('help-modal-close');
const languageModal = document.getElementById('language-modal');
const languageModalClose = document.getElementById('language-modal-close');
const notesModal = document.getElementById('notes-modal');
const notesModalClose = document.getElementById('notes-modal-close');
const securityTestModal = document.getElementById('security-test-modal');
const securityTestModalClose = document.getElementById('security-test-modal-close');
let userProfile = JSON.parse(localStorage.getItem('kironUserProfile') || 'null');
let userPreferences = JSON.parse(localStorage.getItem('kironUserPreferences') || 'null');

// Initialiser les préférences par défaut
if (!userPreferences) {
    userPreferences = {
        theme: 'dark',
        language: 'fr',
        emailNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
        dataCollection: true,
        analytics: true,
        cookies: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        autoCopy: true,
        showStrength: true,
        saveHistory: true
    };
    localStorage.setItem('kironUserPreferences', JSON.stringify(userPreferences));
}

function openSettingsModal() {
    if (!settingsModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    settingsModal.classList.add('show');
    settingsModal.setAttribute('aria-hidden', 'false');
    
    // Charger les données utilisateur
    loadUserProfile();
    loadUserPreferences();
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = settingsModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeSettingsModal() {
    if (!settingsModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    settingsModal.classList.remove('show');
    settingsModal.setAttribute('aria-hidden', 'true');
}

function openHistoryModal() {
    if (!historyModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    historyModal.classList.add('show');
    historyModal.setAttribute('aria-hidden', 'false');
    
    // Charger l'historique complet
    loadFullHistory();
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = historyModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeHistoryModal() {
    if (!historyModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    historyModal.classList.remove('show');
    historyModal.setAttribute('aria-hidden', 'true');
}

function openHelpModal() {
    if (!helpModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    helpModal.classList.add('show');
    helpModal.setAttribute('aria-hidden', 'false');
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = helpModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeHelpModal() {
    if (!helpModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    helpModal.classList.remove('show');
    helpModal.setAttribute('aria-hidden', 'true');
}

function openLanguageModal() {
    if (!languageModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    languageModal.classList.add('show');
    languageModal.setAttribute('aria-hidden', 'false');
    
    // Charger la langue actuelle
    loadCurrentLanguage();
    
    // Focus sur la modale pour l'accessibilité
    setTimeout(() => {
        const modalDialog = languageModal.querySelector('.modal-dialog');
        if (modalDialog) modalDialog.focus();
    }, 100);
}

function closeLanguageModal() {
    if (!languageModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    languageModal.classList.remove('show');
    languageModal.setAttribute('aria-hidden', 'true');
}

function loadCurrentLanguage() {
    const currentLang = userPreferences?.language || 'fr';
    const languageOptions = document.querySelectorAll('.language-selection .language-option');
    
    languageOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-lang') === currentLang) {
            option.classList.add('selected');
        }
    });
}

function changeLanguage(lang) {
    console.log('changeLanguage appelée avec:', lang);
    // Mettre à jour les préférences
    if (!userPreferences) {
        userPreferences = {
            theme: 'dark',
            language: 'fr',
            emailNotifications: true,
            marketingEmails: false,
            securityAlerts: true,
            dataCollection: true,
            analytics: true,
            cookies: false,
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            autoCopy: true,
            showStrength: true,
            saveHistory: true
        };
    }
    
    userPreferences.language = lang;
    localStorage.setItem('kironUserPreferences', JSON.stringify(userPreferences));
    
    // Mettre à jour l'affichage
    loadCurrentLanguage();
    
    // Afficher une notification
    const langNames = {
        'fr': 'Français',
        'en': 'English'
    };
    
    showNotification(`Langue changée en ${langNames[lang]}`);
    
    // Fermer la modale immédiatement
    closeLanguageModal();
}

function openNotesModal(password) {
    if (!notesModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Remplir le mot de passe
    document.getElementById('notes-password').value = password;
    document.getElementById('note-text').value = '';
    
    notesModal.classList.add('show');
    notesModal.setAttribute('aria-hidden', 'false');
    
    // Focus sur le champ de note
    setTimeout(() => {
        document.getElementById('note-text').focus();
    }, 100);
}

function closeNotesModal() {
    if (!notesModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    notesModal.classList.remove('show');
    notesModal.setAttribute('aria-hidden', 'true');
}

function saveNote() {
    const password = document.getElementById('notes-password').value;
    const note = document.getElementById('note-text').value.trim();
    
    if (!note) {
        showNotification('Veuillez saisir une note');
        return;
    }
    
    // Sauvegarder la note
    const notes = JSON.parse(localStorage.getItem('kironNotes') || '{}');
    notes[password] = note;
    localStorage.setItem('kironNotes', JSON.stringify(notes));
    
    showNotification('Note sauvegardée !');
    closeNotesModal();
}

function openSecurityTestModal() {
    if (!securityTestModal) return;
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Remplir avec le mot de passe actuel s'il existe
    const currentPassword = document.getElementById('password-output').textContent;
    const testPasswordInput = document.getElementById('test-password');
    if (currentPassword) {
        testPasswordInput.value = currentPassword;
        testPasswordSecurity(currentPassword);
    } else {
        // Vider le champ si aucun mot de passe généré
        testPasswordInput.value = '';
        // Réinitialiser les résultats
        const scoreFill = document.getElementById('score-fill');
        const scoreText = document.getElementById('score-text');
        const crackTime = document.getElementById('crack-time');
        const feedbackList = document.getElementById('feedback-list');
        
        if (scoreFill) scoreFill.style.width = '0%';
        if (scoreText) scoreText.textContent = 'Entrez un mot de passe pour tester';
        if (crackTime) crackTime.textContent = '';
        if (feedbackList) feedbackList.innerHTML = '';
    }
    
    securityTestModal.classList.add('show');
    securityTestModal.setAttribute('aria-hidden', 'false');
    
    // Focus sur le champ de test
    setTimeout(() => {
        document.getElementById('test-password').focus();
    }, 100);
}

function closeSecurityTestModal() {
    if (!securityTestModal) return;
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    securityTestModal.classList.remove('show');
    securityTestModal.setAttribute('aria-hidden', 'true');
}

function testPasswordSecurity(password) {
    if (!password || typeof zxcvbn === 'undefined') {
        return;
    }
    
    const result = zxcvbn(password);
    
    // Mettre à jour le score
    const scoreFill = document.getElementById('score-fill');
    const scoreText = document.getElementById('score-text');
    const crackTime = document.getElementById('crack-time');
    const feedbackList = document.getElementById('feedback-list');
    
    // Score de 0 à 4
    const score = result.score;
    const scorePercent = (score / 4) * 100;
    
    scoreFill.style.width = `${scorePercent}%`;
    
    const scoreLabels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'];
    scoreText.textContent = `${scoreLabels[score]} (${score}/4)`;
    
    // Couleur du score
    if (score <= 1) {
        scoreFill.style.background = '#ef4444';
    } else if (score <= 2) {
        scoreFill.style.background = '#f59e0b';
    } else if (score <= 3) {
        scoreFill.style.background = '#eab308';
    } else {
        scoreFill.style.background = '#22c55e';
    }
    
    // Temps de crack
    crackTime.textContent = result.crack_times_display.offline_slow_hashing_1e4_per_second;
    
    // Suggestions
    feedbackList.innerHTML = '';
    if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
        result.feedback.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            feedbackList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Excellent ! Votre mot de passe est très sécurisé.';
        li.style.color = '#22c55e';
        feedbackList.appendChild(li);
    }
    
    // Avertissements
    if (result.feedback.warning) {
        const li = document.createElement('li');
        li.textContent = `⚠️ ${result.feedback.warning}`;
        li.style.color = '#f59e0b';
        feedbackList.appendChild(li);
    }
}

function loadFullHistory() {
    const fullHistoryList = document.getElementById('full-history-list');
    if (!fullHistoryList) return;
    
    // Récupérer l'historique complet depuis localStorage
    const fullHistory = JSON.parse(localStorage.getItem('kironFullHistory') || '[]');
    
    fullHistoryList.innerHTML = '';
    
    if (fullHistory.length === 0) {
        fullHistoryList.innerHTML = '<p style="text-align: center; color: #8a8fa3; padding: 2rem;">Aucun mot de passe généré pour le moment</p>';
        return;
    }
    
    fullHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'full-history-item';
        historyItem.innerHTML = `
            <div class="history-item-content">
                <span class="history-password">${item.password}</span>
                <span class="history-type">${item.type}</span>
                <span class="history-date">${new Date(item.timestamp).toLocaleString('fr-FR')}</span>
            </div>
            <div class="history-item-actions">
                <button class="copy-history-btn" data-password="${item.password}">Copier</button>
                <button class="delete-history-btn" data-index="${index}">Supprimer</button>
            </div>
        `;
        fullHistoryList.appendChild(historyItem);
    });
    
    // Ajouter les event listeners
    fullHistoryList.querySelectorAll('.copy-history-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const password = btn.getAttribute('data-password');
            navigator.clipboard.writeText(password).then(() => {
                showNotification('Mot de passe copié !');
            });
        });
    });
    
    fullHistoryList.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            if (confirm('Supprimer ce mot de passe de l\'historique ?')) {
                fullHistory.splice(index, 1);
                localStorage.setItem('kironFullHistory', JSON.stringify(fullHistory));
                loadFullHistory();
            }
        });
    });
}

// Navigation dans les paramètres
function initSettingsNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            
            // Mettre à jour la navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Afficher la section correspondante
            sections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(`section-${sectionId}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ===================== GESTION DU PROFIL =====================
function loadUserProfile() {
    if (!userProfile) {
        // Créer un profil par défaut basé sur les données d'authentification
        const sessionName = (googleProfile && (googleProfile.name || googleProfile.email)) || 
                           (appleProfile && (appleProfile.name || appleProfile.email)) ||
                           (facebookProfile && (facebookProfile.name || facebookProfile.email)) ||
                           (appUser && appUser.email) || 'Utilisateur';
        
        userProfile = {
            firstname: '',
            lastname: '',
            username: sessionName,
            email: (googleProfile && googleProfile.email) || 
                   (appleProfile && appleProfile.email) ||
                   (facebookProfile && facebookProfile.email) ||
                   (appUser && appUser.email) || '',
            phone: '',
            avatar: (googleProfile && googleProfile.picture) || 
                   (facebookProfile && facebookProfile.picture) ||
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionName)}&background=random`
        };
    }
    
    // Remplir le formulaire
    document.getElementById('profile-firstname').value = userProfile.firstname || '';
    document.getElementById('profile-lastname').value = userProfile.lastname || '';
    document.getElementById('profile-username').value = userProfile.username || '';
    document.getElementById('profile-email').value = userProfile.email || '';
    document.getElementById('profile-phone').value = userProfile.phone || '';
    document.getElementById('profile-avatar').src = userProfile.avatar || 'https://ui-avatars.com/api/?name=U&background=random';
}

function saveUserProfile() {
    const formData = {
        firstname: document.getElementById('profile-firstname').value.trim(),
        lastname: document.getElementById('profile-lastname').value.trim(),
        username: document.getElementById('profile-username').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        avatar: document.getElementById('profile-avatar').src
    };
    
    // Validation
    if (!formData.email) {
        showNotification('L\'adresse email est obligatoire');
        return false;
    }
    
    if (!validateEmail(formData.email)) {
        showNotification('Format d\'email invalide');
        return false;
    }
    
    // Sauvegarder
    userProfile = { ...userProfile, ...formData };
    localStorage.setItem('kironUserProfile', JSON.stringify(userProfile));
    
    // Mettre à jour l'UI d'authentification
    updateAuthUI();
    
    showNotification('Profil sauvegardé avec succès');
    return true;
}

// ===================== GESTION DES PRÉFÉRENCES =====================
function loadUserPreferences() {
    // Thème
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = radio.value === userPreferences.theme;
    });
    
    // Langue
    const languageRadios = document.querySelectorAll('input[name="language"]');
    languageRadios.forEach(radio => {
        radio.checked = radio.value === userPreferences.language;
    });
    
    // Notifications
    document.getElementById('email-notifications').checked = userPreferences.emailNotifications;
    document.getElementById('marketing-emails').checked = userPreferences.marketingEmails;
    document.getElementById('security-alerts').checked = userPreferences.securityAlerts;
    
    // Confidentialité
    document.getElementById('data-collection').checked = userPreferences.dataCollection;
    document.getElementById('analytics').checked = userPreferences.analytics;
    document.getElementById('cookies').checked = userPreferences.cookies;
    
    // Accessibilité
    document.getElementById('high-contrast').checked = userPreferences.highContrast;
    document.getElementById('large-text').checked = userPreferences.largeText;
    document.getElementById('reduced-motion').checked = userPreferences.reducedMotion;
    
    // Génération
    document.getElementById('auto-copy').checked = userPreferences.autoCopy;
    document.getElementById('show-strength').checked = userPreferences.showStrength;
    document.getElementById('save-history').checked = userPreferences.saveHistory;
}

function saveUserPreferences() {
    const preferences = {
        theme: document.querySelector('input[name="theme"]:checked').value,
        language: document.querySelector('input[name="language"]:checked').value,
        emailNotifications: document.getElementById('email-notifications').checked,
        marketingEmails: document.getElementById('marketing-emails').checked,
        securityAlerts: document.getElementById('security-alerts').checked,
        dataCollection: document.getElementById('data-collection').checked,
        analytics: document.getElementById('analytics').checked,
        cookies: document.getElementById('cookies').checked,
        highContrast: document.getElementById('high-contrast').checked,
        largeText: document.getElementById('large-text').checked,
        reducedMotion: document.getElementById('reduced-motion').checked,
        autoCopy: document.getElementById('auto-copy').checked,
        showStrength: document.getElementById('show-strength').checked,
        saveHistory: document.getElementById('save-history').checked
    };
    
    userPreferences = preferences;
    localStorage.setItem('kironUserPreferences', JSON.stringify(userPreferences));
    
    // Appliquer le thème immédiatement
    applyTheme(preferences.theme);
    
    // Appliquer les options d'accessibilité
    applyAccessibilityOptions(preferences);
    
    showNotification('Préférences sauvegardées');
}

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('theme-dark', prefersDark);
        document.body.classList.toggle('theme-light', !prefersDark);
    } else {
        document.body.classList.toggle('theme-dark', theme === 'dark');
        document.body.classList.toggle('theme-light', theme === 'light');
    }
    localStorage.setItem('kironTheme', theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light') : `theme-${theme}`);
}

function applyAccessibilityOptions(preferences) {
    // Contraste élevé
    document.body.classList.toggle('high-contrast', preferences.highContrast);
    
    // Texte agrandi
    document.body.classList.toggle('large-text', preferences.largeText);
    
    // Réduire les animations
    document.body.classList.toggle('reduced-motion', preferences.reducedMotion);
}

// ===================== GESTION DE LA SÉCURITÉ =====================
function enable2FA() {
    if (confirm('Voulez-vous activer l\'authentification à deux facteurs ?')) {
        // Simulation de l'activation 2FA
        showNotification('2FA activé avec succès');
        document.querySelector('.security-status').textContent = 'Activé';
        document.querySelector('.security-status').classList.remove('inactive');
        document.querySelector('.security-status').classList.add('active');
        document.getElementById('enable-2fa').textContent = 'Désactiver la 2FA';
    }
}

function disconnectDevice(deviceElement) {
    if (confirm('Voulez-vous déconnecter cet appareil ?')) {
        deviceElement.remove();
        showNotification('Appareil déconnecté');
        updateDeviceCount();
    }
}

function resetAllSessions() {
    if (confirm('Cela déconnectera tous vos appareils. Voulez-vous continuer ?')) {
        document.querySelectorAll('.device-item').forEach(device => device.remove());
        showNotification('Toutes les sessions ont été réinitialisées');
        updateDeviceCount();
    }
}

function updateDeviceCount() {
    const deviceCount = document.querySelectorAll('.device-item').length;
    document.querySelector('.device-count').textContent = `${deviceCount} appareils`;
}

// ===================== GESTION DE L'ACTIVITÉ =====================
function initActivityFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const activityItems = document.querySelectorAll('.activity-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Mettre à jour les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrer les activités
            activityItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ===================== GESTION DU SUPPORT =====================
function contactSupport() {
    showNotification('Ouverture du formulaire de contact...');
    // Ici, vous pourriez ouvrir une modale de contact ou rediriger vers un formulaire
}

function openFAQ() {
    showNotification('Ouverture de la FAQ...');
    // Ici, vous pourriez ouvrir une modale FAQ ou rediriger vers la page FAQ
}

function openDocs() {
    showNotification('Ouverture de la documentation...');
    // Ici, vous pourriez ouvrir la documentation
}

function reportBug() {
    showNotification('Ouverture du formulaire de signalement...');
    // Ici, vous pourriez ouvrir un formulaire de signalement de bug
}

// ===================== GESTION DU COMPTE =====================
function deactivateAccount() {
    if (confirm('Voulez-vous désactiver temporairement votre compte ?')) {
        if (confirm('Êtes-vous vraiment sûr ? Cette action vous déconnectera.')) {
            // Simulation de la désactivation
            showNotification('Compte désactivé temporairement');
            // Déconnexion
            appUser = null;
            localStorage.removeItem('kironUser');
            signOutAllSocial();
            closeSettingsModal();
        }
    }
}

function deleteAccount() {
    const password = prompt('Pour confirmer la suppression, veuillez entrer votre mot de passe :');
    if (!password) return;
    
    if (confirm('ATTENTION : Cette action est IRRÉVERSIBLE. Toutes vos données seront définitivement supprimées.')) {
        if (confirm('Dernière confirmation : Voulez-vous vraiment supprimer votre compte ?')) {
            // Simulation de la suppression
            showNotification('Compte supprimé définitivement');
            // Nettoyage complet
            localStorage.clear();
            // Redirection ou fermeture
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
}

// ===================== INITIALISATION =====================
function initSettings() {
    // Navigation
    initSettingsNavigation();
    
    // Filtres d'activité
    initActivityFilters();
    
    // Event listeners pour les formulaires
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile();
        });
    }
    
    // Bouton sauvegarder préférences
    const savePreferencesBtn = document.getElementById('save-preferences');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveUserPreferences);
    }
    
    // Boutons de sécurité
    const enable2FABtn = document.getElementById('enable-2fa');
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', enable2FA);
    }
    
    const resetSessionsBtn = document.getElementById('reset-sessions');
    if (resetSessionsBtn) {
        resetSessionsBtn.addEventListener('click', resetAllSessions);
    }
    
    // Boutons de support
    const contactSupportBtn = document.getElementById('contact-support');
    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', contactSupport);
    }
    
    const openFAQBtn = document.getElementById('open-faq');
    if (openFAQBtn) {
        openFAQBtn.addEventListener('click', openFAQ);
    }
    
    const openDocsBtn = document.getElementById('open-docs');
    if (openDocsBtn) {
        openDocsBtn.addEventListener('click', openDocs);
    }
    
    const reportBugBtn = document.getElementById('report-bug');
    if (reportBugBtn) {
        reportBugBtn.addEventListener('click', reportBug);
    }
    
    // Boutons de gestion du compte
    const deactivateAccountBtn = document.getElementById('deactivate-account');
    if (deactivateAccountBtn) {
        deactivateAccountBtn.addEventListener('click', deactivateAccount);
    }
    
    const deleteAccountBtn = document.getElementById('delete-account');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
    
    // Déconnexion d'appareils
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('device-action')) {
            disconnectDevice(e.target.closest('.device-item'));
        }
    });
    
    // Boutons d'abonnement dans les paramètres
    const changePlanBtn = document.getElementById('change-plan');
    if (changePlanBtn) {
        changePlanBtn.addEventListener('click', () => {
            closeSettingsModal();
            openGoldModal();
        });
    }
    
    const updatePaymentBtn = document.getElementById('update-payment-method');
    if (updatePaymentBtn) {
        updatePaymentBtn.addEventListener('click', () => {
            closeSettingsModal();
            openSubscriptionModal();
        });
    }
    
    const viewInvoicesBtn = document.getElementById('view-invoices');
    if (viewInvoicesBtn) {
        viewInvoicesBtn.addEventListener('click', () => {
            showNotification('Téléchargement des factures...');
        });
    }
    
    const cancelSubscriptionBtn = document.getElementById('cancel-subscription-settings');
    if (cancelSubscriptionBtn) {
        cancelSubscriptionBtn.addEventListener('click', () => {
            closeSettingsModal();
            openSubscriptionModal();
        });
    }
}

// Appliquer les préférences au chargement
if (userPreferences) {
    applyTheme(userPreferences.theme);
}

// Initialiser les paramètres au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les paramètres
    initSettings();
    
    // Event listener pour le test de sécurité en temps réel
    const testPasswordInput = document.getElementById('test-password');
    if (testPasswordInput) {
        testPasswordInput.addEventListener('input', (e) => {
            testPasswordSecurity(e.target.value);
        });
        
        // Test initial si le champ a déjà une valeur
        if (testPasswordInput.value) {
            testPasswordSecurity(testPasswordInput.value);
        }
    }
    
    // Event listeners pour la sélection de langue
    const languageOptions = document.querySelectorAll('.language-selection .language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.getAttribute('data-lang');
            console.log('Langue sélectionnée:', lang);
            changeLanguage(lang);
        });
    });
    
    // Fermer les modales
    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', closeSettingsModal);
    }
    if (historyModalClose) {
        historyModalClose.addEventListener('click', closeHistoryModal);
    }
    if (helpModalClose) {
        helpModalClose.addEventListener('click', closeHelpModal);
    }
    if (languageModalClose) {
        languageModalClose.addEventListener('click', (e) => {
            console.log('Fermeture du menu langue');
            closeLanguageModal();
        });
    }
    if (notesModalClose) {
        notesModalClose.addEventListener('click', closeNotesModal);
    }
    if (securityTestModalClose) {
        securityTestModalClose.addEventListener('click', closeSecurityTestModal);
    }
    
    // Event listeners pour les autres modales
    if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', openAuthModal);
    if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
    if (goldModalClose) goldModalClose.addEventListener('click', closeGoldModal);
    if (subscriptionModalClose) subscriptionModalClose.addEventListener('click', closeSubscriptionModal);
    
    // Event listeners pour fermer les modales en cliquant sur le backdrop
    document.addEventListener('click', (e) => {
        if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-close-modal')) {
            // Fermer toutes les modales ouvertes
            if (authModal && authModal.classList.contains('show')) closeAuthModal();
            if (goldModal && goldModal.classList.contains('show')) closeGoldModal();
            if (subscriptionModal && subscriptionModal.classList.contains('show')) closeSubscriptionModal();
            if (settingsModal && settingsModal.classList.contains('show')) closeSettingsModal();
            if (historyModal && historyModal.classList.contains('show')) closeHistoryModal();
            if (helpModal && helpModal.classList.contains('show')) closeHelpModal();
            if (languageModal && languageModal.classList.contains('show')) closeLanguageModal();
            if (notesModal && notesModal.classList.contains('show')) closeNotesModal();
            if (securityTestModal && securityTestModal.classList.contains('show')) closeSecurityTestModal();
        }
    });
});

// Gestion de la touche Échap pour fermer les modales
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (authModal && authModal.classList.contains('show')) {
            closeAuthModal();
        }
        if (goldModal && goldModal.classList.contains('show')) {
            closeGoldModal();
        }
        if (subscriptionModal && subscriptionModal.classList.contains('show')) {
            closeSubscriptionModal();
        }
        if (settingsModal && settingsModal.classList.contains('show')) {
            closeSettingsModal();
        }
        if (historyModal && historyModal.classList.contains('show')) {
            closeHistoryModal();
        }
        if (helpModal && helpModal.classList.contains('show')) {
            closeHelpModal();
        }
        if (languageModal && languageModal.classList.contains('show')) {
            closeLanguageModal();
        }
        if (notesModal && notesModal.classList.contains('show')) {
            closeNotesModal();
        }
        if (securityTestModal && securityTestModal.classList.contains('show')) {
            closeSecurityTestModal();
        }
    }
});
