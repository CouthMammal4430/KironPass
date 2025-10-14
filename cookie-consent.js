// =====================================================
// COOKIE CONSENT MANAGER - KironPass (OPTIMISÉ)
// =====================================================
// Version optimisée pour de meilleures performances

(function() {
    'use strict';
    
    const CK = 'kironpass_cookie_consent';
    const EK = 'ezCMPCookieConsent';
    const EXP = 31536000000; // 365 jours en ms
    
    // Vérifier consentement
    function hasConsent() {
        try {
            const c = localStorage.getItem(CK);
            if (c) {
                const d = JSON.parse(c);
                if (d.expiry > Date.now()) return true;
            }
            if (localStorage.getItem(EK)) {
                saveConsent();
                return true;
            }
        } catch (e) {}
        return false;
    }
    
    // Sauvegarder consentement
    function saveConsent() {
        try {
            const now = Date.now();
            localStorage.setItem(CK, JSON.stringify({
                accepted: true,
                timestamp: now,
                expiry: now + EXP,
                version: '1.0'
            }));
        } catch (e) {}
    }
    
    // Injecter CSS bloqueur
    function injectCSS() {
        if (document.getElementById('ezoic-cmp-blocker')) return;
        const s = document.createElement('style');
        s.id = 'ezoic-cmp-blocker';
        s.textContent = 'div[class*="gatekeeper"],div[id*="gatekeeper"],div[class*="cmp"],div[id*="cmp"],.gk-cmp-modal,.gk-cmp-overlay,.ezstandalone-cmp,iframe[src*="gatekeeper"],iframe[src*="cmp"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important}body,html{overflow:auto!important}body{position:static!important}';
        (document.head || document.documentElement).appendChild(s);
    }
    
    // Supprimer bannière CMP
    function removeCMP() {
        ['div[class*="gatekeeper"]','div[id*="gatekeeper"]','div[class*="cmp-modal"]','div[id*="cmp"]','.gk-cmp-modal','.gk-cmp-overlay'].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
    }
    
    // Observer DOM
    function observe() {
        const obs = new MutationObserver(removeCMP);
        obs.observe(document.body || document.documentElement, {childList: true, subtree: true});
        setTimeout(() => obs.disconnect(), 5000);
    }
    
    // Écouter acceptation
    function listen() {
        document.addEventListener('click', function(e) {
            const txt = (e.target.textContent || '').toLowerCase();
            if (txt.includes('accept') || txt.includes('accepter') || txt.includes('agree')) {
                saveConsent();
            }
        }, true);
        
        const origSet = localStorage.setItem;
        localStorage.setItem = function(k, v) {
            if (k.includes('ezoic') || k.includes('gatekeeper') || k.includes('CMP')) {
                saveConsent();
            }
            origSet.apply(this, arguments);
        };
    }
    
    // Init
    (function init() {
        if (hasConsent()) {
            injectCSS();
            window.ezstandalone = window.ezstandalone || {};
            window.ezstandalone.enabled = false;
            
            if (document.body) {
                observe();
                removeCMP();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    observe();
                    removeCMP();
                });
            }
            
            const interval = setInterval(removeCMP, 500);
            setTimeout(() => clearInterval(interval), 3000);
        } else {
            listen();
        }
    })();
    
    // API
    window.KironPassConsent = {
        hasConsented: hasConsent,
        saveConsent: saveConsent,
        reset: function() {
            localStorage.removeItem(CK);
            localStorage.removeItem(EK);
            location.reload();
        }
    };
})();

