// templates.js — 5 базовых шаблонов OG Image (1200×630)
// Каждая функция: drawTemplateName(ctx, data) → рисует на canvas

const CANVAS_W = 1200;
const CANVAS_H = 630;

// Утилита: перенос текста
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

// Утилита: проверка emoji (не tofu)
function isEmojiSupported(ctx, emoji, fontSize) {
    ctx.font = `${fontSize}px serif`;
    const metrics = ctx.measureText(emoji);
    return metrics.width > fontSize * 0.5;
}

// Утилита: fallback иконка (цветной круг + буква)
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

// Шаблон 1: Minimal (Vercel-style)
function drawMinimal(ctx, data) {
    // Background
    ctx.fillStyle = data.bgColor || '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Border
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, CANVAS_W - 80, CANVAS_H - 80);
    
    // Emoji / Icon
    if (data.emoji) {
        if (isEmojiSupported(ctx, data.emoji, 80)) {
            ctx.font = '80px serif';
            ctx.fillText(data.emoji, 80, 160);
        } else {
            drawFallbackIcon(ctx, data.emoji, 80, 100, 80, '#171717');
        }
    }
    
    // Title
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 56px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 80, 260, 1040, 70);
    
    // Description
    ctx.fillStyle = '#525252';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 420, 1040, 44);
    
    // Author
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// Шаблон 2: Gradient
function drawGradient(ctx, data) {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Overlay pattern (subtle dots)
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < CANVAS_W; x += 40) {
        for (let y = 0; y < CANVAS_H; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 80, 220, 1040, 78);
    
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 400, 1040, 44);
    
    // Author
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// Шаблон 3: Dark
function drawDark(ctx, data) {
    // Background
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Accent line
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(60, 100, 80, 6);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 60, 180, 1080, 78);
    
    // Description
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || '', 60, 360, 1080, 44);
    
    // Author
    ctx.fillStyle = '#525252';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 60, 560);
}

// Шаблон 4: Code (Terminal-style)
function drawCode(ctx, data) {
    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Terminal header
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, CANVAS_W, 40);
    
    // Dots
    const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dotColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(30 + i * 24, 20, 8, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Title as "code"
    ctx.fillStyle = '#7ee787'; // green
    ctx.font = 'bold 52px "SF Mono", "Fira Code", monospace';
    ctx.fillText('// ' + (data.title || 'Title'), 60, 160);
    
    // Description
    ctx.fillStyle = '#79c0ff'; // blue
    ctx.font = '32px "SF Mono", "Fira Code", monospace';
    wrapText(ctx, 'const desc = "' + (data.description || '') + '"', 60, 260, 1080, 44);
    
    // Author
    ctx.fillStyle = '#a371f7'; // purple
    ctx.font = '24px "SF Mono", "Fira Code", monospace';
    ctx.fillText('by ' + (data.author || ''), 60, 560);
}

// Шаблон 5: News (Magazine-style)
function drawNews(ctx, data) {
    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Red accent bar
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 8, CANVAS_H);
    
    // Category label
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('FEATURED', 60, 80);
    
    // Title
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 60px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 60, 150, 1080, 74);
    
    // Description
    ctx.fillStyle = '#525252';
    ctx.font = '28px Inter, sans-serif';
    wrapText(ctx, data.description || '', 60, 380, 1080, 40);
    
    // Author + date
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '20px Inter, sans-serif';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(`${data.author || ''} · ${date}`, 60, 560);
}

// Шаблон 6: Product (SaaS / Feature announcement)
function drawProduct(ctx, data) {
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    
    // "Product" badge
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('NEW FEATURE', 80, 90);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 68px Inter, sans-serif';
    wrapText(ctx, data.title || 'Feature Name', 80, 160, 1040, 82);
    
    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '30px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 340, 1040, 42);
    
    // Author
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// Шаблон 7: Photo (Background photo + text overlay)
function drawPhoto(ctx, data) {
    // Background image or color
    if (data.bgImage) {
        ctx.drawImage(data.bgImage, 0, 0, CANVAS_W, CANVAS_H);
    } else {
        ctx.fillStyle = data.bgColor || '#171717';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    // Dark overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    wrapText(ctx, data.title || 'Title', 80, 240, 1040, 78);
    
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '30px Inter, sans-serif';
    wrapText(ctx, data.description || '', 80, 400, 1040, 42);
    
    // Author
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// Шаблон 8: Brand (Logo center + tagline)
function drawBrand(ctx, data) {
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Circle accent
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, 220, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    
    // Emoji or initial
    if (data.emoji) {
        if (isEmojiSupported(ctx, data.emoji, 80)) {
            ctx.font = '80px serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.emoji, CANVAS_W / 2, 245);
            ctx.textAlign = 'left';
        } else {
            drawFallbackIcon(ctx, data.emoji, CANVAS_W/2 - 40, 180, 80, '#171717');
        }
    }
    
    // Title (centered)
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 56px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.title || 'Brand Name', CANVAS_W / 2, 380);
    
    // Description (tagline)
    ctx.fillStyle = '#525252';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText(data.description || '', CANVAS_W / 2, 440);
    
    // Author
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(data.author || '', CANVAS_W / 2, 520);
    
    ctx.textAlign = 'left';
}

// Шаблон 9: Event (Date, time, location)
function drawEvent(ctx, data) {
    // Background
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Decorative circles
    ctx.fillStyle = 'rgba(99,102,241,0.2)';
    ctx.beginPath(); ctx.arc(1000, 100, 200, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(200, 500, 150, 0, Math.PI*2); ctx.fill();
    
    // "Event" badge
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('UPCOMING EVENT', 80, 90);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Inter, sans-serif';
    wrapText(ctx, data.title || 'Event Name', 80, 160, 1040, 74);
    
    // Date / Description
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '32px Inter, sans-serif';
    wrapText(ctx, data.description || 'Date & Location', 80, 340, 1040, 44);
    
    // Author / organizer
    ctx.fillStyle = '#818cf8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(data.author || '', 80, 560);
}

// Шаблон 10: Quote (Large quote + author)
function drawQuote(ctx, data) {
    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Quote marks
    ctx.fillStyle = '#e5e5e5';
    ctx.font = 'bold 200px Georgia, serif';
    ctx.fillText('"', 60, 220);
    
    // Title (quote text)
    ctx.fillStyle = '#171717';
    ctx.font = 'italic 52px Georgia, serif';
    wrapText(ctx, data.title || 'Quote text here', 80, 280, 1040, 68);
    
    // Author
    ctx.fillStyle = '#525252';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText('— ' + (data.author || 'Author'), 80, 520);
    
    // Accent line
    ctx.fillStyle = '#171717';
    ctx.fillRect(80, 560, 60, 4);
}

// Экспорт шаблонов
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
