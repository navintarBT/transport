import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SOURCE = 'src/assets/brand-logo.jpg'

mkdirSync('public/icons', { recursive: true })

const targets = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/favicon.png', size: 48 },
]

for (const t of targets) {
  await sharp(SOURCE).resize(t.size, t.size).png().toFile(t.file)
  console.log('wrote', t.file)
}

// Maskable icon: Android may crop to a circle, so pad the badge inward
// to keep it inside the safe zone (centered 80% of the canvas).
const maskableSize = 512
const inner = Math.round(maskableSize * 0.8)
await sharp(SOURCE)
  .resize(inner, inner)
  .extend({
    top: Math.floor((maskableSize - inner) / 2),
    bottom: Math.ceil((maskableSize - inner) / 2),
    left: Math.floor((maskableSize - inner) / 2),
    right: Math.ceil((maskableSize - inner) / 2),
    background: '#000000',
  })
  .png()
  .toFile('public/icons/maskable-512.png')
console.log('wrote public/icons/maskable-512.png')
