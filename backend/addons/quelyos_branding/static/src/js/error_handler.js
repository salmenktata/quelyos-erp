/**
 * Quelyos Branding - Global Error Handler
 * Suppresses ResizeObserver errors caused by DOM manipulation
 *
 * This script must be loaded FIRST in web.assets_backend to work properly.
 */

(function() {
    'use strict';

    // ========================================
    // Method 1: Wrap ResizeObserver to catch errors in callbacks
    // ========================================
    if (typeof ResizeObserver !== 'undefined') {
        const OriginalResizeObserver = window.ResizeObserver;

        window.ResizeObserver = class extends OriginalResizeObserver {
            constructor(callback) {
                // Wrap the callback to catch errors
                const wrappedCallback = (entries, observer) => {
                    try {
                        callback(entries, observer);
                    } catch (error) {
                        // Silently ignore errors related to null parentNode
                        if (error.message &&
                            (error.message.includes('parentNode') ||
                             error.message.includes('null'))) {
                            // Do nothing - suppress the error
                            return;
                        }
                        // Re-throw other errors
                        throw error;
                    }
                };

                super(wrappedCallback);
            }
        };

        console.log('✅ Quelyos: ResizeObserver wrapper installed');
    }

    // ========================================
    // Method 2: Global error handler (backup)
    // ========================================
    window.addEventListener('error', function(e) {
        if (e.message &&
            (e.message.includes('ResizeObserver') ||
             e.message.includes('parentNode'))) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    }, true);

    // ========================================
    // Method 3: Catch unhandled promise rejections
    // ========================================
    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && e.reason.message &&
            (e.reason.message.includes('ResizeObserver') ||
             e.reason.message.includes('parentNode'))) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    }, true);

    // ========================================
    // Method 4: Override console.error to filter ResizeObserver errors
    // ========================================
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('ResizeObserver') ||
            message.includes('parentNode')) {
            // Suppress ResizeObserver errors in console
            return;
        }
        originalConsoleError.apply(console, args);
    };

    console.log('✅ Quelyos: Error handler loaded (multi-layer protection)');
})();
