// app.js — Главная логика OG Generator

(function() {
    // DOM элементы
    const els = {
        title: document.getElementById('title'),
        description: document.getElementById('description'),
        author: document.getElementById('author'),
        emoji: document.getElementById('emoji'),
        bgColor: document.getElementById('bgColor'),
        bgImage: document.getElementById('bgImage'),
        templateInputs: document.querySelectorAll('input[name="template"]'),
        generateBtn: document.getElementById('generate-btn'),
        downloadBtn: document.getElementById('download-btn'),
        previewCanvas: document.getElementById('preview-canvas'),
        previewHint: document.getElementById('preview-hint'),
        freeCount: document.getElementById('free-count'),
        paywall: document.getElementById('paywall'),
        generatorLayout: document.getElementById('generator-layout'),
        counter: document.getElementById('counter'),
        burgerBtn: document.getElementById('burger-btn'),
        mobileNav: document.getElementById('mobile-nav'),
        mobileNavClose: document.getElementById('mobile-nav-close')
    };
    
    // Состояние
    let usedGenerations = parseInt(localStorage.getItem('og_generations') || '0');
    let currentTemplate = 'minimal';
    let currentData = {};
    let bgImageData = null;
    
    // Инициализация счётчика
    function updateCounter() {
        els.freeCount.textContent = `${usedGenerations} / 5`;
        // НЕ вызываем showPaywall() здесь — только при клике Generate
    }
    
    // Показать пейволл
    function showPaywall() {
        els.generatorLayout.style.display = 'none';
        els.counter.style.display = 'none';
        els.paywall.style.display = 'block';
    }
    
    // Собрать данные из формы
    function collectData() {
        return {
            title: els.title.value.trim() || 'Untitled',
            description: els.description.value.trim(),
            author: els.author.value.trim(),
            emoji: els.emoji.value.trim(),
            bgColor: els.bgColor.value,
            bgImage: bgImageData
        };
    }
    
    // ═══════════════════════════════════════════════════════════
    // FEATURES MAP — какие поля работают в каком шаблоне
    // ═══════════════════════════════════════════════════════════
    const TEMPLATE_FEATURES = {
        minimal:  { emoji: true, bgColor: true, bgImage: false },
        gradient: { emoji: false, bgColor: false, bgImage: false },
        dark:     { emoji: false, bgColor: false, bgImage: false },
        code:     { emoji: false, bgColor: false, bgImage: false },
        news:     { emoji: true, bgColor: true, bgImage: false },
        product:  { emoji: false, bgColor: false, bgImage: false },
        photo:    { emoji: false, bgColor: true, bgImage: true },
        brand:    { emoji: true, bgColor: true, bgImage: false },
        event:    { emoji: false, bgColor: false, bgImage: false },
        quote:    { emoji: false, bgColor: true, bgImage: false }
    };
    
    const TEMPLATE_HINTS = {
        minimal:  '<strong>Minimal</strong>: Glass card style. Background Color works.',
        gradient: '<strong>Gradient</strong>: Mesh glow style. Fixed dark background.',
        dark:     '<strong>Dark</strong>: Neon glow style. Fixed black background.',
        code:     '<strong>Code</strong>: Matrix rain style. Fixed terminal background.',
        news:     '<strong>News</strong>: Magazine split. Background Color works.',
        product:  '<strong>Product</strong>: 3D floating card. Fixed blue background.',
        photo:    '<strong>Photo</strong>: Cinematic letterbox. Background Image works, Color is fallback.',
        brand:    '<strong>Brand</strong>: Circular hero. Background Color works.',
        event:    '<strong>Event</strong>: Countdown poster. Fixed purple background.',
        quote:    '<strong>Quote</strong>: Editorial style. Background Color works.'
    };
    
    // DOM элементы для field groups
    const templateHintEl = document.getElementById('template-hint');
    const fieldGroups = document.querySelectorAll('.field-group');
    
    // Обновить подсказку под селектором шаблонов
    function updateTemplateHint() {
        const template = getSelectedTemplate();
        if (templateHintEl && TEMPLATE_HINTS[template]) {
            templateHintEl.innerHTML = TEMPLATE_HINTS[template];
        }
    }
    
    // Обновить disabled состояние полей
    function updateFieldGroups() {
        const template = getSelectedTemplate();
        const features = TEMPLATE_FEATURES[template] || {};
        
        fieldGroups.forEach(group => {
            const field = group.dataset.field;
            if (!field) return;
            
            const works = features[field] || false;
            if (works) {
                group.classList.remove('disabled');
            } else {
                group.classList.add('disabled');
            }
        });
    }
    
    // Получить выбранный шаблон
    function getSelectedTemplate() {
        for (const input of els.templateInputs) {
            if (input.checked) return input.value;
        }
        return 'minimal';
    }
    
    // === МОБИЛЬНОЕ МЕНЮ ===
    function toggleMobileNav() {
        const isOpen = els.mobileNav.classList.contains('open');
        if (isOpen) {
            els.mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            els.mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeMobileNav() {
        els.mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    if (els.burgerBtn) {
        els.burgerBtn.addEventListener('click', toggleMobileNav);
    }
    if (els.mobileNavClose) {
        els.mobileNavClose.addEventListener('click', closeMobileNav);
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
    });
    
    // Закрытие по клику вне шторки
    if (els.mobileNav) {
        els.mobileNav.addEventListener('click', (e) => {
            if (e.target === els.mobileNav) closeMobileNav();
        });
    }
    
    // Закрытие при клике на ссылку в шторке
    els.mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
    
    // === РЕНДЕР (без траты лимита) ===
    async function renderPreview() {
        // Собираем данные
        currentData = collectData();
        currentTemplate = getSelectedTemplate();
        
        // Загружаем фон если есть
        if (els.bgImage.files[0]) {
            try {
                bgImageData = await loadBackgroundImage(els.bgImage.files[0]);
                currentData.bgImage = bgImageData;
            } catch (e) {
                console.warn('Background image failed:', e);
            }
        }
        
        // Рендер preview (600×315)
        await renderTemplate(els.previewCanvas, currentTemplate, currentData);
        
        // Скрыть hint
        els.previewHint.style.display = 'none';
        
        // Активировать download
        els.downloadBtn.disabled = false;
        
        // Анимация
        els.previewCanvas.style.opacity = '0';
        els.previewCanvas.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            els.previewCanvas.style.transition = 'opacity 0.3s, transform 0.3s';
            els.previewCanvas.style.opacity = '1';
            els.previewCanvas.style.transform = 'translateY(0)';
        });
    }
    
    // === ГЕНЕРАЦИЯ (с тратой лимита) ===
    async function generatePreview() {
        // Проверка лимита
        if (usedGenerations >= 5 && !isPro()) {
            showPaywall();
            return;
        }
        
        // Рендерим
        await renderPreview();
        
        // Увеличить счётчик ТОЛЬКО здесь
        usedGenerations++;
        localStorage.setItem('og_generations', usedGenerations.toString());
        updateCounter();
    }
    
    // Скачивание
    async function download() {
        if (!currentData.title) return;
        
        // Рендер полноразмерного
        const fullCanvas = await renderForDownload(currentTemplate, currentData);
        
        // Имя файла
        const safeTitle = currentData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const filename = `og-${safeTitle.substring(0, 30)}.png`;
        
        downloadCanvas(fullCanvas, filename);
    }
    
    // Проверка возврата с оплаты
    function checkPaymentReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('paid') === '1') {
            localStorage.setItem('ogfy_paid', 'true');
            localStorage.removeItem('og_generations');
            usedGenerations = 0;
            
            // Показать сообщение
            const notice = document.createElement('div');
            notice.className = 'payment-success';
            notice.innerHTML = `
                <div style="padding: 16px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; margin-bottom: 20px;">
                    <strong>🎉 Payment successful!</strong> You now have unlimited access.
                </div>
            `;
            document.querySelector('.container').insertBefore(notice, document.querySelector('.hero'));
            
            // Убрать пейволл если показан
            els.paywall.style.display = 'none';
            els.generatorLayout.style.display = 'grid';
            els.counter.style.display = 'block';
            updateCounter();
        }
    }
    
    // Event Listeners
    els.generateBtn.addEventListener('click', generatePreview);
    els.downloadBtn.addEventListener('click', download);
    
    // Template selector — только рендер, без лимита
    els.templateInputs.forEach(input => {
        input.addEventListener('change', () => {
            currentTemplate = input.value;
            updateTemplateHint();
            updateFieldGroups();
            if (!els.downloadBtn.disabled) {
                renderPreview();
            }
        });
    });
    
    // Инициализация хинта и field groups при загрузке
    updateTemplateHint();
    updateFieldGroups();
    updateCounter();
    checkPaymentReturn();
    
    // Debounce утилита
    function debounce(fn, ms) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), ms);
        };
    }
    
    // Экспорт для отладки
    window.OGApp = {
        generate: generatePreview,
        render: renderPreview,
        download: download,
        getData: () => currentData,
        getUsed: () => usedGenerations
    };
})();
