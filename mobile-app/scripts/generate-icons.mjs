import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const CUBE_PATH =
  'M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z M12 3v9M12 12l8-4.2M12 12L4 7.8'

function iconSvg({ size, iconScale, cornerRadius = 0 }) {
  const iconSize = 24 * iconScale
  const offset = (size - iconSize) / 2
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#635BFF"/>
      <stop offset="1" stop-color="#4338CA"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${iconScale})" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${CUBE_PATH}"/>
  </g>
</svg>`
}

mkdirSync('public/icons', { recursive: true })

const targets = [
  { file: 'public/icons/icon-192.png', size: 192, iconScale: 192 * 0.58 / 24 },
  { file: 'public/icons/icon-512.png', size: 512, iconScale: 512 * 0.58 / 24 },
  { file: 'public/icons/maskable-512.png', size: 512, iconScale: 512 * 0.42 / 24 },
  { file: 'public/apple-touch-icon.png', size: 180, iconScale: (180 * 0.58 / 24), cornerRadius: 0 },
]

for (const t of targets) {
  const svg = iconSvg(t)
  await sharp(Buffer.from(svg)).png().toFile(t.file)
  console.log('wrote', t.file)
}
