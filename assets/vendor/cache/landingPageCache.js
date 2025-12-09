// autoSaveContent.js

(function () {
    const TEXT_SELECTOR = "h1, h2, h3, h4, h5, h6, p, span, li, a, div, section";

    // Save all text content to localStorage
    function savePageContent() {
        document.querySelectorAll(TEXT_SELECTOR).forEach(el => {
            if (el.id) { // Only save elements with an ID
                localStorage.setItem(`lp_content_${el.id}`, el.innerHTML);
            }
        });
    }

    // Load all saved text content from localStorage
    function loadPageContent() {
        document.querySelectorAll(TEXT_SELECTOR).forEach(el => {
            if (el.id) {
                const saved = localStorage.getItem(`lp_content_${el.id}`);
                if (saved) el.innerHTML = saved;
            }
        });
    }

    // Auto-save every 5 seconds
    function startAutoSave() {
        setInterval(savePageContent, 5000);
    }

    // Initialize
    window.addEventListener("DOMContentLoaded", () => {
        loadPageContent();
        startAutoSave();
    });
})();
