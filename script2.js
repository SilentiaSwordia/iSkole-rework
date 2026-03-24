// Function to check the system preference
const detectSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Initial theme application (optional, if not using CSS-only)
// document.documentElement.setAttribute('data-theme', detectSystemTheme());

// Listen for changes in the system theme
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (e.matches) {
      // System switched to dark mode
      console.log("System switched to dark mode");
      // You can add JS logic here to update your theme if needed
    } else {
      // System switched to light mode
      console.log("System switched to light mode");
      // You can add JS logic here to update your theme if needed
    }
  });
