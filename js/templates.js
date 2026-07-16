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
// ШАБЛОН 4: Code (Terminal-style)
// ═══════════════════════════════════════════════════════════
function drawCode(ctx, data) {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, CANVAS_W, 40);
    
    const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dotColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(30 + i * 24, 20, 8, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = '#7ee787';
    ctx.font = 'bold 52px "SF Mono", "Fira Code", monospace';
    ctx.fillText('// ' + (data.title || 'Title'), 60, 160);
    
    ctx.fillStyle = '#79c0ff';
    ctx.font = '32px "SF Mono", "Fira Code", monospace';
    wrapText(ctx, 'const desc = "' + (data.description || '') + '"', 60, 260, 1080, 44);
    
    ctx.fillStyle = '#a371f7';
    ctx.font = '24px "SF Mono", "Fira Code", monospace';
    ctx.fillText('by ' + (data.author || ''), 60, 560);
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
// ШАБЛОН 7: Photo (Background photo + text overlay)
// ═══════════════════════════════════════════════════════════
function drawPhoto(ctx, data) {
    if (data.bgImage) {
        ctx.drawImage(data.bgImage, 0, 0, CANVAS_W, CANVAS_H);
    } else {
        ctx.fillStyle = data.bgColor || '#171717';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 80, 240, 1040, 78);
    
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '30px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 400, 1040, 42);
    
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
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
    
    // Title centered — single line, ellipsis if too long
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.textAlign = 'center';
    const titleText = (data.title || 'Brand Name');
    const maxTitleWidth = CANVAS_W - 600;
    let displayTitle = titleText;
    if (ctx.measureText(titleText).width > maxTitleWidth) {
        // Truncate with ellipsis
        let truncated = titleText;
        while (ctx.measureText(truncated + '...').width > maxTitleWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        displayTitle = truncated + '...';
    }
    ctx.fillText(displayTitle, CANVAS_W / 2, 390);
    
    // Description (tagline) — single line
    ctx.fillStyle = '#525252';
    ctx.font = '22px Inter, sans-serif';
    const descText = (data.description || '');
    const maxDescWidth = CANVAS_W - 600;
    let displayDesc = descText;
    if (ctx.measureText(descText).width > maxDescWidth) {
        let truncated = descText;
        while (ctx.measureText(truncated + '...').width > maxDescWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        displayDesc = truncated + '...';
    }
    ctx.fillText(displayDesc, CANVAS_W / 2, 440);
    
    // Author — single line
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '16px Inter, sans-serif';
    const authorText = (data.author || '');
    const maxAuthorWidth = CANVAS_W - 600;
    let displayAuthor = authorText;
    if (ctx.measureText(authorText).width > maxAuthorWidth) {
        let truncated = authorText;
        while (ctx.measureText(truncated + '...').width > maxAuthorWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        displayAuthor = truncated + '...';
    }
    ctx.fillText(displayAuthor, CANVAS_W / 2, 480);
    
    ctx.textAlign = 'left';
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 9: Event (Date, time, location)
// ═══════════════════════════════════════════════════════════
function drawEvent(ctx, data) {
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    ctx.fillStyle = 'rgba(99,102,241,0.2)';
    ctx.beginPath(); ctx.arc(1000, 100, 200, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(200, 500, 150, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('UPCOMING EVENT', 80, 90);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Inter, sans-serif';
    wrapText(ctx, data.title || 'Event Name', 80, 160, 1040, 74);
    
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || 'Date & Location', 80, 340, 1040, 44);
    
    ctx.fillStyle = '#818cf8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// ═══════════════════════════════════════════════════════════
// ШАБЛОН 10: Quote (Large quote + author)
// ═══════════════════════════════════════════════════════════
function drawQuote(ctx, data) {
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    ctx.fillStyle = '#e5e5e5';
    ctx.font = 'bold 200px Georgia, serif';
    ctx.fillText('"', 60, 220);
    
    ctx.fillStyle = '#171717';
    ctx.font = 'italic 52px Georgia, serif';
    wrapText(ctx, data.title || 'Quote text here', 80, 280, 1040, 68);
    
    ctx.fillStyle = '#525252';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText('— ' + (data.author || 'Author'), 80, 520);
    
    ctx.fillStyle = '#171717';
    ctx.fillRect(80, 560, 60, 4);
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
