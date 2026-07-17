/* payment-integration.js — USDT TRC-20 Payment Flow for OGfy
   Add this to js/app.js or include as separate file */

// ═══════════════════════════════════════════════════════════
// PAYMENT CONFIG
// ═══════════════════════════════════════════════════════════
const PAYMENT_CONFIG = {
    // CLOUDFLARE WORKER URL — заменить после деплоя
    // Если не настроен — verify покажет инструкцию вручную
    WORKER_URL: 'https://ogfy-payment.makszoom85.workers.dev',
    
    // Твой TRC-20 адрес для отображения пользователю
    TARGET_ADDRESS: 'TLdbF5RTXHTax71H9cAeU573pXxtMPZUuw',
    
    // Сумма в USDT
    AMOUNT_USDT: 5,
    
    // Сеть
    NETWORK: 'TRC-20 (Tron)'
};

// ═══════════════════════════════════════════════════════════
// PAYWALL UPGRADE — заменяем показ paywall на модалку оплаты
// ═══════════════════════════════════════════════════════════

function showPaymentModal() {
    // Удаляем старую модалку если есть
    const existing = document.getElementById('payment-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-overlay">
            <div class="payment-modal">
                <button class="payment-modal-close" onclick="closePaymentModal()">✕</button>
                
                <h2>Unlock Unlimited Access</h2>
                <p class="payment-desc">You've used all 5 free generations. Get unlimited access with a one-time payment.</p>
                
                <div class="payment-amount">
                    <span class="amount">$${PAYMENT_CONFIG.AMOUNT_USDT}</span>
                    <span class="currency">USDT ${PAYMENT_CONFIG.NETWORK}</span>
                </div>
                
                <div class="qr-section">
                    <h3>📱 Scan QR Code</h3>
                    <div class="qr-card">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tron:${PAYMENT_CONFIG.TARGET_ADDRESS}?amount=5" alt="Payment QR" class="payment-qr" id="payment-qr">
                        <p class="qr-hint">Scan with TronLink, Trust Wallet, or Bybit</p>
                        <a href="#" class="qr-download" onclick="downloadQR()">Download QR</a>
                    </div>
                </div>
                
                <div class="payment-steps">
                    <h3>How to pay:</h3>
                    <ol>
                        <li>Open your crypto wallet (Binance, Bybit, Trust Wallet, etc.)</li>
                        <li>Send <strong>$${PAYMENT_CONFIG.AMOUNT_USDT} USDT ${PAYMENT_CONFIG.NETWORK}</strong> to:</li>
                    </ol>
                    
                    <div class="address-box">
                        <input type="text" id="payment-address" value="${PAYMENT_CONFIG.TARGET_ADDRESS}" readonly>
                        <button class="btn-copy" onclick="copyAddress()">Copy</button>
                    </div>
                    
                    <p class="payment-note">After sending, paste your Transaction ID (TXID) below:</p>
                    
                    <div class="txid-input-group">
                        <input type="text" id="txid-input" placeholder="Paste TXID here (64 characters)" maxlength="64">
                        <button class="btn-verify" id="verify-btn" onclick="verifyPayment()">Verify Payment</button>
                    </div>
                    
                    <div id="payment-status" class="payment-status"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// ═══════════════════════════════════════════════════════════
// QR CODE DOWNLOAD
// ═══════════════════════════════════════════════════════════

function downloadQR() {
    const qrImg = document.getElementById('payment-qr');
    if (!qrImg) return;
    
    const link = document.createElement('a');
    link.href = qrImg.src;
    link.download = 'ogfy-payment-qr.png';
    link.click();
}

// ═══════════════════════════════════════════════════════════
// COPY ADDRESS
// ═══════════════════════════════════════════════════════════

function copyAddress() {
    const input = document.getElementById('payment-address');
    if (!input) return;
    
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        if (btn) {
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        }
    });
}

// ═══════════════════════════════════════════════════════════
// VERIFY PAYMENT (TXID → Cloudflare Worker)
// ═══════════════════════════════════════════════════════════

async function verifyPayment() {
    const txidInput = document.getElementById('txid-input');
    const statusEl = document.getElementById('payment-status');
    const verifyBtn = document.getElementById('verify-btn');
    
    if (!txidInput || !statusEl || !verifyBtn) return;
    
    const txId = txidInput.value.trim();
    
    // Валидация TXID
    if (!txId || txId.length !== 64) {
        statusEl.innerHTML = '<span class="status-error">❌ Invalid TXID. Must be exactly 64 characters.</span>';
        return;
    }
    
    if (!/^[a-fA-F0-9]+$/.test(txId)) {
        statusEl.innerHTML = '<span class="status-error">❌ TXID must contain only letters A-F and numbers 0-9.</span>';
        return;
    }
    
    // Показываем загрузку
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    statusEl.innerHTML = '<span class="status-loading">⏳ Checking blockchain... This may take 10-30 seconds.</span>';
    
    try {
        const response = await fetch(PAYMENT_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId: txId })
        });
        
        const data = await response.json();
        
        if (data.verified) {
            // Успех!
            localStorage.setItem('ogfy_paid', 'true');
            localStorage.removeItem('og_generations');
            usedGenerations = 0;
            updateCounter();
            
            statusEl.innerHTML = `
                <span class="status-success">✅ ${data.message}</span>
                <br>
                <span class="status-detail">Amount received: ${data.amount.toFixed(2)} USDT</span>
            `;
            
            // Закрываем модалку через 3 секунды
            setTimeout(() => {
                closePaymentModal();
                // Показываем успех
                showPaymentSuccess();
            }, 3000);
            
        } else {
            // Ошибка
            statusEl.innerHTML = `<span class="status-error">❌ ${data.message || 'Verification failed.'}</span>
            `;
        }
        
    } catch (error) {
        statusEl.innerHTML = '<span class="status-error">❌ Network error. Please check your connection and try again.</span>';
        console.error('Payment verification error:', error);
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify Payment';
    }
}

// ═══════════════════════════════════════════════════════════
// PAYMENT SUCCESS NOTICE
// ═══════════════════════════════════════════════════════════

function showPaymentSuccess() {
    const notice = document.createElement('div');
    notice.className = 'payment-success-notice';
    notice.innerHTML = `
        <div style="padding: 16px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; margin-bottom: 20px;">
            <strong>🎉 Payment successful!</strong> You now have unlimited access.
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(notice, container.firstChild);
    }
    
    // Скрыть пейволл если показан
    if (els.paywall) els.paywall.style.display = 'none';
    if (els.generatorLayout) els.generatorLayout.style.display = 'grid';
    if (els.counter) els.counter.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════
// MODIFIED SHOWPAYWALL — заменяем в app.js
// ═══════════════════════════════════════════════════════════

/* 
   В app.js заменить функцию showPaywall() на:
   
   function showPaywall() {
       showPaymentModal();
   }
*/

// Экспорт для отладки
window.OGPayment = {
    showModal: showPaymentModal,
    closeModal: closePaymentModal,
    verify: verifyPayment,
    config: PAYMENT_CONFIG
};
