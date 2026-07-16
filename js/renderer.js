// renderer.js — Canvas API рендер 1200×630

const OUTPUT_W = 1200;
const OUTPUT_H = 630;
const PREVIEW_W = 600;
const PREVIEW_H = 315;

// Загрузка шрифтов (критично!)
async function loadFonts() {
    try {
        // Inter уже загружен через Google Fonts, но проверим
        await document.fonts.ready;
        
        // Проверка что шрифт загружен
        const interLoaded = document.fonts.check('bold 48px Inter');
        if (!interLoaded) {
            console.warn('Inter font not loaded, waiting...');
            await new Promise(r => setTimeout(r, 500));
        }
        
        return true;
    } catch (e) {
        console.error('Font loading error:', e);
        return false;
    }
}

// Рендер шаблона на canvas
async function renderTemplate(canvas, templateId, data) {
    await loadFonts();
    
    const ctx = canvas.getContext('2d');
    
    // Очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Определяем логический размер
    const isPreview = canvas.width === PREVIEW_W && canvas.height === PREVIEW_H;
    
    // Для preview масштабируем в 0.5 (шаблоны рисуют для 1200×630)
    if (isPreview) {
        ctx.scale(0.5, 0.5);
    }
    
    // Получаем функцию шаблона
    const templateFn = window.TEMPLATES?.[templateId] || window.TEMPLATES?.minimal;
    
    if (!templateFn) {
        console.error('Template not found:', templateId);
        return;
    }
    
    // Рисуем
    templateFn(ctx, data);
    
    // Watermark (если не Pro) — в логических координатах 1200×630
    if (!isPro()) {
        drawWatermark(ctx, OUTPUT_W, OUTPUT_H);
    }
}

// Watermark
function drawWatermark(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.font = 'bold 120px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 12);
    ctx.fillText('OGfy', 0, 0);
    ctx.restore();
}

// Проверка Pro-версии
function isPro() {
    return localStorage.getItem('ogfy_paid') === 'true';
}

// Создание полноразмерного canvas для скачивания
async function renderForDownload(templateId, data) {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    
    await renderTemplate(canvas, templateId, data);
    
    return canvas;
}

// Скачивание PNG
function downloadCanvas(canvas, filename) {
    // Добавляем padding 32px белый (как PlainQR)
    const padding = 32;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width + padding * 2;
    finalCanvas.height = canvas.height + padding * 2;
    
    const fCtx = finalCanvas.getContext('2d');
    fCtx.fillStyle = '#ffffff';
    fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    fCtx.drawImage(canvas, padding, padding);
    
    // Экспорт
    const dataUrl = finalCanvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = filename || 'og-image.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Background image loader
function loadBackgroundImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
