## Génération automatique des favicons/icônes

1. Placez votre image source sous `assets/logo-source.png` (PNG, idéalement 1024x1024, fond transparent).
2. Installez les dépendances (une seule fois):

```bash
npm install
```

3. Générez les icônes:

```bash
npm run icons
```

Cela créera à la racine: `favicon-16.png`, `favicon-32.png`, `favicon.png`, `apple-touch-icon.png`, `favicon-192.png`, `favicon-512.png`, `favicon.ico`.

Les balises `<link>` et le manifeste sont déjà configurés dans `index.html` et `public/site.webmanifest`.

# https-github.com-couthmammal4430-Kiron