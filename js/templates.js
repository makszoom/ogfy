// templates.js — 10 шаблонов OG Image (1200×630)
// Каждая функция: drawTemplateName(ctx, data) → рисует на canvas

const CANVAS_W = 1200;
const CANVAS_H = 630;

// ═══════════════════════════════════════════════════════════
// УТИЛИТЫ
// ═══════════════════════════════════════════════════════════

// Перенос текста
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
}

// Проверка emoji (не tofu)
function isEmojiSupported(ctx, emoji, fontSize) {
    ctx.font = `${fontSize}px "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", serif`;
    const metrics = ctx.measureText(emoji);
    return metrics.width > fontSize * 0.5;
}

// Fallback иконка (цветной круг + буква)
function drawFallbackIcon(ctx, text, x, y, size, color = '#6366f1') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.45}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.charAt(0).toUpperCase(), x + size/2, y + size/2);
    ctx.restore();
}

// Glassmorphism card
function drawGlassCard(ctx, x, y, w, h, r) {
    ctx.save();
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    // Fill
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    // Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
}

// Rounded rect path
function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Glow orb (светящийся шар)
function drawGlowOrb(ctx, x, y, r, color, blur) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Glow text (текст с подсветкой)
function drawGlowText(ctx, text, x, y, font, color, glowColor, glowBlur) {
    ctx.save();
    ctx.font = font;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Noise overlay (текстурный шум)
function drawNoiseOverlay(ctx, w, h, opacity) {
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 1: Minimal → Glass (Glassmorphism)
// ═══════════════════════════════════════════════════════════
function drawMinimal(ctx, data) {
    // Richer gradient background — darker for contrast
    const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bgGrad.addColorStop(0, '#cbd5e1');
    bgGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Brighter blur orbs
    drawGlowOrb(ctx, 180, 160, 100, 'rgba(99,102,241,0.25)', 60);
    drawGlowOrb(ctx, 1020, 460, 120, 'rgba(236,72,153,0.20)', 60);
    
    // Glass card with blue tint
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = 'rgba(248,250,252,0.92)';
    roundRectPath(ctx, 80, 80, CANVAS_W - 160, CANVAS_H - 160, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(99,102,241,0.25)';
    ctx.lineWidth = 2;
    roundRectPath(ctx, 80, 80, CANVAS_W - 160, CANVAS_H - 160, 16);
    ctx.stroke();
    ctx.restore();
    
    // Content inside card
    const padX = 140;
    const padY = 130;
    
    // Emoji
    if (data.emoji) {
        if (isEmojiSupported(ctx, data.emoji, 64)) {
            ctx.font = '64px "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", serif';
            ctx.fillText(data.emoji, padX, padY + 50);
        } else {
            drawFallbackIcon(ctx, data.emoji, padX, padY, 64, '#171717');
        }
    }
    
    // Title
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 52px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', padX, padY + 120, CANVAS_W - 280, 64);
    
    // Description
    ctx.fillStyle = '#525252';
    ctx.font = '28px Inter, sans-serif';
    wrapText(ctx, data.description || '', padX, padY + 220, CANVAS_W - 280, 40);
    
    // Author
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(data.author || '', padX, CANVAS_H - 130);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 2: Gradient → Mesh (Overlapping radial gradients)
// ═══════════════════════════════════════════════════════════
function drawGradient(ctx, data) {
    // Base dark
    ctx.fillStyle = '#0f0a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Mesh: 3 overlapping radial gradients
    const g1 = ctx.createRadialGradient(300, 200, 0, 300, 200, 600);
    g1.addColorStop(0, 'rgba(99,102,241,0.6)');
    g1.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    const g2 = ctx.createRadialGradient(900, 400, 0, 900, 400, 500);
    g2.addColorStop(0, 'rgba(236,72,153,0.5)');
    g2.addColorStop(1, 'rgba(236,72,153,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    const g3 = ctx.createRadialGradient(600, 550, 0, 600, 550, 400);
    g3.addColorStop(0, 'rgba(139,92,246,0.4)');
    g3.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Floating orbs
    drawGlowOrb(ctx, 180, 150, 40, 'rgba(99,102,241,0.3)', 60);
    drawGlowOrb(ctx, 1020, 480, 50, 'rgba(236,72,153,0.25)', 60);
    
    // Title with glow for readability
    drawGlowText(ctx, data.title || 'Title', 80, 240, 'bold 64px Inter, sans-serif', '#ffffff', 'rgba(0,0,0,0.3)', 20);
    
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 340, 1040, 44);
    
    // Author
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 3: Dark → Neon (Neon glow + noise)
// ═══════════════════════════════════════════════════════════
function drawDark(ctx, data) {
    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Noise overlay
    drawNoiseOverlay(ctx, CANVAS_W, CANVAS_H, 0.04);
    
    // Neon accent line
    ctx.save();
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(60, 120, 100, 4);
    ctx.restore();
    
    // Title with neon glow
    drawGlowText(ctx, data.title || 'Title', 60, 220, 'bold 64px Inter, sans-serif', '#ffffff', 'rgba(99,102,241,0.4)', 30);
    
    // Description
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || '', 60, 360, 1080, 44);
    
    // Author
    ctx.fillStyle = '#525252';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 60, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 4: Code → Matrix Rain (Terminal + falling characters)
// ═══════════════════════════════════════════════════════════
function drawCode(ctx, data) {
    // Dark matrix background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Matrix rain effect (static — random green chars)
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.font = '14px monospace';
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * CANVAS_W;
        const y = Math.random() * 300;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, x, y);
    }
    
    // Fading rain columns (vertical lines of varying opacity)
    for (let col = 0; col < 15; col++) {
        const x = 40 + col * 75;
        const len = 5 + Math.floor(Math.random() * 12);
        for (let row = 0; row < len; row++) {
            const alpha = 0.5 - (row / len) * 0.4;
            ctx.fillStyle = `rgba(34,197,94,${alpha})`;
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, x, 30 + row * 18);
        }
    }
    
    // Terminal header bar
    ctx.fillStyle = 'rgba(22,27,34,0.9)';
    ctx.fillRect(60, 320, CANVAS_W - 120, 260);
    
    // Terminal top bar
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(60, 320, CANVAS_W - 120, 32);
    
    // Dots
    const dotColors = ['#ef4444', '#f59e0b', '#22c55e'];
    dotColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(80 + i * 20, 336, 6, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Title as code
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 40px "SF Mono", "Fira Code", monospace';
    ctx.fillText('$ ' + (data.title || 'build.sh'), 80, 400);
    
    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px "SF Mono", "Fira Code", monospace';
    wrapText(ctx, '> ' + (data.description || 'Running deployment...'), 80, 450, CANVAS_W - 200, 36);
    
    // Author
    ctx.fillStyle = '#64748b';
    ctx.font = '18px "SF Mono", "Fira Code", monospace';
    ctx.fillText('# ' + (data.author || 'dev@ogfy.io'), 80, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 5: News → Magazine Split (Two-column editorial)
// ═══════════════════════════════════════════════════════════
function drawNews(ctx, data) {
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Left accent panel (40% width) — softer coral gradient
    const panelW = CANVAS_W * 0.4;
    const panelGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    panelGrad.addColorStop(0, '#fb7185');
    panelGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, 0, panelW, CANVAS_H);
    
    // "NEWS" label on panel
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('NEWS', 50, 50);
    
    // Emoji or initial centered on panel
    const emojiX = panelW / 2;
    const emojiY = CANVAS_H / 2 - 40;
    if (data.emoji) {
        if (isEmojiSupported(ctx, data.emoji, 120)) {
            ctx.font = '120px "Noto Color Emoji", serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.emoji, emojiX, emojiY);
            ctx.textAlign = 'left';
        } else {
            drawFallbackIcon(ctx, data.emoji, emojiX - 60, emojiY - 60, 120, 'rgba(255,255,255,0.3)');
        }
    }
    
    // Right content area (60% width)
    const contentX = panelW + 60;
    const contentW = CANVAS_W - panelW - 100;
    
    // Title
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 52px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', contentX, 160, contentW, 64);
    
    // Description
    ctx.fillStyle = '#525252';
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, data.description || '', contentX, 300, contentW, 38);
    
    // Author + date
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '18px Inter, sans-serif';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(`${data.author || ''} · ${date}`, contentX, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 6: Product → 3D Floating Card (Stripe-style)
// ═══════════════════════════════════════════════════════════
function drawProduct(ctx, data) {
    // Dark gradient background
    const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Subtle grid
    ctx.strokeStyle = 'rgba(99,102,241,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    
    // Floating glass card
    ctx.save();
    ctx.shadowColor = 'rgba(99,102,241,0.2)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = 'rgba(30,41,59,0.8)';
    roundRectPath(ctx, 100, 80, CANVAS_W - 200, CANVAS_H - 160, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(99,102,241,0.3)';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 100, 80, CANVAS_W - 200, CANVAS_H - 160, 20);
    ctx.stroke();
    ctx.restore();
    
    // Content inside card
    const cx = 160;
    const cy = 140;
    
    // Glowing "NEW" badge
    ctx.save();
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#6366f1';
    roundRectPath(ctx, cx, cy, 100, 32, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.restore();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('NEW', cx + 35, cy + 22);
    
    // Title
    drawGlowText(ctx, data.title || 'Feature Name', cx, cy + 100, 'bold 56px Inter, sans-serif', '#ffffff', 'rgba(0,0,0,0.3)', 15);
    
    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '26px Inter, sans-serif';
    wrapText(ctx, data.description || '', cx, cy + 180, CANVAS_W - 320, 38);
    
    // Author
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(data.author || '', cx, CANVAS_H - 140);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 7: Photo → Cinematic (Letterbox + center photo)
// ═══════════════════════════════════════════════════════════
function drawPhoto(ctx, data) {
    // Background
    if (data.bgImage) {
        ctx.drawImage(data.bgImage, 0, 0, CANVAS_W, CANVAS_H);
    } else {
        ctx.fillStyle = data.bgColor || '#171717';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    // Cinematic letterbox bars (top & bottom)
    const barH = 90;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_W, barH);
    ctx.fillRect(0, CANVAS_H - barH, CANVAS_W, barH);
    
    // Dark overlay for text readability
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, barH, CANVAS_W, CANVAS_H - barH * 2);
    
    // Top bar text
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OGFY STUDIO', CANVAS_W / 2, 55);
    ctx.textAlign = 'left';
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 80, 220, 1040, 68);
    
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '28px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 360, 1040, 40);
    
    // Bottom bar text
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, CANVAS_H - 45);
    
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.fillText('1200 x 630', CANVAS_W - 80, CANVAS_H - 45);
    ctx.textAlign = 'left';
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 8: Brand → Circular Hero (Radial gradient + glass)
// ═══════════════════════════════════════════════════════════
function drawBrand(ctx, data) {
    // Soft radial gradient background
    const bgGrad = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, 100, CANVAS_W/2, CANVAS_H/2, 700);
    bgGrad.addColorStop(0, '#f0f9ff');
    bgGrad.addColorStop(0.5, '#e0f2fe');
    bgGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Central circle with gradient behind emoji
    const circleGrad = ctx.createRadialGradient(CANVAS_W/2, 230, 0, CANVAS_W/2, 230, 130);
    circleGrad.addColorStop(0, 'rgba(99,102,241,0.15)');
    circleGrad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, 230, 130, 0, Math.PI * 2);
    ctx.fill();
    
    // Emoji or initial centered
    if (data.emoji) {
        if (isEmojiSupported(ctx, data.emoji, 100)) {
            ctx.font = '100px "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.emoji, CANVAS_W / 2, 260);
            ctx.textAlign = 'left';
        } else {
            drawFallbackIcon(ctx, data.emoji, CANVAS_W/2 - 50, 210, 100, '#6366f1');
        }
    }
    
    // Glass card for text
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    roundRectPath(ctx, 260, 330, CANVAS_W - 520, 220, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, 260, 330, CANVAS_W - 520, 220, 16);
    ctx.stroke();
    ctx.restore();
    
    // Title centered — dynamic font sizing to fit one line
    ctx.fillStyle = '#171717';
    ctx.textAlign = 'center';
    const titleText = (data.title || 'Brand Name');
    const maxTextWidth = CANVAS_W - 560;
    let titleSize = 48;
    while (titleSize >= 28) {
        ctx.font = `bold ${titleSize}px Inter, sans-serif`;
        if (ctx.measureText(titleText).width <= maxTextWidth) break;
        titleSize -= 2;
    }
    ctx.fillText(titleText, CANVAS_W / 2, 390);
    
    // Description (tagline) — dynamic sizing
    ctx.fillStyle = '#525252';
    let descSize = 24;
    const descText = (data.description || '');
    while (descSize >= 16) {
        ctx.font = `${descSize}px Inter, sans-serif`;
        if (ctx.measureText(descText).width <= maxTextWidth) break;
        descSize -= 2;
    }
    ctx.fillText(descText, CANVAS_W / 2, 440);
    
    // Author — dynamic sizing
    ctx.fillStyle = '#a3a3a3';
    let authorSize = 18;
    const authorText = (data.author || '');
    while (authorSize >= 14) {
        ctx.font = `${authorSize}px Inter, sans-serif`;
        if (ctx.measureText(authorText).width <= maxTextWidth) break;
        authorSize -= 2;
    }
    ctx.fillText(authorText, CANVAS_W / 2, 480);
    
    ctx.textAlign = 'left';
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 9: Event → Countdown Poster (Mesh gradient + glow)
// ═══════════════════════════════════════════════════════════
function drawEvent(ctx, data) {
    // Dark mesh background
    const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(1, '#312e81');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Decorative orbs
    drawGlowOrb(ctx, 150, 120, 80, 'rgba(99,102,241,0.2)', 50);
    drawGlowOrb(ctx, 1050, 520, 100, 'rgba(236,72,153,0.15)', 50);
    drawGlowOrb(ctx, 600, 580, 60, 'rgba(251,191,36,0.12)', 40);
    
    // Glow badge "SAVE THE DATE"
    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fbbf24';
    roundRectPath(ctx, 80, 70, 160, 36, 18);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.restore();
    
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('SAVE THE DATE', 100, 94);
    
    // Title
    drawGlowText(ctx, data.title || 'Event Name', 80, 160, 'bold 60px Inter, sans-serif', '#ffffff', 'rgba(0,0,0,0.3)', 15);
    
    // Date / Description (cyan glow)
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || 'Date & Location', 80, 280, 1040, 44);
    
    // Large decorative date number
    ctx.fillStyle = 'rgba(99,102,241,0.08)';
    ctx.font = 'bold 200px Inter, sans-serif';
    const dateNum = new Date().getDate().toString().padStart(2, '0');
    ctx.fillText(dateNum, CANVAS_W - 280, 540);
    
    // Author
    ctx.fillStyle = '#818cf8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 10: Quote → Editorial (Large typography + accent)
// ═══════════════════════════════════════════════════════════
function drawQuote(ctx, data) {
    // Warm editorial background
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Large accent bar on left
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(60, 80, 8, CANVAS_H - 160);
    
    // Small accent square
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(60, 80, 40, 40);
    
    // Quote mark inside square
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('"', 72, 110);
    
    // Title (quote text) — large editorial style
    ctx.fillStyle = '#1c1917';
    ctx.font = 'italic 48px Georgia, serif';
    const quoteY = wrapText(ctx, data.title || 'Quote text here', 140, 200, CANVAS_W - 260, 64);
    
    // Author with em-dash
    ctx.fillStyle = '#78716c';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText('— ' + (data.author || 'Author'), 140, quoteY + 60);
    
    // Decorative bottom line
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(140, CANVAS_H - 100, 200, 2);
}

// ═══════════════════════════════════════════════════════════
// ЭКСПОРТ
// ═══════════════════════════════════════════════════════════
const TEMPLATES = {
    minimal: drawMinimal,
    gradient: drawGradient,
    dark: drawDark,
    code: drawCode,
    news: drawNews,
    product: drawProduct,
    photo: drawPhoto,
    brand: drawBrand,
    event: drawEvent,
    quote: drawQuote
};

window.TEMPLATES = TEMPLATES;
