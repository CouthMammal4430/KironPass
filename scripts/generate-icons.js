// Génère les favicons/icônes à partir d'un logo source avec sharp
// Entrée attendue: assets/logo-source.png (idéalement 1024x1024, fond transparent)

const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

const projectRoot = path.resolve(__dirname, '..');
const argPath = process.argv[2];
const defaultDir = path.join(projectRoot, 'assets');
const candidateNames = [
  'logo-source.png',
  'logo-source.PNG',
  'logo-source.jpg',
  'logo-source.jpeg',
  'logo-source.webp',
];

const outputs = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-192.png', size: 192 },
  { file: 'favicon-512.png', size: 512 },
  { file: 'favicon.png', size: 64 },
];

async function resolveInputPath() {
  // 1) Si un chemin est passé en argument, l'utiliser
  if (argPath) {
    const p = path.isAbsolute(argPath) ? argPath : path.join(projectRoot, argPath);
    try {
      await fs.access(p);
      return p;
    } catch {}
    throw new Error(`Chemin fourni introuvable: ${p}`);
  }

  // 2) Chercher automatiquement dans assets/ avec différentes extensions
  try {
    await fs.access(defaultDir);
    for (const name of candidateNames) {
      const p = path.join(defaultDir, name);
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
    const files = await fs.readdir(defaultDir).catch(() => []);
    throw new Error(
      `Image source introuvable dans ${defaultDir}.\n` +
      `Placez votre logo sous assets/logo-source.png (ou .jpg/.jpeg/.webp).\n` +
      `Fichiers présents: ${files.join(', ') || '(aucun)'}\n` +
      `Astuce: vous pouvez aussi passer un chemin: npm run icons -- assets/mon-image.png`
    );
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(`Dossier introuvable: ${defaultDir}. Créez-le puis mettez votre image dedans sous le nom logo-source.png.`);
    }
    throw e;
  }
}

async function generatePngs(inputPath) {
  // 1) Rogner automatiquement les bordures transparentes pour maximiser la surface utile
  const trimmedBuffer = await sharp(inputPath)
    .trim() // supprime les marges homogènes (idéal pour enlever le fond transparent inutile)
    .toBuffer();

  // 2) Redimensionner dans un carré en conservant la transparence
  await Promise.all(
    outputs.map(async ({ file, size }) => {
      const outPath = path.join(projectRoot, file);
      await sharp(trimmedBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      return file;
    })
  );
}

async function generateIco() {
  const tmp32 = path.join(projectRoot, 'favicon-32.png');
  const icoPath = path.join(projectRoot, 'favicon.ico');
  const buf = await fs.readFile(tmp32);
  const ico = await pngToIco(buf);
  await fs.writeFile(icoPath, ico);
}

async function main() {
  const inputPath = await resolveInputPath();
  console.log(`🔧 Génération des icônes à partir de: ${inputPath}`);
  await fs.mkdir(path.join(projectRoot, 'assets'), { recursive: true });
  await generatePngs(inputPath);
  await generateIco();
  console.log('✅ Icônes générées: favicon-16.png, favicon-32.png, favicon.png, apple-touch-icon.png, favicon-192.png, favicon-512.png, favicon.ico');
}

main().catch((err) => {
  console.error('❌ Erreur lors de la génération des icônes');
  console.error(err.message || err);
  process.exit(1);
});


