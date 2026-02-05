/**
 * Theme Manager - Dark/Light Mode Toggle
 */

const ThemeManager = {
  STORAGE_KEY: 'theme-preference',
  
  init() {
    this.toggleBtn = document.getElementById('theme-toggle');
    this.root = document.documentElement;
    
    // Get saved or system preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    this.setTheme(theme);
    this.bindEvents();
  },
  
  setTheme(theme) {
    this.root.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateIcon(theme);
  },
  
  toggle() {
    const current = this.root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },
  
  updateIcon(theme) {
    if (this.toggleBtn) {
      this.toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  },
  
  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
};

export default ThemeManager;
