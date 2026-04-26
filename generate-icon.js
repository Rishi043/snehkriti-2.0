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

// Draw at 512px master, then scale down — keeps text sharp
function drawIcon(outputSize) {
  const MASTER = 512;
  const canvas = createCanvas(MASTER, MASTER);
  const ctx = canvas.getContext('2d');

  // ── Solid cream background ──
  ctx.fillStyle = '#f8edeb';
  ctx.fillRect(0, 0, MASTER, MASTER);

  // ── Decorative border ──
  ctx.strokeStyle = 'rgba(212,163,115,0.4)';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, MASTER - 40, MASTER - 40);

  // ── Inner glow ──
  const glow = ctx.createRadialGradient(256, 230, 0, 256, 256, 280);
  glow.addColorStop(0, 'rgba(253,246,240,0.8)');
  glow.addColorStop(1, 'rgba(248,237,235,0.0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, MASTER, MASTER);

  // ── "स्नेह" — Hindi bold brown, large ──
  ctx.fillStyle = '#a17852';
  ctx.font = 'bold 148px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u0938\u094D\u0928\u0947\u0939', 256, 155);

  // ── "Kriti" — italic gold ──
  ctx.fillStyle = '#d4a373';
  ctx.font = 'italic bold 118px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Kriti', 256, 295);

  // ── Divider ──
  ctx.strokeStyle = 'rgba(212,163,115,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(432, 360);
  ctx.stroke();

  // ── "CUSTOMISED" line 1 ──
  ctx.fillStyle = '#a17852';
  ctx.font = 'bold 46px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CUSTOMISED', 256, 400);

  // ── "CLOTHES" line 2 ──
  ctx.font = 'bold 46px Arial';
  ctx.fillText('CLOTHES', 256, 455);

  // Scale down to output size
  const out = createCanvas(outputSize, outputSize);
  const octx = out.getContext('2d');
  octx.drawImage(canvas, 0, 0, outputSize, outputSize);
  return out.toBuffer('image/png');
}

const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

sizes.forEach(({ dir, size }) => {
  const outDir = path.join(resDir, dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const buf = drawIcon(size);
  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), buf);
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), buf);
  fs.writeFileSync(path.join(outDir, 'ic_launcher_foreground.png'), buf);
  console.log(`✅ ${dir} (${size}x${size})`);
});

console.log('\n🎉 All icons generated!');
