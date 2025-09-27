// Configuration des variables d'environnement pour le client
// Les valeurs seront injectées par Netlify lors du déploiement
window.ENV = {
    STRIPE_PUBLISHABLE_KEY: '',
    STRIPE_PRICE_ID: '',
    EMAILJS_PUBLIC_KEY: '',
    EMAILJS_SERVICE_ID: '',
    EMAILJS_TEMPLATE_ID: '',
    GOOGLE_CLIENT_ID: ''
};

// Fonction pour récupérer les variables d'environnement depuis Netlify
async function loadEnvVars() {
    try {
        const response = await fetch('/.netlify/functions/env');
        if (response.ok) {
            const envVars = await response.json();
            window.ENV = { ...window.ENV, ...envVars };
            console.log('✅ Variables d\'environnement chargées depuis Netlify');
        }
    } catch (error) {
        console.log('⚠️ Variables d\'environnement non disponibles:', error.message);
    }
}

// Charger les variables d'environnement au démarrage
loadEnvVars();