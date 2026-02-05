/**
 * Main Application Entry Point
 * Alan Prates Portfolio
 */

import ThemeManager from './modules/theme.js';
import GitHubManager from './modules/github.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    GitHubManager.init();

    // Add scroll effect to header
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        });
    }
});
