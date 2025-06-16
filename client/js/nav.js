"use strict";
function preventNavigation() {
    //clicking back button in browser loses current game - prevent it.

    // Push a dummy state to prevent back navigation
    window.history.pushState(null, null, window.location.href);
    // Prevent swipe navigation (for some browsers) / and browser back button by pushing a new state and handling popstate
    window.addEventListener('popstate', function (e) { history.pushState(null, null, window.location.href); });

    // Prevent accidental back/forward navigation with keyboard
    window.addEventListener('keydown', function (e) {
        // Prevent Backspace navigation when not in input/textarea
        if (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))
        {
            e.preventDefault();
        }
        
        // Prevent Alt+Left/Right Arrow (back/forward)
        if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
            e.preventDefault();
        }
        // Prevent Ctrl+Left/Right Arrow (some browsers/extensions)
        if ((e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
            e.preventDefault();
        }
        // Prevent Meta+Left/Right Arrow (Cmd on Mac)
        if ((e.metaKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
            e.preventDefault();
        }
        // Prevent browser navigation with Backspace, except in editable fields
        if (
            e.key === 'Backspace' &&
            !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) &&
            !document.activeElement.isContentEditable
        ) {
            e.preventDefault();
        }
    });

    // Remove browser context menu
    document.body.oncontextmenu = function(e) { e.preventDefault(); };
    // Remove drag/drop
    document.body.ondragstart = function(e) { e.preventDefault(); };
};
