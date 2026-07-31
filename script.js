/* ============================================================
   ETB TCE & GTPH Chaalal — shared behaviour
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.querySelector("[data-menu-btn]");
  var drawer = document.querySelector("[data-drawer]");
  function setDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      setDrawer(!drawer.classList.contains("open"));
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-drawer-link]") || e.target === drawer) setDrawer(false);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });
  }

  /* ---------- Language switcher ---------- */
  var langSelects = document.querySelectorAll("[data-lang-select]");
  Array.prototype.forEach.call(langSelects, function (sel) {
    sel.addEventListener("change", function () {
      var url = this.value;
      if (url) window.location.href = url;
    });
  });

  /* ---------- Smooth anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            ro.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    Array.prototype.forEach.call(reveals, function (el, i) {
      el.style.setProperty("--d", Math.min(i % 6, 5) * 70 + "ms");
      ro.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCounter(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    Array.prototype.forEach.call(counters, function (el) {
      co.observe(el);
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox, lbImg, lbCount;
  function buildLightbox() {
    if (lightbox) return;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image preview");
    lightbox.innerHTML =
      '<button class="lb-close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button class="lb-nav lb-next" aria-label="Next">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +
      '<img src="" alt="Preview">' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lightbox);
    lbImg = lightbox.querySelector("img");
    lbCount = lightbox.querySelector(".lb-count");
    lightbox.querySelector(".lb-close").addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });
    lightbox.querySelector(".lb-prev").addEventListener("click", function () {
      moveLb(-1);
    });
    lightbox.querySelector(".lb-next").addEventListener("click", function () {
      moveLb(1);
    });
    window.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") moveLb(-1);
      if (e.key === "ArrowRight") moveLb(1);
    });
  }
  var lbItems = [];
  var lbIndex = 0;
  function openLb(items, index) {
    buildLightbox();
    lbItems = items;
    lbIndex = index;
    renderLb();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function renderLb() {
    lbImg.src = lbItems[lbIndex].src;
    lbImg.alt = lbItems[lbIndex].alt || "";
    lbCount.textContent = lbItems.length > 1 ? lbIndex + 1 + " / " + lbItems.length : "";
  }
  function moveLb(dir) {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    renderLb();
  }
  function closeLb() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-gallery]"), function (group) {
    var items = Array.prototype.map.call(group.querySelectorAll("img"), function (img) {
      return { src: img.currentSrc || img.src, alt: img.alt };
    });
    Array.prototype.forEach.call(group.querySelectorAll("img"), function (img, i) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        openLb(items, i);
      });
    });
  });

  /* ---------- Contact form (EmailJS) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var status = document.getElementById("formStatus");
      var isInputBtn = btn && btn.tagName === "INPUT";
      var originalLabel = btn
        ? btn.getAttribute("data-label") || (isInputBtn ? btn.value : btn.textContent.trim())
        : "";
      var successMsg = form.getAttribute("data-success") || "Thank you! We will get back to you as soon as possible.";
      var errorMsg = form.getAttribute("data-error") || "Something went wrong. Please try again.";

      function setBtnLabel(label) {
        if (isInputBtn) btn.value = label;
        else if (btn) btn.textContent = label;
      }

      function setStatus(kind, html) {
        if (!status) return;
        status.className = "form-status show " + kind;
        status.innerHTML = html;
        status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }

      if (!window.emailjs) {
        setStatus(
          "error",
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><div>' + errorMsg + "</div>"
        );
        return;
      }

      btn.disabled = true;
      setBtnLabel(btn.getAttribute("data-loading") || "Sending…");
      setStatus("", "");

      var params = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
      };

      emailjs
        .send("service_if9wn4l", "template_dcloigp", params)
        .then(function () {
          btn.disabled = false;
          setBtnLabel(originalLabel);
          form.reset();
          setStatus(
            "success",
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg><div id="formSuccessText">' + successMsg + "</div>"
          );
        })
        .catch(function () {
          btn.disabled = false;
          setBtnLabel(originalLabel);
          setStatus(
            "error",
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><div id="formErrorText">' + errorMsg + "</div>"
          );
        });
    });
  }

  /* ---------- Footer year ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
