/* ===========================
   Wishlist Button — inject into every card image wrap
   =========================== */
(function () {
  const heartSVG = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  document.querySelectorAll('.product-card__image-wrap').forEach((wrap) => {
    const btn = document.createElement('button');
    btn.className = 'btn-wishlist';
    btn.setAttribute('aria-label', 'Add to wishlist');
    btn.setAttribute('title', 'Save to wishlist');
    btn.innerHTML = heartSVG;
    btn.addEventListener('click', function () {
      this.classList.toggle('is-wishlisted');
      const wished = this.classList.contains('is-wishlisted');
      this.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Add to wishlist');
      this.innerHTML = wished
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : heartSVG;
    });
    wrap.appendChild(btn);
  });
})();

/* ===========================
   Hero Slider with Progress Bar (5-second auto-slide)
   =========================== */
(function () {
  const slider = document.getElementById('heroSlider');
  const slides = slider ? slider.querySelectorAll('.hero-slide') : [];
  const progressBar = document.getElementById('progressBar');
  const heroProgress = document.getElementById('heroProgress');
  const sliderDots = document.getElementById('heroDots');
  const SLIDE_DURATION = 5000; // 5 seconds
  let currentSlide = 0;
  let autoSlideInterval = null;

  function createDots() {
    if (!sliderDots || slides.length === 0) return;
    
    sliderDots.innerHTML = ''; // Clear existing dots
    
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      sliderDots.appendChild(dot);
    }
  }

  function goToSlide(index) {
    if (slides.length === 0) return;
    
    // Handle bounds
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Remove active class from current slide and dot
    slides[currentSlide].classList.remove('active');
    const dots = sliderDots.querySelectorAll('.dot');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.remove('active');
    }

    // Add active class to new slide and dot
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }

    // Reset and restart progress
    resetProgress();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function resetProgress() {
    // Clear existing interval
    if (autoSlideInterval) {
      clearTimeout(autoSlideInterval);
      autoSlideInterval = null;
    }

    // Reset progress bar with smooth animation
    if (progressBar) {
      // Remove transition temporarily
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      
      // Force reflow to ensure reset
      progressBar.offsetHeight;
      
      // Add smooth linear transition for 5 seconds
      progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
      
      // Start animation to 100%
      requestAnimationFrame(() => {
        progressBar.style.width = '100%';
      });
    }

    // Set up auto-slide to trigger when progress completes
    autoSlideInterval = setTimeout(() => {
      nextSlide();
    }, SLIDE_DURATION);
  }

  function pauseAutoSlide() {
    if (autoSlideInterval) {
      clearTimeout(autoSlideInterval);
      autoSlideInterval = null;
    }
    
    // Pause progress bar animation at current position
    if (progressBar) {
      const currentWidth = progressBar.offsetWidth;
      const parentWidth = progressBar.parentElement.offsetWidth;
      const currentProgress = (currentWidth / parentWidth) * 100;
      
      // Freeze progress bar at current position
      progressBar.style.transition = 'none';
      progressBar.style.width = `${currentProgress}%`;
    }
  }

  function resumeAutoSlide() {
    if (progressBar) {
      const currentWidth = progressBar.offsetWidth;
      const parentWidth = progressBar.parentElement.offsetWidth;
      const currentProgress = (currentWidth / parentWidth) * 100;
      
      // Calculate remaining time based on current progress
      const remainingTime = ((100 - currentProgress) / 100) * SLIDE_DURATION;
      
      // Resume smooth animation to completion
      progressBar.style.transition = `width ${remainingTime}ms linear`;
      progressBar.style.width = '100%';
      
      // Set timer for remaining time
      autoSlideInterval = setTimeout(() => {
        nextSlide();
      }, remainingTime);
    }
  }

  function setupScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe hero progress bar
    if (heroProgress) {
      observer.observe(heroProgress);
    }

    // Observe slides for animation
    slides.forEach(slide => {
      observer.observe(slide);
    });
  }

  function setupEventListeners() {
    if (!slider) return;

    // Pause auto-slide on hover
    slider.addEventListener('mouseenter', pauseAutoSlide);
    slider.addEventListener('mouseleave', resumeAutoSlide);

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe(touchStartX, touchEndX);
    });
  }

  function handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    }
  }

  // Initialize
  if (slides.length > 0) {
    createDots();
    setupEventListeners();
    setupScrollReveal();
    slides[0].classList.add('active');
    resetProgress();
  }

  /* ===========================
     Mobile Nav Toggle
     =========================== */
  const navToggle = document.getElementById('navToggle');
  const siteNav   = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close nav when a link is clicked
    siteNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===========================
     Add to Cart — feedback
     =========================== */
  document.querySelectorAll('.btn-cart').forEach((btn) => {
    btn.addEventListener('click', function () {
      const original = this.innerHTML;
      this.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Added!
      `;
      this.style.backgroundColor = '#388e3c';
      const badge = document.querySelector('.cart-badge');
      if (badge) badge.textContent = String(parseInt(badge.textContent || '0', 10) + 1);
      setTimeout(() => {
        this.innerHTML = original;
        this.style.backgroundColor = '';
      }, 1800);
    });
  });
})();

/* ===========================
   Scroll Reveal Section
   =========================== */
(function () {
  const section = document.querySelector('.reveal-section');
  const clip    = document.querySelector('.reveal-clip');
  if (!section || !clip) return;

  function onScroll() {
    const rect         = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let progress = 1 - rect.bottom / (section.offsetHeight + windowHeight);
    progress = Math.min(Math.max(progress, 0), 1);
    const inset  = 18 - progress * 18;
    const radius = 28 - progress * 28;
    clip.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${radius}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // set initial state
})();

/* ===========================
   New Arrivals Slider
   =========================== */
let naIndex = 0;

function moveNASlide(direction) {
  const track = document.getElementById("naTrack");
  const cards = document.querySelectorAll(".na-card");
  const cardWidth = cards[0].offsetWidth;
  const gap = parseInt(getComputedStyle(track).gap) || 0;

  let visibleCards = window.innerWidth <= 650 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  let maxIndex = cards.length - visibleCards;

  naIndex += direction;

  if (naIndex < 0) naIndex = maxIndex;
  if (naIndex > maxIndex) naIndex = 0;

  track.style.transform = `translateX(-${naIndex * (cardWidth + gap)}px)`;
}

window.addEventListener("resize", () => {
  naIndex = 0;
  const track = document.getElementById("naTrack");
  if (track) {
    track.style.transform = "translateX(0)";
  }
});
