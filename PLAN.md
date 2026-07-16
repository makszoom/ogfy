# 🎨 OG Generator — Детальный план реализации
## С критическими моментами, проверками и fallback-кодом

---

## 📋 Параметры проекта

| Параметр | Выбор | Почему |
|----------|-------|--------|
| **Рендер** | Canvas API | $0, GitHub Pages, шрифты через FontFace API |
| **Монетизация** | 5 free → $5 lifetime → $8 Pro | Anti-Freemium по Зуеву |
| **Шаблоны** | 10 шаблонов | 10 SEO landing pages = 10 шансов в Google |
| **Запуск** | MVP → github.io → домен | По Зуеву: не платить за хостинг до первых продаж |

---

## 🗓️ Этап 1: MVP — Core (2 дня)

### Шаг 1.1. Структура проекта
```
C:\Users\MiniPC\Projects\ogfy\
├── index.html              (главная — генератор)
├── css/
│   └── style.css           (Vercel-style)
├── js/
│   ├── app.js              (UI логика, инпуты, счётчик)
│   ├── renderer.js         (Canvas API рендер)
│   └── templates.js        (10 функций-шаблонов)
├── assets/
│   └── fonts/
│       └── Geist-Regular.woff2   (для canvas)
└── templates/
    └── seo-landing.html    (шаблон для генерации 10 страниц)
```

### Шаг 1.2. HTML-структура главной

**Header:** логотип OGfy, ссылки на типы
**Hero:** H1 «Generate OG Images in 1 Click»
**Input секция:**
- Title (input, placeholder: «My awesome blog post»)
- Description (input, placeholder: «Short description»)
- Author / Brand (input)
- Template selector (radio buttons или select — 5 для MVP)
- Background color picker (input type="color")
- Background image upload (input type="file")
- Icon / Logo (emoji input или file upload)
**Preview секция:**
- Canvas 600×315 (preview, scaled 0.5 от 1200×630)
- Скачивание: оригинал 1200×630
**Actions:** Generate button, Download PNG button
**Paywall:** скрыт до исчерпания лимита

---

## ⚠️ КРИТИЧЕСКИЕ МОМЕНТЫ (глубокий разбор)

### РИСК 1: Шрифты в Canvas (🔴 Критично)

**Почему проблема:**
Canvas рисует текст ДО загрузки шрифта → Arial fallback → весь дизайн в мусор.

**Проверка — как убедиться что проблема есть:**
```javascript
// В консоли браузера:
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = 'bold 48px Geist';
ctx.fillText('Test', 10, 50);
// Если текст выглядит как Arial/системный — шрифт не загружен
```

**Решение — 3 уровня защиты:**

**Уровень 1: FontFace API (основной)**
```javascript
async function loadFonts() {
    const font = new FontFace('Geist', 'url(assets/fonts/Geist-Regular.woff2)');
    await font.load();
    document.fonts.add(font);
    
    // Ждём загрузки ВСЕХ шрифтов перед рендером
    await document.fonts.ready;
    
    return true;
}
```

**Уровень 2: FontFaceSet.ready (двойная проверка)**
```javascript
async function renderWithFonts(templateId, data) {
    // Ждём загрузки
    await document.fonts.ready;
    
    // Ещё раз проверяем
    const geistLoaded = document.fonts.check('bold 48px Geist');
    if (!geistLoaded) {
        console.warn('Geist not loaded, waiting...');
        await new Promise(r => setTimeout(r, 500));
    }
    
    // Теперь рендерим
    return renderTemplate(templateId, data);
}
```

**Уровень 3: Fallback на системный шрифт (Inter/SF Pro)**
```javascript
function getFont(family, size, weight = 'normal') {
    const loaded = document.fonts.check(`${weight} ${size}px ${family}`);
    const fallbackFamily = loaded ? family : 'system-ui, -apple-system, sans-serif';
    return `${weight} ${size}px ${fallbackFamily}`;
}

// В шаблоне:
ctx.font = getFont('Geist', 48, 'bold');
```

**Что делать если не работает:**
- Проверить что `assets/fonts/Geist-Regular.woff2` доступен (нет 404)
- Проверить CORS для шрифта (GitHub Pages — CORS ок)
- Использовать base64-inline шрифт (data URI) — 100% работает
- Fallback на Google Fonts CDN (если woff2 не грузится)

---

### РИСК 2: Emoji в Canvas (🟡 Средне)

**Почему проблема:**
Windows не имеет цветных emoji шрифтов по умолчанию → □ (tofu).

**Проверка:**
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = '48px serif';
ctx.fillText('😀', 10, 50);
// Если видишь □ — emoji не работают
```

**Решение — 2 уровня:**

**Уровень 1: Noto Color Emoji (загрузить шрифт)**
```javascript
const emojiFont = new FontFace('NotoColorEmoji', 
    'url(https://fonts.gstatic.com/s/notocoloremoji/v1/Yq6P-KqIXTD0t4ID9U...woff2)');
await emojiFont.load();
document.fonts.add(emojiFont);
```

**Уровень 2: Fallback — цветной круг с буквой**
```javascript
function drawIcon(ctx, icon, x, y, size) {
    // Пробуем emoji
    ctx.font = `${size}px NotoColorEmoji, serif`;
    const metrics = ctx.measureText(icon);
    const width = metrics.width;
    
    if (width > size * 0.5) {
        // Emoji отрисовался нормально
        ctx.fillText(icon, x, y);
    } else {
        // Fallback: цветной круг + первая буква
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${size * 0.5}px Geist, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(icon.charAt(0).toUpperCase(), x + size/2, y + size * 0.7);
        ctx.textAlign = 'left';
    }
}
```

**Что делать если не работает:**
- Убрать emoji picker, оставить только file upload для иконки
- Или использовать SVG-иконки (встроенные в JS)

---

### РИСК 3: Перенос текста на Canvas (🔴 Критично)

**Почему проблема:**
Canvas `fillText` не переносит текст автоматически. Длинный title вылезет за края.

**Проверка:**
```javascript
const title = 'This is a very long blog post title that should be wrapped properly';
const maxWidth = 1080; // 1200 - 60px padding each side
const metrics = ctx.measureText(title);
if (metrics.width > maxWidth) {
    // Текст не влезает — нужен перенос
}
```

**Решение — функция переноса текста:**
```javascript
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
    return currentY; // Возвращаем последнюю Y
}

// Использование:
const lastY = wrapText(ctx, title, 60, 150, 1080, 60);
// description ниже:
wrapText(ctx, description, 60, lastY + 40, 1080, 40);
```

**Что делать если не работает:**
- Ограничить длину input (maxlength="80" для title)
- Показывать превью в реальном времени — пользователь видит что текст не влезает
- Уменьшить font-size динамически если текст длинный

---

### РИСК 4: Размер PNG для скачивания (🟡 Средне)

**Почему проблема:**
`canvas.toDataURL('image/png')` даёт base64 ~2–3 МБ. Telegram/соцсети могут сжать или отказать.

**Проверка:**
```javascript
const dataUrl = canvas.toDataURL('image/png');
const sizeInMB = (dataUrl.length * 0.75) / 1024 / 1024;
console.log(`PNG size: ${sizeInMB.toFixed(2)} MB`);
// Если > 1.5 MB — может быть проблема
```

**Решение:**
```javascript
// 1. Сжимаем canvas ДО экспорта (уменьшаем цвета)
// Canvas API всё равно 24-bit, но можно уменьшить размер через качество

// 2. JPEG с качеством 0.92 (меньше размер, визуально не отличить)
function downloadImage(canvas, filename, format = 'png') {
    let dataUrl;
    if (format === 'jpeg') {
        // Белый фон для JPEG (иначе прозрачный → чёрный)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.fillStyle = 'white';
        tCtx.fillRect(0, 0, canvas.width, canvas.height);
        tCtx.drawImage(canvas, 0, 0);
        dataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
    } else {
        dataUrl = canvas.toDataURL('image/png');
    }
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}
```

**Что делать если не работает:**
- Предлагать JPEG вместо PNG (в 3–5 раз меньше)
- Уменьшить размер canvas до 800×420 (всё ещё OK для соцсетей)

---

### РИСК 5: Preview Canvas на мобильном (🟡 Средне)

**Почему проблема:**
1200×630 canvas на телефоне — тормозит, не влезает на экран.

**Решение:**
```javascript
// Показываем canvas в 600×315 (scale 0.5)
// CSS отвечает за отображение, реальный canvas 1200×630

// HTML:
// <canvas id="preview" width="600" height="315"></canvas>

// CSS:
// #preview { width: 100%; max-width: 600px; height: auto; }

// JS — рендерим на маленький canvas:
const previewCanvas = document.getElementById('preview');
const pCtx = previewCanvas.getContext('2d');
pCtx.scale(0.5, 0.5); // Всё рисуем в half-size
renderTemplate(pCtx, templateId, data); // Та же функция

// Для скачивания — отдельный полноразмерный canvas (не показываем)
const downloadCanvas = document.createElement('canvas');
downloadCanvas.width = 1200;
downloadCanvas.height = 630;
const dCtx = downloadCanvas.getContext('2d');
renderTemplate(dCtx, templateId, data);
// downloadCanvas.toDataURL() → файл
```

**Что делать если не работает:**
- На мобильном показывать только кнопку Generate, без live-preview
- Или использовать image вместо canvas для preview (`canvas.toDataURL()` → `<img>`)

---

### РИСК 6: Загрузка фона (Drag & Drop / File) (🟢 Низко)

**Почему проблема:**
`drawImage` с FileReader DataURL может дать tainted canvas (если cross-origin).

**Решение:**
```javascript
// FileReader даёт DataURL — это НЕ cross-origin, всё безопасно
const reader = new FileReader();
reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
        // Рисуем без CORS-проблем
        ctx.drawImage(img, 0, 0, 1200, 630);
    };
    img.src = e.target.result; // DataURL
};
reader.readAsDataURL(file);
```

**Что делать если не работает:**
- Проверить что файл < 5 MB (большие файлы — тормозят)
- Ограничить accept="image/jpeg,image/png,image/webp"
- Показать error message если формат не тот

---

### РИСК 7: Счётчик localStorage (обход) (🟡 Средне)

**Почему проблема:**
F12 → Application → Clear Storage → бесконечные free generations.

**По Зуеву — это нормально:**
> «Пока чек $5 — не заморачивайся с защитой. 95% пользователей не знают про F12.»

**Но если хочешь чуть лучше:**
```javascript
// Используем sessionStorage + localStorage
// sessionStorage — чистится при закрытии вкладки (хоть что-то)
// localStorage — остаётся

function useGeneration() {
    const used = parseInt(localStorage.getItem('og_generations') || '0');
    if (used >= 5) return false;
    
    localStorage.setItem('og_generations', (used + 1).toString());
    return true;
}
```

**Решение для продакшена (будущее):**
- IP-based limit через Cloudflare Workers (бесплатно, 100K/день)
- Но для MVP — localStorage достаточно

---

### РИСК 8: GitHub Pages Absolute Links (🔴 Критично — уже решено в PlainQR)

**Проблема:** `href="/"` → 404 на GitHub Pages (сайт в подпапке `/ogfy/`).

**Решение (известное из PlainQR):**
```html
<!-- ❌ НЕ ТАК -->
<a href="/">Home</a>
<a href="/blog.html">Blog</a>

<!-- ✅ ТАК -->
<a href="index.html">Home</a>
<a href="blog.html">Blog</a>
```

**Проверка после деплоя:**
```javascript
// В консоли на https://makszoom.github.io/ogfy/menu.html
const links = document.querySelectorAll('a[href^="/"]');
if (links.length > 0) {
    console.error('❌ Absolute links found:', links);
}
```

---

### РИСК 9: SEO Landing Pages — Генерация (🟡 Средне)

**Проблема:** 10 страниц вручную = ошибки, несогласованность.

**Решение — Python-скрипт (как PlainQR):**
```python
# scripts/generate-landing-pages.py
import os

TEMPLATE = open('templates/seo-landing.html').read()

PAGES = [
    {"id": "blog", "title": "Blog", "template": "news", "desc": "..."},
    {"id": "twitter", "title": "Twitter", "template": "minimal", "desc": "..."},
    # ... 10 штук
]

for page in PAGES:
    content = TEMPLATE.replace('[TITLE]', page['title'])
                      .replace('[DESC]', page['desc'])
                      .replace('[TEMPLATE]', page['template'])
    
    with open(f"og-image-for-{page['id']}.html", "w") as f:
        f.write(content)
    
    print(f"✅ Generated: og-image-for-{page['id']}.html")
```

**Проверка:**
- Все 10 страниц имеют уникальный `<title>`
- Все 10 страниц имеют уникальный `<meta name="description">`
- Все 10 страниц имеют Schema.org FAQPage
- Нет absolute links (`href="/"`)

---

### РИСК 10: NOWPayments без Backend (🟡 Средне)

**Проблема:** GitHub Pages = static, нет сервера для webhook.

**Решение — два варианта:**

**Вариант А: Ссылка на NOWPayments (простой)**
- Кнопка «Pay $5» → открывает NOWPayments checkout в новой вкладке
- После оплаты пользователь возвращается на страницу с параметром `?paid=1`
- JS проверяет URL → разблокирует счётчик

```javascript
// Проверка после возврата с NOWPayments
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('paid') === '1') {
    localStorage.setItem('og_paid', 'true');
    showUnlimited();
}
```

**Вариант Б: Cloudflare Worker (чуть сложнее, но надёжнее)**
- Worker принимает webhook от NOWPayments
- Проверяет оплату → выдаёт API key
- Frontend проверяет API key через fetch

**По Зуеву — берём Вариант А для MVP.**

---

## 📊 Таймлайн с учётом рисков

| День | Шаги | Что проверяем |
|------|------|---------------|
| **1** | HTML, CSS, 5 шаблонов, FontFace API | Шрифты загружаются? Canvas рендерит? |
| **2** | Счётчик, paywall, скачивание, перенос текста | 5 free работают? PNG скачивается? Текст не вылезает? |
| **3** | 10 шаблонов, SEO landing pages, Python генерация | Все шаблоны без багов? Все ссылки относительные? |
| **4** | Деплой, аудит, мобильная проверка | На телефоне работает? GitHub Pages обновился? |
| **5–6** | Домен, NOWPayments (Вариант А) | Оплата открывается? После оплаты разблокируется? |

---

## ✅ Чеклист перед деплоем (Каждый раз!)

- [ ] Шрифты загружены (проверить в Chrome DevTools → Network → Fonts)
- [ ] Emoji не tofu (проверить на Windows)
- [ ] Текст переносится (ввести длинный title → не вылезает)
- [ ] PNG < 1.5 MB (проверить размер base64)
- [ ] Preview работает на телефоне (Chrome DevTools → iPhone 12)
- [ ] 5 free → paywall (проверить 5 раз)
- [ ] Скачивание работает (проверить в Chrome, Firefox)
- [ ] Нет absolute links (`grep -r 'href="/'` или поиск в VS Code)
- [ ] Мобильная версия юзабельна (canvas не тормозит)
- [ ] GitHub Pages загрузился (подождать 2 минуты, проверить `?nocache=1`)

---

*План обновлён: 14 июля 2026*
*Критические моменты: 10 рисков с решениями и кодом*
