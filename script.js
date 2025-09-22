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
// Multi-génération retirée
const passwordLength = document.getElementById('passwordLength');
const passwordLengthValue = document.getElementById('passwordLengthValue');

let history = [];

// ===================== STRIPE ET ABONNEMENT =====================
let stripe = null;
let elements = null;
let paymentElement = null;

// Configuration Stripe - Variables d'environnement
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S8MiXQtcnMXTC8Qw7cjVK5sUO32mRbnDpZedf62AtDxoDXxadsbSXG1eLdcycSpdb43h49kKAS2G289vAiTIr5i00jKvAl1ux';
const STRIPE_PRICE_ID = 'price_1S8oPKQtcnMXTC8QBT2i4Sx1';
const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : '/.netlify/functions';

// Gestion de l'abonnement utilisateur
let userSubscription = JSON.parse(localStorage.getItem('kironSubscription') || 'null');

// ===================== AUTH GOOGLE (GIS) =====================
let googleCredential = null;
let googleProfile = null;
let appUser = JSON.parse(localStorage.getItem('kironUser') || 'null');

// REMPLACEZ par votre Client ID OAuth 2.0 (type Web) créé dans Google Cloud Console
const GOOGLE_CLIENT_ID = '829701736270-vlqfh2j33foneoetm7un7497u68vgp1e.apps.googleusercontent.com';

// Exposé global pour l'attribut onload du script GIS dans index.html
window.initGoogleSignIn = function initGoogleSignIn() {
    if (!window.google || !google.accounts || !google.accounts.id) return;

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
    showNotification('Déconnecté');
}

function updateAuthUI() {
    if (!authControls) return;
    authControls.innerHTML = '';

    const sessionName = (googleProfile && (googleProfile.name || googleProfile.email)) || (appUser && appUser.email);
    if (googleProfile || appUser) {
        // Masquer le menu hamburger par défaut
        if (userMenu) userMenu.style.display = 'none';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'auth-user';

        const img = document.createElement('img');
        img.className = 'auth-avatar';
        img.src = (googleProfile && googleProfile.picture) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(sessionName || 'U');
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
            signOutGoogle(); 
        });

        wrapper.appendChild(img);
        wrapper.appendChild(span);
        wrapper.appendChild(btn);
        authControls.appendChild(wrapper);
        
        // Afficher le menu hamburger pour les utilisateurs connectés
        if (userMenu) userMenu.style.display = 'flex';
    } else {
        // Masquer le menu hamburger si pas connecté
        if (userMenu) userMenu.style.display = 'none';
        
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

if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', openAuthModal);
if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
document.addEventListener('click', (e) => {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-close-modal')) closeAuthModal();
});

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
const EMAILJS_PUBLIC_KEY = 'waHyIv_Nbx409q_cE';
const EMAILJS_SERVICE_ID = 'service_jk3zxrc';
const EMAILJS_TEMPLATE_ID = 'template_nhj5zs3';

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
    
    // Initialiser Stripe si pas encore fait
    if (!stripe) {
        initializeStripe().then(success => {
            if (!success) {
                showNotification('Erreur d\'initialisation Stripe. Veuillez recharger la page.');
                document.body.style.overflow = '';
                return;
            }
        });
    }
    
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
    renderHistory();
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

        const copySpan = document.createElement('span');
        copySpan.classList.add('copy-icon');
        copySpan.title = 'Copier';
        copySpan.innerHTML = '\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n                <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"/>\n            </svg>\n        ';
        copySpan.addEventListener('click', () => {
            navigator.clipboard.writeText(pwd).then(() => showNotification('Copié !'));
        });

        div.appendChild(textSpan);
        div.appendChild(copySpan);
        historyList.appendChild(div);
    });
}

// ===================== EVENEMENTS =====================

// GENERATION MOT DE PASSE NORMAL
generateBtn.addEventListener('click', () => {
    let count = 1; // Free: 1
    const passwords = [];

    for (let i = 0; i < count; i++) {
        const requestedLength = Math.min(Math.max(parseInt(passwordLength.value) || 12, 6), 64);
        const pwd = generatePassword(requestedLength, {
            uppercase: includeUppercase.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        });
        passwords.push(pwd);
        if (i === 0) passwordOutput.value = pwd;
    }

    updateStrengthBar(passwords[0]);
    updateHistory(passwords);
});

// GENERATION MOT DE PASSE GOLD
generateGoldBtn.addEventListener('click', () => {
    const count = 5; // Gold: 5
    const passwords = [];

    for (let i = 0; i < count; i++) {
        const requestedLength = Math.min(Math.max(parseInt(passwordLength.value) || 12, 6), 64);
        const pwd = generatePassword(requestedLength, {
            uppercase: includeUppercase.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        });
        passwords.push(pwd);
        if (i === 0) passwordOutput.value = pwd;
    }

    updateStrengthBar(passwords[0]);
    updateHistory(passwords);
});

// ===================== COPIER AVEC GLOW =====================
copyBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    navigator.clipboard.writeText(passwordOutput.value).then(() => {
        showNotification('Copié !');
        copyBtn.classList.add('active');
        setTimeout(() => copyBtn.classList.remove('active'), 400);
    });
});

// (Toggle historique supprimé, liste désormais scrollable)

// ===================== MICRO-INTERACTIONS BOUTONS =====================
[generateBtn, generateGoldBtn, copyBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.01)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});

// ===================== BARRE DE FORCE DYNAMIQUE =====================
passwordOutput.addEventListener('input', () => updateStrengthBar(passwordOutput.value));

// Slider longueur - mise à jour valeur affichée
if (passwordLength && passwordLengthValue) {
    passwordLengthValue.textContent = passwordLength.value;
    passwordLength.addEventListener('input', () => {
        passwordLengthValue.textContent = passwordLength.value;
    });
}

// ===================== THEME DYNAMIQUE =====================
const themeBtn = document.getElementById('theme-btn');
let savedTheme = localStorage.getItem('kironTheme') || 'theme-dark';
document.body.classList.add(savedTheme);

themeBtn.addEventListener('click', () => {
    let current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
    let next = current === 'theme-dark' ? 'theme-light' : 'theme-dark';
    document.body.classList.remove(current);
    document.body.classList.add(next);
    localStorage.setItem('kironTheme', next);
});

// ===================== EVENT LISTENERS POUR NOUVELLES FONCTIONNALITÉS =====================

// Bouton "Découvrir Gold"
if (discoverGoldBtn) {
    discoverGoldBtn.addEventListener('click', openGoldModal);
} else {
    console.warn('Bouton "Découvrir Gold" non trouvé');
}

// Fermeture modale Gold
if (goldModalClose) {
    goldModalClose.addEventListener('click', closeGoldModal);
}

// Fermeture modale Abonnement
if (subscriptionModalClose) {
    subscriptionModalClose.addEventListener('click', closeSubscriptionModal);
}

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
        showNotification('Fonctionnalité en développement');
        closeUserDropdown();
    }
    if (e.target.closest('#history-item')) {
        showNotification('Historique complet disponible avec KironGold');
        closeUserDropdown();
    }
    if (e.target.closest('#settings-item')) {
        showNotification('Paramètres en développement');
        closeUserDropdown();
    }
    if (e.target.closest('#help-item')) {
        showNotification('Centre d\'aide en développement');
        closeUserDropdown();
    }
    if (e.target.closest('#logout-item')) {
        appUser = null;
        localStorage.removeItem('kironUser');
        signOutGoogle();
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
    }
});

// Bouton de paiement Stripe
document.addEventListener('click', (e) => {
    if (e.target.id === 'stripe-submit') {
        e.preventDefault();
        processSubscriptionPayment();
    }
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
    }
});
