// ===== ANIMAȚII =====

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right, .stat-block')
        .forEach(el => observer.observe(el));
}

function initParallax() {
    const hero = document.querySelector('.hero__parallax');
    if (!hero) return;
    window.addEventListener('scroll', () => {
        const offset = window.scrollY * 0.35;
        hero.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
}

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal-from-bottom").forEach((el) => {
    observer.observe(el);
  });
});