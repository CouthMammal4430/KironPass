// ===================== FICHIER COMMUN POUR TOUTES LES PAGES =====================

// ===================== GESTION DU THÈME =====================
function initTheme() {
    // Charger le thème depuis localStorage
    let savedTheme = localStorage.getItem('kironTheme') || 'theme-dark';
    
    // Appliquer le thème au body immédiatement
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(savedTheme);
    
    // Mettre à jour l'icône si elle existe
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'theme-dark' ? '🌙' : '☀️';
    }
    
    // Ne pas ajouter l'event listener si déjà fait par script.js
    if (window.themeInitialized) return;
    
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;
    
    themeBtn.addEventListener('click', () => {
        let current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
        let next = current === 'theme-dark' ? 'theme-light' : 'theme-dark';
        document.body.classList.remove(current);
        document.body.classList.add(next);
        localStorage.setItem('kironTheme', next);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = next === 'theme-dark' ? '🌙' : '☀️';
        }
    });
    
    window.themeInitialized = true;
}

// ===================== GESTION DU MENU HAMBURGER =====================
function initHamburger() {
    // Ne pas initialiser si script.js s'en occupe déjà (sur index.html)
    if (window.hamburgerInitialized) return;
    
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (!hamburgerBtn || !userDropdown) return;
    
    function toggleUserDropdown() {
        userDropdown.classList.toggle('show');
        hamburgerBtn.classList.toggle('active');
    }
    
    function closeUserDropdown() {
        userDropdown.classList.remove('show');
        hamburgerBtn.classList.remove('active');
    }
    
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserDropdown();
    });
    
    // Fermer le dropdown en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Gérer les clics sur les éléments du menu
    const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            closeUserDropdown();
        });
    });
    
    window.hamburgerInitialized = true;
}

// ===================== GESTION DU MENU RESSOURCES =====================
function initResourcesMenu() {
    const resourcesBtn = document.getElementById('resources-btn');
    const resourcesDropdown = document.getElementById('resources-dropdown');
    
    if (!resourcesBtn || !resourcesDropdown) return;
    
    resourcesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resourcesDropdown.classList.toggle('show');
    });
    
    // Fermer le dropdown en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!resourcesDropdown.contains(e.target) && !resourcesBtn.contains(e.target)) {
            resourcesDropdown.classList.remove('show');
        }
    });
}

// ===================== SYSTÈME DE TRADUCTION =====================
let currentLanguage = localStorage.getItem('kironLanguage') || 'fr';

const translations = {
    fr: {
        'discover-gold': 'Découvrir Gold',
        'resources': 'Ressources',
        'theme': 'Thème',
        'login': 'Se connecter',
        'common-passwords-2024': 'Les 10 mots de passe les plus courants en 2024',
        'password-strength-test': 'Test de force de mot de passe',
        'password-improver': 'Améliorateur de mot de passe',
        'generate': 'Générer',
        'copy': 'Copier',
        'password-generator': 'Générateur de mot de passe',
        'password': 'MOT DE PASSE',
        'passphrase': 'PHRASE DE PASSE',
        'uppercase': 'MAJUSCULES',
        'numbers': 'CHIFFRES',
        'symbols': 'SYMBOLES',
        'length': 'Longueur',
        'words': 'Mots',
        'history': 'Historique',
        'security-title': 'Besoin d\'un rappel sur les bonnes pratiques des mots de passe ?',
        'security-length': 'Longueur',
        'security-length-desc': 'Utilisez au moins <strong>12 caractères</strong>. Plus c\'est long, plus c\'est sécurisé !',
        'security-complexity': 'Complexité',
        'security-complexity-desc': 'Mélangez <strong>majuscules, minuscules, chiffres et symboles</strong> pour une sécurité maximale.',
        'security-uniqueness': 'Unicité',
        'security-uniqueness-desc': 'Un mot de passe <strong>unique pour chaque compte</strong>. Ne réutilisez jamais le même !',
        'gold-features': 'Fonctionnalités Gold',
        'gold-feature-1': 'Multi-génération de mots de passe',
        'gold-feature-2': 'Patterns personnalisés',
        'gold-feature-3': 'Historique complet illimité',
        'gold-feature-4': 'Thème dynamique & boutons animés',
        'gold-feature-5': 'Notifications stylées',
        'gold-feature-6': 'Couleurs et glow premium',
        'gold-feature-7': 'Responsive sur mobile, tablette et PC',
        'faq': 'FAQ',
        'faq-1-q': 'Comment fonctionne le mode Gold ?',
        'faq-1-a': 'Le mode Gold permet de générer plusieurs mots de passe à la fois, d\'utiliser des patterns personnalisés et de débloquer l\'historique complet.',
        'faq-2-q': 'Comment copier mon mot de passe ?',
        'faq-2-a': 'Cliquez simplement sur le bouton "Copier" à droite de la barre du mot de passe.',
        'faq-3-q': 'Est-ce sécurisé ?',
        'faq-3-a': 'Oui, tous les mots de passe sont générés côté client et ne sont jamais envoyés sur un serveur.',
        'copyright': '© 2025 KironPass – Tous droits réservés',
        'contact-link': 'Contact',
        'terms-link': 'CGU',
        'privacy-link': 'Politique de confidentialité',
        'security-test': 'Comment savoir si votre mot de passe est sécurisé ?',
        'test-here': 'Testez-le ici',
        'strength': 'Force',
        // Password improver page
        'password-improver-title': 'Améliorateur de mot de passe',
        'password-improver-desc1': 'Transformez vos mots de passe faibles en mots de passe ultra-sécurisés avec trois niveaux d\'amélioration.',
        'password-improver-desc2': 'Choisissez le niveau de sécurité souhaité et laissez KironPass améliorer votre mot de passe !',
        'enter-password-label': 'Entrez le mot de passe à améliorer :',
        'password-placeholder': 'Votre mot de passe...',
        'choose-level': 'Choisissez le niveau d\'amélioration :',
        'level-simple': 'Simple',
        'level-simple-desc': 'Ajout basique de sécurité',
        'level-medium': 'Moyen',
        'level-medium-desc': 'Sécurité renforcée',
        'level-strong': 'Fort',
        'level-strong-desc': 'Sécurité maximale',
        'improve-button': 'Améliorer mon mot de passe',
        'original-password': 'Mot de passe original :',
        'improved-password': 'Mot de passe amélioré :',
        'improvements-applied': 'Améliorations appliquées :',
        'how-levels-work': 'Comment fonctionnent les niveaux d\'amélioration ?',
        'level-simple-title': 'Niveau Simple',
        'level-simple-explain': 'Ajoute un symbole aléatoire et un chiffre au début et à la fin de votre mot de passe sans modifier le mot original.',
        'level-medium-title': 'Niveau Moyen',
        'level-medium-explain': 'Ajoute deux symboles et deux chiffres (début et fin), met une majuscule si le mot n\'en contient pas, et remplace parfois une lettre par un chiffre visuellement proche (a→4, e→3, o→0, i→1).',
        'level-strong-title': 'Niveau Fort',
        'level-strong-explain': 'Ajoute des caractères aléatoires (lettres, chiffres, symboles) avant, après et à l\'intérieur du mot. Mélange aléatoirement la casse et intègre certains chiffres ou symboles directement dans le mot.',
        'important-to-know': 'Important à savoir',
        'important-text': 'L\'amélioration de mot de passe est utile pour renforcer des mots de passe faibles, mais il est toujours recommandé de :',
        'important-1': 'Utiliser un mot de passe complètement aléatoire généré par notre',
        'important-1-link': 'générateur',
        'important-2': 'Ne jamais réutiliser le même mot de passe sur plusieurs sites',
        'important-3': 'Utiliser un gestionnaire de mots de passe pour stocker vos mots de passe en toute sécurité',
        'important-4': 'Activer l\'authentification à deux facteurs quand c\'est possible',
        // Password test page
        'password-test-title': 'Test de Sécurité des Mots de Passe',
        'test-desc1': 'Testez la force de vos mots de passe et découvrez combien de temps un pirate informatique prendrait pour les craquer.',
        'test-desc2': 'En moyenne, un pirate peut tester environ',
        'test-desc3': '1 milliard de combinaisons par seconde',
        'test-desc4': 'avec des outils modernes.',
        'enter-test-password': 'Entrez votre mot de passe à tester :',
        'security-score': 'Score de sécurité',
        'enter-password-score': 'Entrez un mot de passe',
        'crack-time': 'Temps de crack estimé',
        'improvement-suggestions': 'Suggestions d\'amélioration',
        'enter-password-suggestions': 'Entrez un mot de passe pour voir les suggestions',
        // Common passwords page
        'most-common-passwords-title': 'Les 10 mots de passe les plus courants en 2024'
    },
    en: {
        'discover-gold': 'Discover Gold',
        'resources': 'Resources',
        'theme': 'Theme',
        'login': 'Login',
        'common-passwords-2024': 'Top 10 Most Common Passwords in 2024',
        'password-strength-test': 'Password Strength Test',
        'password-improver': 'Password Improver',
        'generate': 'Generate',
        'copy': 'Copy',
        'password-generator': 'Password Generator',
        'password': 'PASSWORD',
        'passphrase': 'PASSPHRASE',
        'uppercase': 'UPPERCASE',
        'numbers': 'NUMBERS',
        'symbols': 'SYMBOLS',
        'length': 'Length',
        'words': 'Words',
        'history': 'History',
        'security-title': 'Need a reminder about password best practices?',
        'security-length': 'Length',
        'security-length-desc': 'Use at least <strong>12 characters</strong>. The longer, the more secure!',
        'security-complexity': 'Complexity',
        'security-complexity-desc': 'Mix <strong>uppercase, lowercase, numbers, and symbols</strong> for maximum security.',
        'security-uniqueness': 'Uniqueness',
        'security-uniqueness-desc': 'A <strong>unique password for each account</strong>. Never reuse the same one!',
        'gold-features': 'Gold Features',
        'gold-feature-1': 'Multi-password generation',
        'gold-feature-2': 'Custom patterns',
        'gold-feature-3': 'Unlimited full history',
        'gold-feature-4': 'Dynamic theme & animated buttons',
        'gold-feature-5': 'Styled notifications',
        'gold-feature-6': 'Premium colors and glow',
        'gold-feature-7': 'Responsive on mobile, tablet, and PC',
        'faq': 'FAQ',
        'faq-1-q': 'How does Gold mode work?',
        'faq-1-a': 'Gold mode allows you to generate multiple passwords at once, use custom patterns, and unlock full history.',
        'faq-2-q': 'How do I copy my password?',
        'faq-2-a': 'Simply click the "Copy" button to the right of the password bar.',
        'faq-3-q': 'Is it secure?',
        'faq-3-a': 'Yes, all passwords are generated client-side and are never sent to a server.',
        'copyright': '© 2025 KironPass – All rights reserved',
        'contact-link': 'Contact',
        'terms-link': 'Terms of Service',
        'privacy-link': 'Privacy Policy',
        'security-test': 'How to know if your password is secure?',
        'test-here': 'Test it here',
        'strength': 'Strength',
        // Password improver page
        'password-improver-title': 'Password Improver',
        'password-improver-desc1': 'Transform your weak passwords into ultra-secure passwords with three improvement levels.',
        'password-improver-desc2': 'Choose your desired security level and let KironPass improve your password!',
        'enter-password-label': 'Enter the password to improve:',
        'password-placeholder': 'Your password...',
        'choose-level': 'Choose the improvement level:',
        'level-simple': 'Simple',
        'level-simple-desc': 'Basic security addition',
        'level-medium': 'Medium',
        'level-medium-desc': 'Enhanced security',
        'level-strong': 'Strong',
        'level-strong-desc': 'Maximum security',
        'improve-button': 'Improve my password',
        'original-password': 'Original password:',
        'improved-password': 'Improved password:',
        'improvements-applied': 'Improvements applied:',
        'how-levels-work': 'How do improvement levels work?',
        'level-simple-title': 'Simple Level',
        'level-simple-explain': 'Adds a random symbol and a number at the beginning and end of your password without modifying the original word.',
        'level-medium-title': 'Medium Level',
        'level-medium-explain': 'Adds two symbols and two numbers (beginning and end), adds an uppercase letter if the word doesn\'t contain one, and sometimes replaces a letter with a visually similar number (a→4, e→3, o→0, i→1).',
        'level-strong-title': 'Strong Level',
        'level-strong-explain': 'Adds random characters (letters, numbers, symbols) before, after, and inside the word. Randomly mixes the case and integrates certain numbers or symbols directly into the word.',
        'important-to-know': 'Important to know',
        'important-text': 'Password improvement is useful for strengthening weak passwords, but it is always recommended to:',
        'important-1': 'Use a completely random password generated by our',
        'important-1-link': 'generator',
        'important-2': 'Never reuse the same password on multiple sites',
        'important-3': 'Use a password manager to store your passwords securely',
        'important-4': 'Enable two-factor authentication when possible',
        // Password test page
        'password-test-title': 'Password Security Test',
        'test-desc1': 'Test the strength of your passwords and find out how long a hacker would take to crack them.',
        'test-desc2': 'On average, a hacker can test about',
        'test-desc3': '1 billion combinations per second',
        'test-desc4': 'with modern tools.',
        'enter-test-password': 'Enter your password to test:',
        'security-score': 'Security score',
        'enter-password-score': 'Enter a password',
        'crack-time': 'Estimated crack time',
        'improvement-suggestions': 'Improvement suggestions',
        'enter-password-suggestions': 'Enter a password to see suggestions',
        // Common passwords page
        'most-common-passwords-title': 'Top 10 Most Common Passwords in 2024'
    }
};

function updateLanguageUI() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            const translation = translations[currentLanguage][key];
            
            // Gérer le HTML (balises <strong>)
            if (translation.includes('<strong>')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = currentLanguage;
}

function initLanguageSwitch() {
    const languageItem = document.getElementById('language-item');
    if (!languageItem) return;
    
    // Mettre à jour l'affichage du drapeau dans le menu
    function updateLanguageDisplay() {
        const flag = currentLanguage === 'fr' ? '🇫🇷' : '🇬🇧';
        const text = currentLanguage === 'fr' ? 'Français' : 'English';
        languageItem.innerHTML = `<span class="dropdown-icon">${flag}</span><span>${text}</span>`;
    }
    
    // Initialiser l'affichage
    updateLanguageDisplay();
    
    languageItem.addEventListener('click', () => {
        // Basculer la langue
        currentLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
        localStorage.setItem('kironLanguage', currentLanguage);
        
        // Mettre à jour immédiatement l'affichage du menu
        updateLanguageDisplay();
        
        // Mettre à jour l'interface
        updateLanguageUI();
        
        // Afficher une notification
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = currentLanguage === 'fr' ? 'Langue changée en Français 🇫🇷' : 'Language changed to English 🇬🇧';
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 1500);
        }
    });
}

// ===================== NOTIFICATIONS =====================
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1500);
}

// ===================== INITIALISATION =====================
function initCommon() {
    initTheme();
    initHamburger();
    initResourcesMenu();
    initLanguageSwitch();
    updateLanguageUI();
}

// S'exécuter immédiatement si le DOM est déjà chargé, sinon attendre
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    // DOM déjà chargé, exécuter immédiatement
    initCommon();
}

