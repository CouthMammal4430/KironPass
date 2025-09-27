exports.handler = async (event, context) => {
    // Retourner les variables d'environnement sécurisées
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET'
        },
        body: JSON.stringify({
            STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
            STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || '',
            EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
            EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
            EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
        })
    };
};
