/**
 * Main JavaScript
 * Handles: loading screen, navigation, scroll-to-top,
 * rotating circle text, stat counters, scroll-reveal animations,
 * active nav highlighting, contact form, and achievement gallery lightbox.
 */

(function () {
  "use strict";

  /* ========== DOM References ========== */
  const loader = document.getElementById("loader");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const burgerIcon = document.getElementById("burgerIcon");
  const navMenu = document.getElementById("navMenu");
  const navOverlay = document.getElementById("navOverlay");
  const navLinks = document.querySelectorAll(".nav-menu ul a");
  const navCta = document.querySelector(".nav-cta");
  const statElements = document.querySelectorAll(".hero-stat");
  const contactForm = document.getElementById("contactForm");
  const successMsg = document.getElementById("successMsg");
  const errorMsg = document.getElementById("errorMsg");
  const revealElements = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("section[id]");

  /* ========== Loading Screen ========== */
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.style.overflow = "";
      document.body.style.overflowX = "hidden";
    }, 800);
  });

  /* ========== Scroll-to-Top Button ========== */
  function handleScrollBtn() {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ========== Mobile Navigation ========== */
  function isMobileMenuOpen() {
    return navMenu.classList.contains("active");
  }

  function closeNav() {
    burgerIcon.classList.remove("active");
    navMenu.classList.remove("active");
    navOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  /**
   * Navigate to a section by its hash (e.g. "#about").
   * Takes fixed header height into account so section titles aren't obscured.
   */
  function navigateToSection(hash) {
    const targetId = hash.replace("#", "");
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    function doScroll() {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 70;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 15;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    }

    if (isMobileMenuOpen()) {
      closeNav();
      setTimeout(doScroll, 200);
    } else {
      doScroll();
    }
  }

  burgerIcon.addEventListener("click", () => {
    const open = burgerIcon.classList.toggle("active");
    navMenu.classList.toggle("active", open);
    navOverlay.classList.toggle("active", open);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  navOverlay.addEventListener("click", closeNav);

  // Close mobile nav when device orientation changes
  window.addEventListener("orientationchange", function () {
    if (isMobileMenuOpen()) closeNav();
  });
  // Also handle resize (covers desktop ↔ mobile breakpoint transitions)
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024 && isMobileMenuOpen()) closeNav();
  });

  // Attach click handlers to ALL nav links (both <ul> links and CTA button)
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const hash = this.getAttribute("href");
      navigateToSection(hash);
      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, hash);
      }
    });
  });

  // Also handle the "Contact Me" CTA button in the nav
  if (navCta) {
    navCta.addEventListener("click", function (e) {
      e.preventDefault();
      const hash = this.getAttribute("href");
      navigateToSection(hash);
      if (history.pushState) {
        history.pushState(null, null, hash);
      }
    });
  }

  /* ========== Active Nav Link on Scroll ========== */
  function highlightActiveSection() {
    const scrollY = window.scrollY + 150;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active-link");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active-link");
          }
        });
      }
    });
  }

  /* ========== Stat Counter Animation ========== */
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statElements.forEach((stat) => {
      const target = parseInt(stat.dataset.target, 10);
      const suffix = stat.dataset.suffix || "";
      const h3 = stat.querySelector("h3");
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(eased * target);
        h3.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          h3.textContent = target + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  /* ========== Scroll Reveal ========== */
  function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 80) {
        el.classList.add("revealed");
      }
    });

    // Trigger stat counter when hero section is visible
    if (!statsAnimated) {
      const heroStats = document.querySelector(".hero-stats");
      if (heroStats) {
        const rect = heroStats.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          animateCounters();
        }
      }
    }
  }

  /* ========== Contact Form — EmailJS Integration ========== */
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      console.log("Form submitted");

      const submitBtn = document.getElementById("submitBtn");
      const btnText = document.getElementById("btnText");

      // Collect form data
      const templateParams = {
        from_name: contactForm.from_name.value.trim(),
        from_email: contactForm.from_email.value.trim(),
        subject: contactForm.subject.value.trim(),
        message: contactForm.message.value.trim()
      };

      console.log("Form data:", templateParams);

      // Validate
      if (!templateParams.from_name || !templateParams.from_email || !templateParams.subject || !templateParams.message) {
        console.error("Validation failed: empty fields");
        showFormMessage(errorMsg);
        return;
      }

      // Disable button and show loading state
      submitBtn.disabled = true;
      btnText.textContent = "Sending…";

      console.log("Calling emailjs.send…");

      emailjs
        .sendForm('service_dfcyshl', 'template_70vwk5n', this)
        .then(
          function (response) {
            console.log("EmailJS SUCCESS:", response.status, response.text);
            showFormMessage(successMsg);
            contactForm.reset();
          },
          function (error) {
            console.error("EmailJS FAILED:", error);
            console.error("Status:", error.status, "Text:", error.text);

            // Update error message with details
            var span = errorMsg.querySelector("span");
            if (span) {
              if (error.status === 400) span.textContent = "Bad request — check template variables.";
              else if (error.status === 401) span.textContent = "Unauthorized — check Public Key.";
              else if (error.status === 404) span.textContent = "Service or template not found.";
              else if (error.status === 412) span.textContent = "Template variable mismatch.";
              else if (error.status === 422) span.textContent = "Invalid email format.";
              else span.textContent = "Something went wrong (status " + error.status + "). Try again.";
            }
            showFormMessage(errorMsg);
          }
        )
        .finally(function () {
          submitBtn.disabled = false;
          btnText.textContent = "Send Message";
          console.log("Request complete, button re-enabled");
        });
    });
  } else {
    console.error("contactForm element not found in DOM");
  }

  function showFormMessage(element) {
    element.classList.add("show");
    setTimeout(() => {
      element.classList.remove("show");
    }, 5000);
  }

  /* ========== Scroll Event Listener ========== */
  window.addEventListener("scroll", () => {
    handleScrollBtn();
    highlightActiveSection();
    revealOnScroll();
  });

  // Initial calls
  revealOnScroll();
  highlightActiveSection();
})();

/* ========== Achievement Gallery Lightbox ========== */
const galleryData = {
  cop27: [
    "images/achievements/delta-shield.jpg",
    "images/achievements/presented.jpg",
  ],
  safehaven: [
    "images/achievements/1_SafeHaven_Certificate ITC 2025.jpeg",
    "images/achievements/2_SafeHaven.jpg"
  ],
  lumeria: [
    "images/achievements/1_Lumeria.jpg",
    "images/achievements/2_Lumeria.jpg"
  ],
  itc: [
    "images/achievements/1_Certificate ITC.jpg",
    "images/achievements/2_ITC.jpg",
    "images/achievements/3_ITC.jpg",
    "images/achievements/4_ITC.jpg"
  ],
  depi: [
    "images/achievements/1_DEPI.png"
  ],
  presenter: [
    "images/achievements/1_Presenter.jpg",
    "images/achievements/2_Presenter_Certificate AI Pioneers.jpg",
    "images/achievements/3_Presenter.jpg",
    "images/achievements/4_Presenter.jpg",
    "images/achievements/5_Presenter.png",
    "images/achievements/6_Presenter.png"
  ],
  gdg: [
    "images/achievements/1_GDG.jpg",
    "images/achievements/2_GDG.jpeg"
  ],
  iti: [
    "images/achievements/1_Certificate ITI – Internship Program.jpg"
  ],
  certs: [
    "images/achievements/1_Coursera AFGKDZQ382J4.jpg",
    "images/achievements/2_Coursera EU97L9WTB973.jpg",
    "images/achievements/3_Certificates CIB – Internship Program_page-0001.jpg",
    "images/achievements/4_Certificates CIB – Internship Program_page-0002.jpg",
    "images/achievements/5_Certificates CIB – Internship Program_page-0003.jpg",
    "images/achievements/6_Certificates CIB – Internship Program_page-0004.jpg",
    "images/achievements/7_Certificate Elevvo Pathways – Internship Program.jpg"
  ]
};

let currentGallery = [];
let currentImageIndex = 0;

/**
 * Show a single image in the gallery and update the counter.
 * Uses a brief opacity fade for a smooth transition.
 */
function updateGalleryImage() {
  var img = document.getElementById("galleryImage");
  img.style.opacity = "0";
  setTimeout(function () {
    img.style.display = "block";
    img.src = currentGallery[currentImageIndex];
    img.alt = "Achievement image " + (currentImageIndex + 1);
    img.onload = function () {
      img.style.opacity = "1";
    };
    // Fallback: force visible even if onload doesn't fire (cached images)
    setTimeout(function () { img.style.opacity = "1"; }, 200);
  }, 150);
  document.getElementById("currentImage").textContent = currentImageIndex + 1;
  document.getElementById("totalImages").textContent = currentGallery.length;
}

function openGallery(achievementId, startIndex = 0) {
  currentGallery = galleryData[achievementId] || [];
  if (currentGallery.length === 0) return;

  // Set the requested start index (fallback to 0 if out of bounds)
  currentImageIndex = (startIndex >= 0 && startIndex < currentGallery.length) ? startIndex : 0;

  // Lock body scroll cleanly without moving viewport position
  document.body.style.overflow = "hidden";

  // Show the selected image immediately
  var img = document.getElementById("galleryImage");
  img.style.display = "block";
  img.style.opacity = "1";
  img.src = currentGallery[currentImageIndex];
  img.alt = "Achievement image " + (currentImageIndex + 1);

  // Handle load errors
  img.onerror = function () {
    console.error("Gallery: failed to load", img.src);
  };

  document.getElementById("currentImage").textContent = currentImageIndex + 1;
  document.getElementById("totalImages").textContent = currentGallery.length;

  document.getElementById("galleryModal").classList.add("active");
}

function closeGallery(e) {
  if (e) {
    if (typeof e.preventDefault === "function") e.preventDefault();
    if (typeof e.stopPropagation === "function") e.stopPropagation();
  }

  var modal = document.getElementById("galleryModal");
  if (modal) {
    modal.classList.remove("active");
  }

  // Restore body scroll safely
  document.body.style.overflow = "";
}

function nextImage() {
  if (currentGallery.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
  updateGalleryImage();
  if (navigator.vibrate) navigator.vibrate(10);
}

function prevImage() {
  if (currentGallery.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
  updateGalleryImage();
  if (navigator.vibrate) navigator.vibrate(10);
}

// Keyboard navigation for gallery
document.addEventListener("keydown", function (e) {
  var modal = document.getElementById("galleryModal");
  if (modal && modal.classList.contains("active")) {
    if (e.key === "Escape") closeGallery(e);
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  }
});

// Touch swipe support for gallery
(function () {
  var touchStartX = 0;
  var touchStartY = 0;
  var SWIPE_THRESHOLD = 50;

  function isGalleryActive() {
    var modal = document.getElementById("galleryModal");
    return modal && modal.classList.contains("active");
  }

  document.addEventListener("touchstart", function (e) {
    if (!isGalleryActive()) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener("touchend", function (e) {
    if (!isGalleryActive()) return;
    var diffX = touchStartX - e.changedTouches[0].screenX;
    var diffY = touchStartY - e.changedTouches[0].screenY;

    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }, { passive: true });
})();س