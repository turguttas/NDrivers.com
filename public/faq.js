// ---------------- FAQ Accordion + Categories + Dark Mode ----------------
document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById('faq-root');

  if (container) {
    // --- Accordion toggle ---
    container.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qa = btn.closest('.qa');
        const answer = qa.querySelector('.a');
        const isOpen = answer.classList.contains('show');

        if (isOpen) {
          answer.classList.remove('show');
          btn.setAttribute('aria-expanded','false');
          btn.textContent = 'View';
        } else {
          answer.classList.add('show');
          btn.setAttribute('aria-expanded','true');
          btn.textContent = 'Hide';
        }
      });

      // Keyboard support (Enter/Space)
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // --- Category nav scroll + active state ---
    const categories = container.querySelectorAll('.category');
    categories.forEach(cat => {
      cat.addEventListener('click', ev => {
        ev.preventDefault();
        const targetId = cat.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (!target) return;

        target.scrollIntoView({behavior:'smooth', block:'start'});

        categories.forEach(c => c.classList.remove('active'));
        cat.classList.add('active');

        setTimeout(() => target.focus({preventScroll:true}), 400);
      });
    });

    // --- Scroll spy to highlight active category ---
    const cards = container.querySelectorAll('.content .card');
    window.addEventListener('scroll', () => {
      const fromTop = window.scrollY + 120; // adjust offset
      cards.forEach(card => {
        if (card.offsetTop <= fromTop && card.offsetTop + card.offsetHeight > fromTop) {
          categories.forEach(c => c.classList.remove('active'));
          const activeCat = container.querySelector(`.category[data-target="${card.id}"]`);
          if (activeCat) activeCat.classList.add('active');
        }
      });
    });
  }

  // ---------------- Dark Mode ----------------
  const toggle = document.getElementById('darkModeToggle');
  const logoImg = document.getElementById('logoImg');
  const mapImg = document.getElementById('mapImg');

  function setDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (toggle) toggle.textContent = isDark ? '☀️' : '🌙';
    if (logoImg) logoImg.src = isDark ? '/img/logo-white.png' : '/img/logo.png';
    if (mapImg) mapImg.src = isDark ? '/img/map-placeholder-dark.jpg' : '/img/map-placeholder.jpg';
  }

  const savedDark = localStorage.getItem('darkMode') === 'true';

  if (toggle) {
    setDarkMode(savedDark);

    toggle.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      setDarkMode(isDark);
      localStorage.setItem('darkMode', isDark);
    });
  }

});
