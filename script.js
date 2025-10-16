// ===================== VARIABLES =====================
const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
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

async function openAuthModal() {
    if (!authModal) return;
    
    // Charger Google Sign-In en lazy-load
    if (!window.google && typeof window.loadGoogleSignIn === 'function') {
        await window.loadGoogleSignIn();
    }
    
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
if (tabs && tabs.length > 0) {
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
}

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
async function openGoldModal() {
    if (!goldModal) return;
    
    // Charger Stripe en lazy-load
    if (typeof window.Stripe === 'undefined' && typeof window.loadStripe === 'function') {
        await window.loadStripe();
    }
    
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
    
    // Faire défiler vers le générateur
    setTimeout(() => {
        const generatorSection = document.querySelector('.generator-container');
        if (generatorSection) {
            generatorSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
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
    if (hamburgerBtn) hamburgerBtn.classList.toggle('active');
}

function closeUserDropdown() {
    if (!userDropdown) return;
    userDropdown.classList.remove('show');
    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
}

// ===================== GESTION DES LANGUES =====================
let currentLanguage = localStorage.getItem('kironLanguage') || 'fr';

// Traductions
const translations = {
    fr: {
        // Header
        'discover-gold': 'Découvrir Gold',
        'theme': 'Thème',
        'login': 'Se connecter',
        'resources': 'Ressources',
        'common-passwords-2024': 'Les 10 mots de passe les plus courants en 2024',
        
        // Generator
        'password-generator': 'Générateur de mot de passe',
        'password': 'MOT DE PASSE',
        'passphrase': 'PHRASE DE PASSE',
        'uppercase': 'MAJUSCULES',
        'numbers': 'CHIFFRES',
        'symbols': 'SYMBOLES',
        'length': 'Longueur',
        'words': 'Mots',
        'generate': 'Générer',
        'generate-gold': 'Générer Gold',
        'copy': 'Copier',
        'strength': 'Force',
        'security-test': 'Comment savoir si votre mot de passe est sécurisé ?',
        'test-here': 'Testez-le ici',
        
        // History
        'history': 'Historique',
        
        // Security
        'security-title': 'Besoin d\'un rappel sur les bonnes pratiques des mots de passe ?',
        'security-length': 'Longueur',
        'security-length-desc': 'Utilisez au moins 12 caractères. Plus c\'est long, plus c\'est sécurisé !',
        'security-complexity': 'Complexité',
        'security-complexity-desc': 'Mélangez majuscules, minuscules, chiffres et symboles pour une sécurité maximale.',
        'security-uniqueness': 'Unicité',
        'security-uniqueness-desc': 'Un mot de passe unique pour chaque compte. Ne réutilisez jamais le même !',
        
        // Premium
        'gold-features': 'Fonctionnalités Gold',
        'gold-feature-1': 'Multi-génération de mots de passe',
        'gold-feature-2': 'Patterns personnalisés',
        'gold-feature-3': 'Historique complet illimité',
        'gold-feature-4': 'Thème dynamique & boutons animés',
        'gold-feature-5': 'Notifications stylées',
        'gold-feature-6': 'Couleurs et glow premium',
        'gold-feature-7': 'Responsive sur mobile, tablette et PC',
        
        // FAQ
        'faq': 'FAQ',
        'faq-1-q': 'Comment fonctionne le mode Gold ?',
        'faq-1-a': 'Le mode Gold permet de générer plusieurs mots de passe à la fois, d\'utiliser des patterns personnalisés et de débloquer l\'historique complet.',
        'faq-2-q': 'Comment copier mon mot de passe ?',
        'faq-2-a': 'Cliquez simplement sur le bouton "Copier" à droite de la barre du mot de passe.',
        'faq-3-q': 'Est-ce sécurisé ?',
        'faq-3-a': 'Oui, tous les mots de passe sont générés côté client et ne sont jamais envoyés sur un serveur.',
        
        // Contact
        'contact': 'Contact',
        'name': 'Nom',
        'email': 'Email',
        'message': 'Message',
        'send': 'Envoyer',
        
        // Footer
        'copyright': '© 2025 KironPass – Tous droits réservés',
        'contact-link': 'Contact',
        'terms-link': 'CGU',
        'privacy-link': 'Politique de confidentialité',
        
        // Mots de passe courants
        'most-common-passwords-title': 'Les 10 mots de passe les plus courants en 2024',
        'most-common-passwords-intro': 'Découvrez les mots de passe les plus utilisés et pourquoi il est crucial de les éviter. Utilisez KironPass pour générer des mots de passe uniques et sécurisés.',
        'alert-title': 'Danger !',
        'alert-text': 'L\'utilisation de ces mots de passe vous expose à un risque élevé de piratage. Ne les utilisez JAMAIS !',
        'why-avoid': 'Pourquoi éviter ces mots de passe ?',
        'why-avoid-text': 'Ces mots de passe sont les premières cibles des cybercriminels car ils sont faciles à deviner ou à "cracker" via des attaques par dictionnaire ou par force brute. Leur simplicité est leur plus grande faiblesse.',
        'solutions': 'Solutions pour une sécurité optimale',
        'solution-generator-title': 'Utilisez un générateur',
        'solution-generator-text': 'KironPass génère des mots de passe complexes et aléatoires, impossibles à deviner.',
        'solution-passphrase-title': 'Optez pour une phrase de passe',
        'solution-passphrase-text': 'Plus longue et plus facile à retenir, une phrase de passe est très sécurisée.',
        'solution-unique-title': 'Un mot de passe unique',
        'solution-unique-text': 'N\'utilisez jamais le même mot de passe pour plusieurs comptes.',
        'best-practices': 'Bonnes pratiques de sécurité',
        'practice-length-title': 'Longueur minimale',
        'practice-length-text': 'Visez au moins 12 caractères pour vos mots de passe.',
        'practice-complexity-title': 'Mélangez les caractères',
        'practice-complexity-text': 'Incluez majuscules, minuscules, chiffres et symboles.',
        'practice-2fa-title': 'Activez la 2FA',
        'practice-2fa-text': 'L\'authentification à deux facteurs ajoute une couche de sécurité essentielle.',
        'cta-title': 'Protégez vos comptes dès maintenant !',
        'cta-text': 'Générez un mot de passe ultra sécurisé avec KironPass.',
        'cta-button': 'Générer un mot de passe'
    },
    en: {
        // Header
        'discover-gold': 'Discover Gold',
        'theme': 'Theme',
        'login': 'Sign in',
        'resources': 'Resources',
        'common-passwords-2024': 'The 10 Most Common Passwords in 2024',
        
        // Generator
        'password-generator': 'Password Generator',
        'password': 'PASSWORD',
        'passphrase': 'PASSPHRASE',
        'uppercase': 'UPPERCASE',
        'numbers': 'NUMBERS',
        'symbols': 'SYMBOLS',
        'length': 'Length',
        'words': 'Words',
        'generate': 'Generate',
        'generate-gold': 'Generate Gold',
        'copy': 'Copy',
        'strength': 'Strength',
        'security-test': 'How to know if your password is secure?',
        'test-here': 'Test it here',
        
        // History
        'history': 'History',
        
        // Security
        'security-title': 'Need a reminder about password best practices?',
        'security-length': 'Length',
        'security-length-desc': 'Use at least 12 characters. The longer, the more secure!',
        'security-complexity': 'Complexity',
        'security-complexity-desc': 'Mix uppercase, lowercase, numbers and symbols for maximum security.',
        'security-uniqueness': 'Uniqueness',
        'security-uniqueness-desc': 'A unique password for each account. Never reuse the same one!',
        
        // Premium
        'gold-features': 'Gold Features',
        'gold-feature-1': 'Multi-password generation',
        'gold-feature-2': 'Custom patterns',
        'gold-feature-3': 'Unlimited complete history',
        'gold-feature-4': 'Dynamic theme & animated buttons',
        'gold-feature-5': 'Styled notifications',
        'gold-feature-6': 'Premium colors and glow',
        'gold-feature-7': 'Responsive on mobile, tablet and PC',
        
        // FAQ
        'faq': 'FAQ',
        'faq-1-q': 'How does Gold mode work?',
        'faq-1-a': 'Gold mode allows you to generate multiple passwords at once, use custom patterns and unlock the complete history.',
        'faq-2-q': 'How to copy my password?',
        'faq-2-a': 'Simply click the "Copy" button to the right of the password bar.',
        'faq-3-q': 'Is it secure?',
        'faq-3-a': 'Yes, all passwords are generated client-side and are never sent to a server.',
        
        // Contact
        'contact': 'Contact',
        'name': 'Name',
        'email': 'Email',
        'message': 'Message',
        'send': 'Send',
        
        // Footer
        'copyright': '© 2025 KironPass – All rights reserved',
        'contact-link': 'Contact',
        'terms-link': 'Terms',
        'privacy-link': 'Privacy Policy',
        
        // Mots de passe courants
        'most-common-passwords-title': 'The 10 Most Common Passwords in 2024',
        'most-common-passwords-intro': 'Discover the most used passwords and why it\'s crucial to avoid them. Use KironPass to generate unique and secure passwords.',
        'alert-title': 'Danger!',
        'alert-text': 'Using these passwords exposes you to a high risk of hacking. NEVER use them!',
        'why-avoid': 'Why avoid these passwords?',
        'why-avoid-text': 'These passwords are the first targets of cybercriminals because they are easy to guess or "crack" through dictionary or brute force attacks. Their simplicity is their greatest weakness.',
        'solutions': 'Solutions for optimal security',
        'solution-generator-title': 'Use a generator',
        'solution-generator-text': 'KironPass generates complex and random passwords, impossible to guess.',
        'solution-passphrase-title': 'Opt for a passphrase',
        'solution-passphrase-text': 'Longer and easier to remember, a passphrase is very secure.',
        'solution-unique-title': 'A unique password',
        'solution-unique-text': 'Never use the same password for multiple accounts.',
        'best-practices': 'Security best practices',
        'practice-length-title': 'Minimum length',
        'practice-length-text': 'Aim for at least 12 characters for your passwords.',
        'practice-complexity-title': 'Mix characters',
        'practice-complexity-text': 'Include uppercase, lowercase, numbers and symbols.',
        'practice-2fa-title': 'Enable 2FA',
        'practice-2fa-text': 'Two-factor authentication adds an essential layer of security.',
        'cta-title': 'Protect your accounts now!',
        'cta-text': 'Generate an ultra-secure password with KironPass.',
        'cta-button': 'Generate a password'
    }
};

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('kironLanguage', lang);
    
    // Appliquer la traduction automatique
    if (lang === 'en') {
        translatePageToEnglish();
    } else {
        translatePageToFrench();
    }
    
    // Mettre à jour l'interface
    updateLanguageUI();
}

// Fonction de traduction automatique vers l'anglais
function translatePageToEnglish() {
    // Dictionnaire de traductions
    const translations = {
        'Générer': 'Generate',
        'Copier': 'Copy',
        'Force': 'Strength',
        'Longueur': 'Length',
        'Mots': 'Words',
        'MAJUSCULES': 'UPPERCASE',
        'CHIFFRES': 'NUMBERS',
        'SYMBOLES': 'SYMBOLS',
        'MOT DE PASSE': 'PASSWORD',
        'PHRASE DE PASSE': 'PASSPHRASE',
        'Historique': 'History',
        'Thème': 'Theme',
        'Ressources': 'Resources',
        'Se connecter': 'Sign in',
        'Découvrir Gold': 'Discover Gold',
        'Comment savoir si votre mot de passe est sécurisé ?': 'How to know if your password is secure?',
        'Testez-le ici': 'Test it here',
        'Besoin d\'un rappel sur les bonnes pratiques des mots de passe ?': 'Need a reminder about password best practices?',
        'Longueur': 'Length',
        'Utilisez au moins 12 caractères. Plus c\'est long, plus c\'est sécurisé !': 'Use at least 12 characters. The longer, the more secure!',
        'Complexité': 'Complexity',
        'Mélangez majuscules, minuscules, chiffres et symboles pour une sécurité maximale.': 'Mix uppercase, lowercase, numbers and symbols for maximum security.',
        'Unicité': 'Uniqueness',
        'Un mot de passe unique pour chaque compte. Ne réutilisez jamais le même !': 'A unique password for each account. Never reuse the same one!',
        'Fonctionnalités Gold': 'Gold Features',
        'Multi-génération de mots de passe': 'Multi-password generation',
        'Patterns personnalisés': 'Custom patterns',
        'Historique complet illimité': 'Unlimited complete history',
        'Thème dynamique & boutons animés': 'Dynamic theme & animated buttons',
        'Notifications stylées': 'Styled notifications',
        'Couleurs et glow premium': 'Premium colors and glow',
        'Responsive sur mobile, tablette et PC': 'Responsive on mobile, tablet and PC',
        'FAQ': 'FAQ',
        'Comment fonctionne le mode Gold ?': 'How does Gold mode work?',
        'Le mode Gold permet de générer plusieurs mots de passe à la fois, d\'utiliser des patterns personnalisés et de débloquer l\'historique complet.': 'Gold mode allows you to generate multiple passwords at once, use custom patterns and unlock the complete history.',
        'Comment copier mon mot de passe ?': 'How to copy my password?',
        'Cliquez simplement sur le bouton "Copier" à droite de la barre du mot de passe.': 'Simply click the "Copy" button to the right of the password bar.',
        'Est-ce sécurisé ?': 'Is it secure?',
        'Oui, tous les mots de passe sont générés côté client et ne sont jamais envoyés sur un serveur.': 'Yes, all passwords are generated client-side and are never sent to a server.',
        '© 2025 KironPass – Tous droits réservés': '© 2025 KironPass – All rights reserved',
        'Contact': 'Contact',
        'CGU': 'Terms',
        'Politique de confidentialité': 'Privacy Policy',
        'Mentions légales': 'Legal Notice'
    };
    
    // Traduire tous les éléments de texte
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim() && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const originalText = textNode.textContent.trim();
        if (translations[originalText]) {
            textNode.textContent = textNode.textContent.replace(originalText, translations[originalText]);
        }
    });
}

// Fonction de traduction automatique vers le français
function translatePageToFrench() {
    // Dictionnaire de traductions
    const translations = {
        'Generate': 'Générer',
        'Copy': 'Copier',
        'Strength': 'Force',
        'Length': 'Longueur',
        'Words': 'Mots',
        'UPPERCASE': 'MAJUSCULES',
        'NUMBERS': 'CHIFFRES',
        'SYMBOLS': 'SYMBOLES',
        'PASSWORD': 'MOT DE PASSE',
        'PASSPHRASE': 'PHRASE DE PASSE',
        'History': 'Historique',
        'Theme': 'Thème',
        'Resources': 'Ressources',
        'Sign in': 'Se connecter',
        'Discover Gold': 'Découvrir Gold',
        'How to know if your password is secure?': 'Comment savoir si votre mot de passe est sécurisé ?',
        'Test it here': 'Testez-le ici',
        'Need a reminder about password best practices?': 'Besoin d\'un rappel sur les bonnes pratiques des mots de passe ?',
        'Use at least 12 characters. The longer, the more secure!': 'Utilisez au moins 12 caractères. Plus c\'est long, plus c\'est sécurisé !',
        'Complexity': 'Complexité',
        'Mix uppercase, lowercase, numbers and symbols for maximum security.': 'Mélangez majuscules, minuscules, chiffres et symboles pour une sécurité maximale.',
        'Uniqueness': 'Unicité',
        'A unique password for each account. Never reuse the same one!': 'Un mot de passe unique pour chaque compte. Ne réutilisez jamais le même !',
        'Gold Features': 'Fonctionnalités Gold',
        'Multi-password generation': 'Multi-génération de mots de passe',
        'Custom patterns': 'Patterns personnalisés',
        'Unlimited complete history': 'Historique complet illimité',
        'Dynamic theme & animated buttons': 'Thème dynamique & boutons animés',
        'Styled notifications': 'Notifications stylées',
        'Premium colors and glow': 'Couleurs et glow premium',
        'Responsive on mobile, tablet and PC': 'Responsive sur mobile, tablette et PC',
        'How does Gold mode work?': 'Comment fonctionne le mode Gold ?',
        'Gold mode allows you to generate multiple passwords at once, use custom patterns and unlock the complete history.': 'Le mode Gold permet de générer plusieurs mots de passe à la fois, d\'utiliser des patterns personnalisés et de débloquer l\'historique complet.',
        'How to copy my password?': 'Comment copier mon mot de passe ?',
        'Simply click the "Copy" button to the right of the password bar.': 'Cliquez simplement sur le bouton "Copier" à droite de la barre du mot de passe.',
        'Is it secure?': 'Est-ce sécurisé ?',
        'Yes, all passwords are generated client-side and are never sent to a server.': 'Oui, tous les mots de passe sont générés côté client et ne sont jamais envoyés sur un serveur.',
        '© 2025 KironPass – All rights reserved': '© 2025 KironPass – Tous droits réservés',
        'Terms': 'CGU',
        'Privacy Policy': 'Politique de confidentialité',
        'Legal Notice': 'Mentions légales'
    };
    
    // Traduire tous les éléments de texte
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim() && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const originalText = textNode.textContent.trim();
        if (translations[originalText]) {
            textNode.textContent = textNode.textContent.replace(originalText, translations[originalText]);
        }
    });
}

function updateLanguageUI() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

function updateLanguageButtons() {
    const langButtons = document.querySelectorAll('.language-option-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

// Initialiser la langue au chargement
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI();
    updateLanguageButtons();
});

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
    
    // Mettre à jour l'affichage des boutons de génération
    updateGeneratorButtons();
}

function updateGeneratorButtons() {
    const isPremium = userSubscription && userSubscription.status === 'active';
    
    if (isPremium) {
        // Pour les utilisateurs premium, le bouton "Générer" devient "Générer Gold"
        if (generateBtn) {
            generateBtn.textContent = 'Générer Gold';
            generateBtn.classList.add('btn-gold');
        }
    } else {
        // Pour les utilisateurs gratuits, texte normal
        if (generateBtn) {
            generateBtn.textContent = 'Générer';
            generateBtn.classList.remove('btn-gold');
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
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+{}[]<>?/|';
    
    let chars = lowercase; // Toujours inclure les minuscules
    let required = [];
    
    // Ajouter les caractères requis selon les options
    if (options.uppercase) {
        chars += uppercase;
        required.push(uppercase);
    }
    if (options.numbers) {
        chars += numbers;
        required.push(numbers);
    }
    if (options.symbols) {
        chars += symbols;
        required.push(symbols);
    }
    
    let password = '';
    
    // S'assurer qu'il y a au moins un caractère de chaque type requis
    for (let i = 0; i < required.length; i++) {
        const charset = required[i];
        password += charset.charAt(getRandomInt(0, charset.length - 1));
    }
    
    // Compléter le reste du mot de passe avec des caractères aléatoires
    for (let i = password.length; i < length; i++) {
        password += chars.charAt(getRandomInt(0, chars.length - 1));
    }
    
    // Mélanger le mot de passe pour éviter que les caractères requis soient toujours au début
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

// FONCTION DE GENERATION DE PHRASE DE PASSE
function generatePassphrase(wordCount = 4, options = {}) {
    // Récupérer la langue actuelle (utilise currentLanguage défini plus haut)
    const currentLang = currentLanguage || localStorage.getItem('kironLanguage') || 'fr';
    
    // Utiliser la liste de mots appropriée selon la langue
    const words = typeof getWordList !== 'undefined' ? getWordList(currentLang) : 
        ['abandon', 'ability', 'accept', 'action', 'animal', 'apple', 'balance', 
         'beauty', 'bridge', 'camera', 'castle', 'change', 'circle', 'coffee',
         'design', 'dream', 'energy', 'family', 'flower', 'forest', 'future',
         'garden', 'golden', 'guitar', 'health', 'heaven', 'island', 'journey',
         'jungle', 'kitchen', 'laptop', 'legend', 'letter', 'library', 'listen',
         'machine', 'memory', 'moment', 'mountain', 'nature', 'ocean', 'orange',
         'palace', 'planet', 'poetry', 'rainbow', 'rhythm', 'river', 'secret',
         'shadow', 'simple', 'spirit', 'summer', 'sunset', 'temple', 'thunder',
         'travel', 'treasure', 'universe', 'victory', 'village', 'vision', 'voyage',
         'wallet', 'whisper', 'window', 'winter', 'wisdom', 'wonder', 'yellow'];
    
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let passphrase = '';
    let totalDigits = 0;
    let totalSymbols = 0;
    let hasUppercase = false;
    const minDigits = options.numbers ? 1 : 0; // Au moins 1 chiffre si activé
    const minSymbols = options.symbols ? 1 : 0; // Au moins 1 symbole si activé
    const maxDigits = options.numbers ? getRandomInt(1, 2) : 0;
    const maxSymbols = options.symbols ? getRandomInt(1, 2) : 0;
    
    for (let i = 0; i < wordCount; i++) {
        const randomWord = words[getRandomInt(0, words.length - 1)];
        
        // Appliquer les options
        let finalWord = randomWord;
        
        // S'assurer qu'au moins un mot a une majuscule
        if (options.uppercase && (i === 0 || !hasUppercase)) {
            finalWord = finalWord.charAt(0).toUpperCase() + finalWord.slice(1);
            hasUppercase = true;
        } else if (options.uppercase && getRandomInt(0, 1) === 1) {
            finalWord = finalWord.charAt(0).toUpperCase() + finalWord.slice(1);
        }
        
        // S'assurer qu'au moins un chiffre est ajouté si l'option est activée
        if (options.numbers && (totalDigits < minDigits || (totalDigits < maxDigits && getRandomInt(0, 1) === 1))) {
            const randomDigit = getRandomInt(0, 9);
            const addAtEnd = getRandomInt(0, 1) === 1;
            if (addAtEnd) {
                finalWord = finalWord + randomDigit;
            } else {
                finalWord = randomDigit + finalWord;
            }
            totalDigits++;
        }
        
        // S'assurer qu'au moins un symbole est ajouté si l'option est activée
        if (options.symbols && (totalSymbols < minSymbols || (totalSymbols < maxSymbols && getRandomInt(0, 2) === 1))) {
            const randomSymbol = symbols[getRandomInt(0, symbols.length - 1)];
            const addAtEnd = getRandomInt(0, 1) === 1;
            if (addAtEnd) {
                finalWord = finalWord + randomSymbol;
            } else {
                finalWord = randomSymbol + finalWord;
            }
            totalSymbols++;
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
    
    // Sauvegarder dans l'historique complet (sessionStorage pour conserver pendant la navigation)
    const fullHistory = JSON.parse(sessionStorage.getItem('kironFullHistory') || '[]');
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
    sessionStorage.setItem('kironFullHistory', JSON.stringify(limitedHistory));
    
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
        // Si le mot de passe fait plus de 80 caractères, le diviser en lignes de 80 caractères
        if (password.length > 80) {
            const lines = [];
            for (let i = 0; i < password.length; i += 80) {
                const line = password.substring(i, i + 80);
                lines.push(colorizePassword(line));
            }
            passwordOutput.innerHTML = lines.join('<br>');
        } else {
            passwordOutput.innerHTML = coloredPassword;
        }
    }
}

function renderHistory() {
    if (!historyList) return;
    const items = historyList.querySelectorAll('.password-item');
    items.forEach(i => i.remove());

    history.forEach(pwd => {
        const div = document.createElement('div');
        div.classList.add('password-item');

        // Récupérer la note si elle existe
        const notes = JSON.parse(localStorage.getItem('kironNotes') || '{}');
        const note = notes[pwd] || '';

        const textSpan = document.createElement('span');
        if (note) {
            textSpan.innerHTML = `${pwd} <span class="note-indicator" title="${note}">📝</span>`;
        } else {
            textSpan.textContent = pwd;
        }
        textSpan.style.flex = '1';
        textSpan.style.overflow = 'hidden';
        textSpan.style.textOverflow = 'ellipsis';
        textSpan.style.whiteSpace = 'nowrap';

        const notesSpan = document.createElement('span');
        notesSpan.classList.add('notes-icon');
        notesSpan.title = note ? `Note: ${note}` : 'Ajouter une note';
        notesSpan.innerHTML = '\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n                <circle cx="12" cy="12" r="1"/>\n                <circle cx="19" cy="12" r="1"/>\n                <circle cx="5" cy="12" r="1"/>\n            </svg>\n        ';
        notesSpan.addEventListener('click', () => {
            openNotesModal(pwd);
        });

        const copySpan = document.createElement('span');
        copySpan.classList.add('copy-icon');
        copySpan.title = 'Copier';
        copySpan.innerHTML = '\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n                <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"/>\n            </svg>\n        ';
        copySpan.addEventListener('click', () => {
            navigator.clipboard.writeText(pwd).then(() => {
                // Même comportement que le bouton principal
                const originalText = copySpan.title;
                copySpan.title = 'Copié !';
                setTimeout(() => {
                    copySpan.title = originalText;
                }, 1000);
            });
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

// GENERATION MOT DE PASSE NORMAL
if (generateBtn) {
    generateBtn.addEventListener('click', () => {
    // Vérifier si l'utilisateur est premium
    const isPremium = userSubscription && userSubscription.status === 'active';
    
    // Animation de l'icône
    generateBtn.classList.add('generating');
    setTimeout(() => {
        generateBtn.classList.remove('generating');
    }, 600);
    
    let count = isPremium ? 5 : 1; // Premium: 5, Free: 1
    const passwords = [];
    const selectedType = document.querySelector('input[name="passwordType"]:checked').value;

    for (let i = 0; i < count; i++) {
        let pwd;
        
        if (selectedType === 'password') {
            const requestedLength = Math.min(Math.max(parseInt(passwordLength.value) || 12, 6), 128);
            pwd = generatePassword(requestedLength, {
                uppercase: includeUppercase.checked,
                numbers: includeNumbers.checked,
                symbols: includeSymbols.checked
            });
        } else {
            const requestedWords = Math.min(Math.max(parseInt(passphraseLength.value) || 4, 1), 10);
            pwd = generatePassphrase(requestedWords, {
                uppercase: passphraseUppercase.checked,
                numbers: passphraseNumbers.checked,
                symbols: passphraseSymbols.checked
            });
        }
        
        passwords.push(pwd);
        if (i === 0) {
            displayColoredPassword(pwd);
        }
    }

    updateStrengthBar(passwords[0]);
    updateHistory(passwords);
});
}

// GENERATION MOT DE PASSE GOLD


// ===================== COPIER AVEC GLOW =====================
let copyTimeout = null;
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
    // Récupérer le texte brut du mot de passe (sans les balises HTML)
    const passwordText = passwordOutput.textContent || passwordOutput.innerText;
    if (!passwordText) return;
    
    navigator.clipboard.writeText(passwordText).then(() => {
        // Sauvegarder le texte original seulement si ce n'est pas déjà "Copié !"
        const originalText = copyBtn.getAttribute('data-original-text') || copyBtn.textContent;
        
        // Si ce n'est pas encore stocké, le stocker
        if (!copyBtn.getAttribute('data-original-text')) {
            copyBtn.setAttribute('data-original-text', originalText);
        }
        
        // Annuler le timeout précédent s'il existe
        if (copyTimeout) {
            clearTimeout(copyTimeout);
        }
        
        // Changer le texte du bouton
        copyBtn.textContent = 'Copié !';
        copyBtn.classList.add('active');
        
        // Remettre le texte original après 1.2 seconde
        copyTimeout = setTimeout(() => {
            copyBtn.textContent = copyBtn.getAttribute('data-original-text');
            copyBtn.classList.remove('active');
            copyTimeout = null;
        }, 1200);
    });
});
}

// (Toggle historique supprimé, liste désormais scrollable)

// ===================== MICRO-INTERACTIONS BOUTONS =====================
// Les effets d'agrandissement ont été supprimés, seul le CSS gère les hovers

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
if (passwordTypeRadios && passwordTypeRadios.length > 0) {
    passwordTypeRadios.forEach(radio => {
        radio.addEventListener('change', togglePasswordType);
    });
}

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
window.themeInitialized = true; // Marquer que le thème est géré par script.js

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

// ===================== BOUTON RESSOURCES =====================
const resourcesBtn = document.getElementById('resources-btn');
const resourcesDropdown = document.getElementById('resources-dropdown');
const dropdownArrow = document.querySelector('.dropdown-arrow');

function toggleResourcesDropdown() {
    if (resourcesDropdown) {
        resourcesDropdown.classList.toggle('show');
        if (dropdownArrow) {
            dropdownArrow.style.transform = resourcesDropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

if (resourcesBtn) {
    resourcesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleResourcesDropdown();
    });
}

// Fermer le dropdown en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (resourcesDropdown && !resourcesBtn.contains(e.target) && !resourcesDropdown.contains(e.target)) {
        resourcesDropdown.classList.remove('show');
        if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(0deg)';
        }
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

// Menu hamburger pour la langue
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleUserDropdown);
    window.hamburgerInitialized = true; // Marquer que le hamburger est géré par script.js
}

// Fermer le dropdown en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeUserDropdown();
    }
});

// Actions du menu dropdown
document.addEventListener('click', (e) => {
    if (e.target.closest('#language-item')) {
        openLanguageModal();
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
    const currentLang = currentLanguage || 'fr';
    const languageOptions = document.querySelectorAll('.language-selection .language-option');
    
    languageOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-lang') === currentLang) {
            option.classList.add('selected');
        }
    });
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

function formatCrackTime(seconds) {
    if (seconds < 1) {
        return 'Moins d\'une seconde';
    } else if (seconds < 60) {
        return `${Math.round(seconds)} seconde${seconds >= 2 ? 's' : ''}`;
    } else if (seconds < 3600) {
        const minutes = Math.round(seconds / 60);
        return `${minutes} minute${minutes >= 2 ? 's' : ''}`;
    } else if (seconds < 86400) {
        const hours = Math.round(seconds / 3600);
        return `${hours} heure${hours >= 2 ? 's' : ''}`;
    } else if (seconds < 2592000) {
        const days = Math.round(seconds / 86400);
        return `${days} jour${days >= 2 ? 's' : ''}`;
    } else if (seconds < 31536000) {
        const months = Math.round(seconds / 2592000);
        return `${months} mois`;
    } else if (seconds < 31536000000) {
        const years = Math.round(seconds / 31536000);
        return `${years} an${years >= 2 ? 's' : ''}`;
    } else if (seconds < 31536000000000) {
        const centuries = Math.round(seconds / 3153600000);
        return `${centuries} siècle${centuries >= 2 ? 's' : ''}`;
    } else {
        return 'Plusieurs millénaires';
    }
}

// Fonction pour traduire les suggestions en français
function translateSuggestion(suggestion) {
    const translations = {
        'Add another word or two. Uncommon words are better.': 'Ajoutez un ou deux mots supplémentaires. Les mots peu communs sont meilleurs.',
        'Use a longer keyboard pattern with more turns': 'Utilisez un pattern de clavier plus long avec plus de virages',
        'Add another word or two. Uncommon words are better': 'Ajoutez un ou deux mots supplémentaires. Les mots peu communs sont meilleurs.',
        'Use a longer keyboard pattern with more turns.': 'Utilisez un pattern de clavier plus long avec plus de virages.',
        'Avoid repeated patterns and keyboard patterns like "qwerty" or "asdf"': 'Évitez les patterns répétés et les patterns de clavier comme "qwerty" ou "asdf"',
        'Avoid repeated patterns and keyboard patterns like "qwerty" or "asdf".': 'Évitez les patterns répétés et les patterns de clavier comme "qwerty" ou "asdf".',
        'Avoid repeated patterns and keyboard patterns': 'Évitez les patterns répétés et les patterns de clavier',
        'Avoid repeated patterns and keyboard patterns.': 'Évitez les patterns répétés et les patterns de clavier.',
        'Use a longer keyboard pattern': 'Utilisez un pattern de clavier plus long',
        'Use a longer keyboard pattern.': 'Utilisez un pattern de clavier plus long.',
        'Add another word or two': 'Ajoutez un ou deux mots supplémentaires',
        'Add another word or two.': 'Ajoutez un ou deux mots supplémentaires.',
        'Uncommon words are better': 'Les mots peu communs sont meilleurs',
        'Uncommon words are better.': 'Les mots peu communs sont meilleurs.'
    };
    
    return translations[suggestion] || suggestion;
}

// Fonction pour traduire les avertissements en français
function translateWarning(warning) {
    const translations = {
        'Straight rows of keys are easy to guess': 'Les rangées droites de touches sont faciles à deviner',
        'Short keyboard patterns are easy to guess': 'Les patterns de clavier courts sont faciles à deviner',
        'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Les répétitions comme "abcabcabc" ne sont que légèrement plus difficiles à deviner que "abc"',
        'Repeats like "abcabcabc" are only slightly harder to guess than "abc".': 'Les répétitions comme "abcabcabc" ne sont que légèrement plus difficiles à deviner que "abc".',
        'This is a very common password': 'Ceci est un mot de passe très courant',
        'This is a very common password.': 'Ceci est un mot de passe très courant.',
        'This is similar to a commonly used password': 'Ceci est similaire à un mot de passe couramment utilisé',
        'This is similar to a commonly used password.': 'Ceci est similaire à un mot de passe couramment utilisé.',
        'This is a top-10 common password': 'Ceci est un des 10 mots de passe les plus courants',
        'This is a top-10 common password.': 'Ceci est un des 10 mots de passe les plus courants.',
        'This is a top-100 common password': 'Ceci est un des 100 mots de passe les plus courants',
        'This is a top-100 common password.': 'Ceci est un des 100 mots de passe les plus courants.',
        'This is a very common password': 'Ceci est un mot de passe très courant',
        'This is a very common password.': 'Ceci est un mot de passe très courant.',
        'This is similar to a commonly used password': 'Ceci est similaire à un mot de passe couramment utilisé',
        'This is similar to a commonly used password.': 'Ceci est similaire à un mot de passe couramment utilisé.'
    };
    
    return translations[warning] || warning;
}

async function testPasswordSecurity(password) {
    // Charger zxcvbn en lazy-load
    if (typeof zxcvbn === 'undefined') {
        if (typeof window.loadZxcvbn === 'function') {
            await window.loadZxcvbn();
        } else {
            return;
        }
    }
    
    // Si le mot de passe est vide, réinitialiser l'affichage
    if (!password || password.trim() === '') {
        const scoreFill = document.getElementById('score-fill');
        const scoreText = document.getElementById('score-text');
        const crackTime = document.getElementById('crack-time');
        const feedbackList = document.getElementById('feedback-list');
        
        if (scoreFill) scoreFill.style.width = '0%';
        if (scoreText) scoreText.textContent = 'Entrez un mot de passe pour tester';
        if (crackTime) crackTime.textContent = '-';
        if (feedbackList) feedbackList.innerHTML = '<li>Entrez un mot de passe pour voir les suggestions</li>';
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
    
    // Temps de crack - utiliser le temps de crack brut et le formater
    const crackTimeSeconds = result.crack_times_seconds.offline_slow_hashing_1e4_per_second;
    crackTime.textContent = formatCrackTime(crackTimeSeconds);
    
    // Suggestions traduites en français
    feedbackList.innerHTML = '';
    if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
        result.feedback.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = translateSuggestion(suggestion);
            feedbackList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Excellent ! Votre mot de passe est très sécurisé.';
        li.style.color = '#22c55e';
        feedbackList.appendChild(li);
    }
    
    // Avertissements traduits
    if (result.feedback.warning) {
        const li = document.createElement('li');
        li.textContent = `⚠️ ${translateWarning(result.feedback.warning)}`;
        li.style.color = '#f59e0b';
        feedbackList.appendChild(li);
    }
}

function loadFullHistory() {
    const fullHistoryList = document.getElementById('full-history-list');
    if (!fullHistoryList) return;
    
    // Récupérer l'historique complet depuis localStorage
    const fullHistory = JSON.parse(sessionStorage.getItem('kironFullHistory') || '[]');
    
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
                sessionStorage.setItem('kironFullHistory', JSON.stringify(fullHistory));
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
        languageModalClose.addEventListener('click', closeLanguageModal);
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
