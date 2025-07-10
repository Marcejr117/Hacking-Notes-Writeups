// quartz/static/password-protect.js
(function () {
    function attachHandlers() {
        if (typeof CryptoJS === 'undefined') return;
        const modalOverlay = document.getElementById('pwd-modal-overlay');
        const modal = document.getElementById('pwd-modal');
        const input = document.getElementById('pwd-input');
        const btn = document.getElementById('pwd-btn');
        const errorEl = document.getElementById('pwd-error');
        const closeBtn = document.getElementById('pwd-modal-close');
        const container = document.getElementById('protected-content');
        // Obtener los datos de cifrado y hash del overlay
        const cipherText = modalOverlay?.dataset.cipher || modalOverlay?.getAttribute('data-cipher') || '';
        const storedHash = modalOverlay?.dataset.hash || modalOverlay?.getAttribute('data-hash') || '';

        // Si el modal ya tiene listeners, no volver a adjuntar
        if (modalOverlay?.dataset.listenerAttached === 'true') return;

        function closeModal() {
            if (modalOverlay) modalOverlay.style.display = 'none';
            if (errorEl) errorEl.textContent = '';
            if (input) input.value = '';
        }

        function openModal() {
            if (modalOverlay) modalOverlay.style.display = 'flex';
            if (input) input.value = '';
            if (errorEl) errorEl.textContent = '';
            if (input) input.focus();
        }

        function decrypt() {
            const pwd = input ? input.value.trim() : '';
            try {
                const attemptHash = CryptoJS.SHA256(pwd).toString();
                if (attemptHash !== storedHash) throw new Error('hash-mismatch');
                const bytes = CryptoJS.AES.decrypt(cipherText, attemptHash);
                const html = bytes.toString(CryptoJS.enc.Utf8);
                if (!html) throw new Error('bad-decrypt');
                if (container) {
                    container.innerHTML = html;
                    container.style.display = 'block';
                    if (window.setupCallout) window.setupCallout();
                    if (window.setupPopover) window.setupPopover();
                }
                closeModal();
            } catch (e) {
                if (errorEl) errorEl.textContent = 'Contraseña incorrecta';
            }
            if (input) input.value = '';
        }

        btn?.addEventListener('click', decrypt);
        const keyListener = (ev) => {
            if (ev.key === 'Enter') decrypt();
        };
        input?.addEventListener('keydown', keyListener);
        closeBtn?.addEventListener('click', closeModal);
        // Permitir reabrir el modal si el usuario lo cierra y vuelve a la página
        modalOverlay?.addEventListener('click', (ev) => {
            if (ev.target === modalOverlay) closeModal();
        });
        // Marcar como listeners adjuntados
        if (modalOverlay) modalOverlay.dataset.listenerAttached = 'true';
        // Abrir modal al cargar
        openModal();
    }

    // Detect SPA navigation (hashchange, popstate, or custom events)
    function observeRouteChanges() {
        // For frameworks that use pushState/popstate
        window.addEventListener('popstate', attachHandlers);
        // For hash-based routing
        window.addEventListener('hashchange', attachHandlers);
        // For custom nav events (Quartz emits 'nav')
        document.addEventListener('nav', attachHandlers);
        // Initial run
        attachHandlers();
        // Optionally, use MutationObserver for dynamic DOM changes
        const observer = new MutationObserver(attachHandlers);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        observeRouteChanges();
    } else {
        window.addEventListener('DOMContentLoaded', observeRouteChanges, { once: true });
    }
})(); 