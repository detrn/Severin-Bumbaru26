document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  if (window.innerWidth > 1024) {
    document.documentElement.style.scrollBehavior = "smooth";
  }
});
