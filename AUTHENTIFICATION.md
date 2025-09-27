# Configuration de l'Authentification - KironPass

Ce document explique comment configurer les différentes méthodes d'authentification pour KironPass.

## 🔧 Configuration des Variables d'Environnement

### Variables Netlify Requises

Ajoutez ces variables dans votre dashboard Netlify (Site settings > Environment variables) :

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=votre_google_client_id_ici

# Apple Sign In (optionnel)
APPLE_CLIENT_ID=votre_apple_client_id_ici

# Facebook Login (optionnel)
FACEBOOK_APP_ID=votre_facebook_app_id_ici

# Autres services existants
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
EMAILJS_PUBLIC_KEY=...
EMAILJS_SERVICE_ID=...
EMAILJS_TEMPLATE_ID=...
```

## 🔐 Configuration Google OAuth 2.0

### 1. Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API "Google+ API" et "People API"

### 2. Configurer OAuth 2.0
1. Allez dans "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
2. Sélectionnez "Web application"
3. Ajoutez vos domaines autorisés :
   - `localhost` (pour le développement)
   - Votre domaine Netlify (ex: `votre-site.netlify.app`)
4. Copiez le "Client ID" et ajoutez-le à vos variables d'environnement Netlify

### 3. Domaines autorisés
Dans Google Cloud Console, ajoutez ces domaines aux "Authorized JavaScript origins" :
- `http://localhost:8888`
- `https://votre-site.netlify.app`

## 🍎 Configuration Apple Sign In (Optionnel)

### 1. Créer un App ID Apple
1. Allez sur [Apple Developer Portal](https://developer.apple.com/)
2. Créez un nouvel App ID
3. Activez "Sign In with Apple"

### 2. Créer un Service ID
1. Créez un nouveau Service ID
2. Configurez les domaines autorisés
3. Ajoutez votre domaine Netlify

### 3. Configuration du site
Pour une implémentation complète, vous devrez :
1. Intégrer le SDK Apple Sign In JavaScript
2. Configurer les callbacks et la validation côté serveur
3. Ajouter le Service ID aux variables d'environnement

## 📘 Configuration Facebook Login (Optionnel)

### 1. Créer une App Facebook
1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle app
3. Ajoutez le produit "Facebook Login"

### 2. Configuration
1. Ajoutez votre domaine aux "App Domains"
2. Configurez les "Valid OAuth Redirect URIs"
3. Copiez l'App ID vers vos variables d'environnement

### 3. Implémentation
Pour une implémentation complète, vous devrez :
1. Intégrer le SDK Facebook JavaScript
2. Configurer les permissions et callbacks
3. Implémenter la validation côté serveur

## 🚀 Déploiement

1. Ajoutez toutes les variables d'environnement dans Netlify
2. Redéployez votre site
3. Testez chaque méthode d'authentification

## 🧪 Mode Développement

Pour le développement local, vous pouvez :
1. Créer un fichier `.env` local (ne pas le commiter)
2. Ou utiliser les variables d'environnement directement dans `config.js` pour les tests

## 📝 Notes Importantes

- **Google** : Fonctionne immédiatement une fois le Client ID configuré
- **Apple** : Actuellement en mode simulation, nécessite une implémentation complète
- **Facebook** : Actuellement en mode simulation, nécessite une implémentation complète
- Les authentifications Apple et Facebook sont fonctionnelles en mode démo pour tester l'interface

## 🔍 Dépannage

### Google ne fonctionne pas
1. Vérifiez que `GOOGLE_CLIENT_ID` est défini
2. Vérifiez que votre domaine est autorisé dans Google Cloud Console
3. Consultez la console du navigateur pour les erreurs

### Messages d'erreur courants
- "Google Auth non configuré" : `GOOGLE_CLIENT_ID` manquant
- "Erreur Google Auth" : Problème de configuration ou domaine non autorisé

## 📞 Support

Pour toute question sur la configuration, consultez :
- [Documentation Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Documentation Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
- [Documentation Facebook Login](https://developers.facebook.com/docs/facebook-login/)
