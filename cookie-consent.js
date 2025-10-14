// =====================================================
// COOKIE CONSENT MANAGER - KironPass
// =====================================================
// Gère le consentement aux cookies pour éviter que la bannière
// Ezoic ne s'affiche à chaque changement de page

(function() {
    'use strict';
    
    const CONSENT_KEY = 'kironpass_cookie_consent';
    const EZOIC_CONSENT_KEY = 'ezCMPCookieConsent'; // Clé utilisée par Ezoic
    const CONSENT_EXPIRY_DAYS = 365;
    
    /**
     * Vérifie si l'utilisateur a déjà donné son consentement
     */
    function hasUserConsented() {
        try {
            // Vérifier notre propre clé
            const consent = localStorage.getItem(CONSENT_KEY);
            if (consent) {
                const consentData = JSON.parse(consent);
                const now = new Date().getTime();
                
                if (consentData.expiry && consentData.expiry > now) {
                    return true;
                }
            }
            
            // Vérifier aussi la clé Ezoic native
            const ezoicConsent = localStorage.getItem(EZOIC_CONSENT_KEY);
            if (ezoicConsent) {
                // Si Ezoic a déjà un consentement, on le synchronise
                saveConsent(true);
                return true;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Enregistre le consentement de l'utilisateur
     */
    function saveConsent(accepted = true) {
        try {
            const now = new Date().getTime();
            const expiry = now + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
            
            const consentData = {
                accepted: accepted,
                timestamp: now,
                expiry: expiry,
                version: '1.0'
            };
            
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        } catch (e) {
            // Silencieux
        }
    }
    
    /**
     * Injecte le CSS pour masquer la bannière
     */
    function injectBlockerCSS() {
        if (document.getElementById('ezoic-cmp-blocker')) {
            return; // Déjà injecté
        }
        
        const style = document.createElement('style');
        style.id = 'ezoic-cmp-blocker';
        style.textContent = `
            /* Masquer TOUTES les modales Ezoic/Gatekeeper */
            div[class*="gatekeeper"],
            div[id*="gatekeeper"],
            div[class*="cmp"],
            div[id*="cmp"],
            .gk-cmp-modal,
            .gk-cmp-overlay,
            .ezstandalone-cmp,
            iframe[src*="gatekeeper"],
            iframe[src*="cmp"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
            }
            
            /* Restaurer le scroll */
            body {
                overflow: auto !important;
                position: static !important;
            }
            
            html {
                overflow: auto !important;
            }
        `;
        
        (document.head || document.documentElement).appendChild(style);
    }
    
    /**
     * Supprime la bannière du DOM si elle existe
     */
    function removeCMPFromDOM() {
        const selectors = [
            'div[class*="gatekeeper"]',
            'div[id*="gatekeeper"]',
            'div[class*="cmp-modal"]',
            'div[id*="cmp"]',
            '.gk-cmp-modal',
            '.gk-cmp-overlay'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.remove();
            });
        });
    }
    
    /**
     * Observe le DOM pour supprimer la bannière si elle apparaît
     */
    function observeAndBlock() {
        const observer = new MutationObserver(function(mutations) {
            removeCMPFromDOM();
        });
        
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
        
        // Nettoyer après 5 secondes (la bannière devrait être chargée)
        setTimeout(() => observer.disconnect(), 5000);
    }
    
    /**
     * Bloque les scripts Ezoic de s'exécuter
     */
    function blockEzoicScripts() {
        // Intercepter les appels Ezoic
        window.ezstandalone = window.ezstandalone || {};
        window.ezstandalone.enabled = false;
        
        // Empêcher le CMP de se charger
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    // Bloquer les scripts CMP
                    if (name === 'src' && value && 
                        (value.includes('gatekeeper') || value.includes('cmp'))) {
                        return;
                    }
                    originalSetAttribute.call(element, name, value);
                };
            }
            
            return element;
        };
    }
    
    /**
     * Écoute les clics pour sauvegarder le consentement
     */
    function listenForConsent() {
        document.addEventListener('click', function(e) {
            const target = e.target;
            const text = target.textContent?.toLowerCase() || '';
            
            // Détection large des boutons d'acceptation
            if (text.includes('accept') || text.includes('accepter') || 
                text.includes('tout accepter') || text.includes('agree')) {
                saveConsent(true);
            }
        }, true);
        
        // Observer le localStorage pour les changements Ezoic
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key.includes('ezoic') || key.includes('gatekeeper') || key.includes('CMP')) {
                saveConsent(true);
            }
            originalSetItem.apply(this, arguments);
        };
    }
    
    /**
     * Initialisation IMMÉDIATE
     */
    (function init() {
        const hasConsented = hasUserConsented();
        
        if (hasConsented) {
            // BLOQUER immédiatement
            injectBlockerCSS();
            blockEzoicScripts();
            
            // Observer et nettoyer en continu
            if (document.body) {
                observeAndBlock();
                removeCMPFromDOM();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    observeAndBlock();
                    removeCMPFromDOM();
                });
            }
            
            // Nettoyage répété (au cas où)
            setInterval(removeCMPFromDOM, 500);
            setTimeout(() => clearInterval, 3000);
        } else {
            // Pas encore de consentement, écouter
            listenForConsent();
        }
    })();
    
    // API publique (sans bouton reset)
    window.KironPassConsent = {
        hasConsented: hasUserConsented,
        saveConsent: saveConsent,
        reset: function() {
            localStorage.removeItem(CONSENT_KEY);
            localStorage.removeItem(EZOIC_CONSENT_KEY);
            location.reload();
        }
    };
    
})();

