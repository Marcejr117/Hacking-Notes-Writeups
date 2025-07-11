// quartz/static/password-protect.js
(function () {
    let currentListeners = new Set();
    let decryptedPages = new Set(); // Para recordar páginas ya desencriptadas

    function cleanupListeners() {
        // Limpiar todos los listeners previos
        currentListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        currentListeners.clear();
    }

    function attachHandlers() {
        if (typeof CryptoJS === 'undefined') return;

        // Limpiar listeners previos al adjuntar nuevos
        cleanupListeners();

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

        // Si no hay modal o datos de cifrado, no hacer nada
        if (!modalOverlay || !cipherText || !storedHash) return;

        // Verificar si esta página ya fue desencriptada
        const currentPageId = document.body.dataset.slug;
        if (decryptedPages.has(currentPageId)) {
            // Si ya fue desencriptada, mostrar el contenido directamente y ocultar modal
            if (container) {
                container.style.display = 'block';
            }
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
                modalOverlay.style.visibility = 'hidden';
                modalOverlay.style.opacity = '0';
                modalOverlay.style.pointerEvents = 'none';
            }
            return;
        }

        function closeModal() {
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
                modalOverlay.style.visibility = 'hidden';
                modalOverlay.style.opacity = '0';
                modalOverlay.style.pointerEvents = 'none';
                modalOverlay.remove(); // Eliminar completamente del DOM
            }
            if (errorEl) errorEl.textContent = '';
            if (input) input.value = '';
        }

        function openModal() {
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
                modalOverlay.style.visibility = 'visible';
                modalOverlay.style.opacity = '1';
                modalOverlay.style.pointerEvents = 'auto';
            }
            if (input) input.value = '';
            if (errorEl) errorEl.textContent = '';
            if (input) input.focus();
        }

        function decrypt() {
            const pwd = input ? input.value.trim() : '';
            if (!pwd) {
                if (errorEl) errorEl.textContent = 'Por favor ingresa una contraseña';
                return;
            }

            try {
                const attemptHash = CryptoJS.SHA256(pwd).toString();
                if (attemptHash !== storedHash) {
                    if (errorEl) errorEl.textContent = 'Contraseña incorrecta';
                    if (input) input.value = '';
                    return;
                }

                const bytes = CryptoJS.AES.decrypt(cipherText, attemptHash);
                const html = bytes.toString(CryptoJS.enc.Utf8);
                if (!html) {
                    if (errorEl) errorEl.textContent = 'Error al desencriptar el contenido';
                    if (input) input.value = '';
                    return;
                }

                // Marcar esta página como desencriptada
                decryptedPages.add(currentPageId);

                // Cerrar modal completamente
                closeModal();

                // Luego renderizar el contenido
                if (container) {
                    container.innerHTML = html;
                    container.style.display = 'block';
                    if (window.setupCallout) window.setupCallout();
                    if (window.setupPopover) window.setupPopover();
                    // Disparar evento 'nav' para re-inicializar ToC y progreso de scroll
                    const navEvent = new CustomEvent('nav', { detail: { url: currentPageId } });
                    document.dispatchEvent(navEvent);
                }

            } catch (e) {
                if (errorEl) errorEl.textContent = 'Error al desencriptar el contenido';
                if (input) input.value = '';
            }
        }

        // Adjuntar listeners y guardarlos para limpieza posterior
        if (btn) {
            btn.addEventListener('click', decrypt);
            currentListeners.add({ element: btn, event: 'click', handler: decrypt });
        }

        const keyListener = (ev) => {
            if (ev.key === 'Enter') decrypt();
        };
        if (input) {
            input.addEventListener('keydown', keyListener);
            currentListeners.add({ element: input, event: 'keydown', handler: keyListener });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
            currentListeners.add({ element: closeBtn, event: 'click', handler: closeModal });
        }

        // Permitir reabrir el modal si el usuario lo cierra y vuelve a la página
        const overlayClickListener = (ev) => {
            if (ev.target === modalOverlay) closeModal();
        };
        if (modalOverlay) {
            modalOverlay.addEventListener('click', overlayClickListener);
            currentListeners.add({ element: modalOverlay, event: 'click', handler: overlayClickListener });
        }

        // Abrir modal al cargar
        openModal();
    }

    // Interceptar clicks en anclas internas para evitar recarga de página
    function setupAnchorInterception() {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (!href) return;

            // Si es un ancla interna (empieza con #)
            if (href.startsWith('#')) {
                const currentPageId = document.body.dataset.slug;
                // Si la página actual ya está desencriptada, permitir el scroll interno
                if (decryptedPages.has(currentPageId)) {
                    return; // Permitir comportamiento normal
                } else {
                    // Si no está desencriptada, prevenir el scroll
                    event.preventDefault();
                    return;
                }
            }

            // Si es un enlace a la misma página con hash
            if (href.includes('#') && !href.startsWith('http')) {
                const currentPageId = document.body.dataset.slug;
                if (decryptedPages.has(currentPageId)) {
                    return; // Permitir comportamiento normal
                } else {
                    event.preventDefault();
                    return;
                }
            }
        });
    }

    // Detect SPA navigation (hashchange, popstate, or custom events)
    function observeRouteChanges() {
        // Limpiar listeners previos antes de adjuntar nuevos
        cleanupListeners();

        // For frameworks that use pushState/popstate
        window.addEventListener('popstate', attachHandlers);
        // For hash-based routing
        window.addEventListener('hashchange', attachHandlers);
        // For custom nav events (Quartz emits 'nav')
        document.addEventListener('nav', attachHandlers);
        // Initial run
        attachHandlers();
        // Setup anchor interception
        setupAnchorInterception();
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