(function() {
    const htmlElement = document.documentElement;

    function setTheme(theme) {
        const themeToggles = document.querySelectorAll('.theme-toggle-input');
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeToggles.forEach(toggle => {
                toggle.checked = true;
            });
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeToggles.forEach(toggle => {
                toggle.checked = false;
            });
        }
        localStorage.setItem('theme', theme);
    }

    function getTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    function initTheme() {
        const savedTheme = getTheme();
        setTheme(savedTheme);
    }

    function setupThemeToggle() {
        const themeToggles = document.querySelectorAll('.theme-toggle-input');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                if (this.checked) {
                    setTheme('dark');
                } else {
                    setTheme('light');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTheme();
            setupThemeToggle();
        });
    } else {
        initTheme();
        setupThemeToggle();
    }
})();

