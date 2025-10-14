// =====================================================
// LAZY LOADER - KironPass
// =====================================================
// Charge les scripts lourds uniquement quand nécessaire
// pour améliorer les performances initiales

(function() {
    'use strict';
    
    // État des scripts chargés
    const loadedScripts = {
        zxcvbn: false,
        stripe: false,
        googleSignIn: false
    };
    
    /**
     * Charge zxcvbn pour l'évaluation de la force des mots de passe
     */
    window.loadZxcvbn = function() {
        return new Promise((resolve, reject) => {
            if (loadedScripts.zxcvbn || window.zxcvbn) {
                resolve(window.zxcvbn);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js';
            script.async = true;
            script.onload = () => {
                loadedScripts.zxcvbn = true;
                resolve(window.zxcvbn);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    
    /**
     * Charge Stripe SDK
     */
    window.loadStripe = function() {
        return new Promise((resolve, reject) => {
            if (loadedScripts.stripe || window.Stripe) {
                resolve(window.Stripe);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            script.onload = () => {
                loadedScripts.stripe = true;
                resolve(window.Stripe);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    
    /**
     * Charge Google Sign-In SDK
     */
    window.loadGoogleSignIn = function() {
        return new Promise((resolve, reject) => {
            if (loadedScripts.googleSignIn || window.google) {
                resolve(window.google);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.onload = () => {
                loadedScripts.googleSignIn = true;
                // Initialiser Google Sign-In si la fonction existe
                if (typeof window.initGoogleSignIn === 'function') {
                    window.initGoogleSignIn();
                }
                resolve(window.google);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    
})();

