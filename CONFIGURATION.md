# 🔐 Configuration des variables d'environnement

## Variables à configurer sur Netlify

Ajoutez ces variables dans votre dashboard Netlify (Site settings > Environment variables) :

```
STRIPE_PRICE_ID=price_1S8oPKQtcnMXTC8QBT2i4Sx1
STRIPE_PUBLISHABLE_KEY=pk_live_51S8MiXQtcnMXTC8Qw7cjVK5sUO32mRbnDpZedf62AtDxoDXxadsbSXG1eLdcycSpdb43h49kKAS2G289vAiTIr5i00jKvAl1ux
EMAILJS_PUBLIC_KEY=waHyIv_Nbx409q_cE
EMAILJS_SERVICE_ID=service_jk3zxrc
EMAILJS_TEMPLATE_ID=template_nhj5zs3
GOOGLE_CLIENT_ID=829701736270-vlqfh2j33foneoetm7un7497u68vgp1e.apps.googleusercontent.com
```

## Fonctionnement

- Les variables sont chargées automatiquement depuis Netlify
- Si les variables ne sont pas disponibles, l'application utilisera des valeurs vides
- Aucun secret n'est exposé dans le code source

## Test

Après avoir configuré les variables, déployez votre site. Vous devriez voir dans la console :
"✅ Variables d'environnement chargées depuis Netlify"
