/**
 * Quelyos Branding - Global Error Handler
 * Suppresses ResizeObserver errors caused by DOM manipulation
 */

(function() {
    'use strict';

    // Suppress ResizeObserver errors
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('ResizeObserver')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    }, true);

    // Also catch unhandledrejection for async errors
    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    }, true);

    console.log('✅ Quelyos: Error handler loaded');
})();
