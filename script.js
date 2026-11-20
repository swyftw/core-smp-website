// CORE SMP interactions: mobile navigation, copy IP, subtle UI audio and motion.
(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      playTone(open ? 510 : 390, .045, .018);
    });
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const copyButton = $("#copy-ip");
  const serverIp = $("#server-ip");
  const feedback = $("#copy-feedback");
  if (copyButton && serverIp && feedback) {
    copyButton.addEventListener("click", async () => {
      const address = serverIp.textContent.trim();
      try {
        await navigator.clipboard.writeText(address);
        feedback.textContent = "Server address copied.";
        playTone(760, .07, .025);
      } catch {
        feedback.textContent = "Copy is unavailable in this browser.";
      }
    });
  }

  // A quiet two-note UI sound. Audio is created only after a user gesture; no music.
  let audioContext = null;
  let soundOn = localStorage.getItem("core-ui-sound") !== "off";
  const soundButton = document.createElement("button");
  soundButton.className = "sound-toggle";
  soundButton.type = "button";
  soundButton.setAttribute("aria-label", "Toggle interface sounds");
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundButton.textContent = soundOn ? "♪" : "♪̸";
  document.body.appendChild(soundButton);

  function playTone(frequency=620, duration=.045, volume=.018) {
    if (!soundOn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {}
  }

  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem("core-ui-sound", soundOn ? "on" : "off");
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.textContent = soundOn ? "♪" : "♪̸";
    if (soundOn) playTone(700, .09, .025);
  });

  document.querySelectorAll(".button, .nav-links a, .feature-card, .tier-card").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      if (element.matches(".feature-card, .tier-card, .button")) playTone(430, .025, .008);
    }, {passive:true});
    if (element.matches(".button, .nav-links a")) {
      element.addEventListener("click", () => playTone(590, .04, .015));
    }
  });

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  let scrollQueued = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%";
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateProgress);
    }
  }, {passive:true});
  updateProgress();

  const revealTargets = document.querySelectorAll(".hero-copy, .hero-art, .join-strip, .section-heading, .feature-card, .community-banner, .store-status, .tier-card, .leaderboard-wrap, .store-hero");
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    if (element.classList.contains("feature-card") || element.classList.contains("tier-card")) {
      element.style.transitionDelay = (index % 3) * 75 + "ms";
    }
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    revealTargets.forEach(element => observer.observe(element));
  } else revealTargets.forEach(element => element.classList.add("is-visible"));

  // Short fade between local pages; respect reduced-motion preferences.
  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(link => {
    link.addEventListener("click", event => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(() => location.href = url.href, 180);
    });
  });
})();
