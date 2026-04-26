const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;

  // ── SOLID background fill (no transparency) ──
  ctx.fillStyle = '#f8edeb';
  ctx.fillRect(0, 0, s, s);

  // ── Warm center glow ──
  const glow = ctx.createRadialGradient(s*0.5, s*0.5, 0, s*0.5, s*0.5, s*0.5);
  glow.addColorStop(0,   'rgba(253,246,240,0.9)');
  glow.addColorStop(0.5, 'rgba(248,237,235,0.5)');
  glow.addColorStop(1,   'rgba(240,224,214,0.0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, s, s);

  // ── Decorative border ring ──
  ctx.strokeStyle = 'rgba(212,163,115,0.35)';
  ctx.lineWidth = Math.max(s * 0.02, 1);
  ctx.strokeRect(s*0.06, s*0.06, s*0.88, s*0.88);

  // ── "स्नेह" — Hindi bold brown ──
  const hindiSize = Math.round(s * 0.28);
  ctx.fillStyle = '#a17852';
  ctx.font = `bold ${hindiSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u0938\u094D\u0928\u0947\u0939', s * 0.5, s * 0.35);

  // ── "Kriti" — italic gold ──
  const kritiSize = Math.round(s * 0.22);
  ctx.fillStyle = '#d4a373';
  ctx.font = `italic bold ${kritiSize}px Georgia`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Kriti', s * 0.5, s * 0.60);

  // ── Divider line ──
  ctx.strokeStyle = 'rgba(212,163,115,0.5)';
  ctx.lineWidth = Math.max(s * 0.008, 1);
  ctx.beginPath();
  ctx.moveTo(s * 0.2, s * 0.74);
  ctx.lineTo(s * 0.8, s * 0.74);
  ctx.stroke();

  // ── "CUSTOMISED CLOTHES" ──
  const subSize = Math.max(Math.round(s * 0.07), 7);
  ctx.fillStyle = '#a17852';
  ctx.font = `${subSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CUSTOMISED CLOTHES', s * 0.5, s * 0.86);

  return canvas.toBuffer('image/png');
}

const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

sizes.forEach(({ dir, size }) => {
  const outDir = path.join(resDir, dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const buf = drawIcon(size);
  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), buf);
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), buf);
  console.log(`✅ ${dir} (${size}x${size})`);
});

console.log('\n🎉 All icons generated!');
