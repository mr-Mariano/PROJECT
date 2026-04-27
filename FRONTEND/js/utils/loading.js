// FRONTEND/js/ui/loading.js
const Loader = (() => {
                let activeRequests = 0;
                let overlay = null;

                function ensureOverlay() {
                                overlay = document.createElement('div');
                                if (overlay) return overlay;
                                overlay.id = 'global-loader';
                                overlay.innerHTML = `
                                <div class="global-loader-backdrop">
                                <div class="global-loader-spinner" aria-label="Loading"></div>
                                <p>Loading...</p>
                                </div>
                                `;
                                document.body.appendChild(overlay);
                                return overlay;
                }

                function show() {
                                activeRequests += 1;
                                const node = ensureOverlay();
                                node.style.display = 'flex';
                }


                function hide() {
                                activeRequests = Math.max(0, activeRequests - 1);
                                if (activeRequests === 0 && overlay) {
                                                overlay.style.display = 'none';
                                }
                }

                async function withLoading(task) {
                                show();
                                try {
                                                return await task();
                                } finally {
                                                hide();
                                }
                }

                return { show, hide, withLoading };
})();