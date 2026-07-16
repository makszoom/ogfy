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
        counter: document.getElementById('counter')
    };
    
    // Состояние
    let usedGenerations = parseInt(localStorage.getItem('og_generations') || '0');
    let currentTemplate = 'minimal';
    let currentData = {};
    let bgImageData = null;
    
    // Инициализация счётчика
    function updateCounter() {
        const remaining = Math.max(0, 5 - usedGenerations);
        els.freeCount.textContent = remaining;
        
        if (remaining <= 0) {
            showPaywall();
        }
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
    
    // Получить выбранный шаблон
    function getSelectedTemplate() {
        for (const input of els.templateInputs) {
            if (input.checked) return input.value;
        }
        return 'minimal';
    }
    
    // Генерация preview
    async function generatePreview() {
        // Проверка лимита
        if (usedGenerations >= 5 && !isPro()) {
            showPaywall();
            return;
        }
        
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
        
        // Увеличить счётчик
        usedGenerations++;
        localStorage.setItem('og_generations', usedGenerations.toString());
        updateCounter();
        
        // Анимация
        els.previewCanvas.style.opacity = '0';
        els.previewCanvas.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            els.previewCanvas.style.transition = 'opacity 0.3s, transform 0.3s';
            els.previewCanvas.style.opacity = '1';
            els.previewCanvas.style.transform = 'translateY(0)';
        });
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
    
    // Обновление preview в реальном времени (опционально)
    // els.title.addEventListener('input', debounce(generatePreview, 500));
    
    // Template selector
    els.templateInputs.forEach(input => {
        input.addEventListener('change', () => {
            currentTemplate = input.value;
            if (!els.downloadBtn.disabled) {
                generatePreview();
            }
        });
    });
    
    // Инициализация
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
        download: download,
        getData: () => currentData,
        getUsed: () => usedGenerations
    };
})();
