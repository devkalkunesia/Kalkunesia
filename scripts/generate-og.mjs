import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1200, H = 630;

// Create SVG with navy background, logo emoji, title and subtitle
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#1B3C53"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#grad)" opacity="0.4"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D9488" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1B3C53" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Decorative circles -->
  <circle cx="100" cy="530" r="180" fill="#0D9488" opacity="0.08"/>
  <circle cx="1100" cy="100" r="140" fill="#0D9488" opacity="0.06"/>
  <!-- Emoji placeholder box -->
  <rect x="525" y="140" width="150" height="150" rx="30" fill="#0D9488" opacity="0.15"/>
  <!-- Title -->
  <text x="600" y="370" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#FFFFFF" letter-spacing="-2">Kalkunesia</text>
  <!-- Subtitle -->
  <text x="600" y="425" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94A3B8">Platform Kalkulator Keuangan Indonesia</text>
  <!-- Bottom bar -->
  <rect x="480" y="480" width="240" height="4" rx="2" fill="#0D9488" opacity="0.6"/>
  <!-- URL -->
  <text x="600" y="530" text-anchor="middle" font-family="monospace" font-size="16" fill="#64748B">kalkunesia.com</text>
</svg>`;

const output = join(__dirname, '..', 'public', 'og-image.png');

await sharp(Buffer.from(svg))
  .png()
  .toFile(output);

console.log(`✅ OG image generated: ${output} (${W}x${H})`);
