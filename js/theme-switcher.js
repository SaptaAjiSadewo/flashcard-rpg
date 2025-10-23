// Theme Management
class ThemeSwitcher {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.themeStyle = document.getElementById("theme-style");
    this.themeIcon = this.themeToggle.querySelector(".theme-icon");

    this.currentTheme = localStorage.getItem("codecards_theme") || "light";

    this.initializeTheme();
    this.initializeEventListeners();
  }

  initializeTheme() {
    this.setTheme(this.currentTheme);
  }

  initializeEventListeners() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
    localStorage.setItem("codecards_theme", this.currentTheme);
  }

  setTheme(theme) {
    document.body.className = theme + "-mode";
    this.themeIcon.textContent = theme === "light" ? "🌙" : "☀️";

    // Update highlight.js theme
    const highlightLink = document.querySelector('link[href*="highlight.js"]');
    if (highlightLink) {
      const newTheme =
        theme === "dark"
          ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
          : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";

      highlightLink.href = newTheme;
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}
