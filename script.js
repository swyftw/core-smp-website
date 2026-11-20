// CORE SMP interactions: mobile navigation, amount preview, subtle UI sounds and motion.
(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  let audioContext = null;
  let soundOn = localStorage.getItem("core-ui-sound") !== "off";
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
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch {}
  }

  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links, .donate-nav");
  if (menuToggle && navLinks) menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    playTone(open ? 510 : 390, .045, .018);
  });

  const tagText = $("#tag-text"), tagPreview = $("#tag-live-preview");
  const tagColorOne = $("#tag-color-one"), tagColorTwo = $("#tag-color-two");
  const updateTagPreview = () => {
    if (!tagPreview) return;
    const value = tagText?.value.trim().slice(0,12) || "YOUR TAG";
    tagPreview.textContent = "[" + value.toUpperCase() + "]";
    tagPreview.style.setProperty("--tag-one", tagColorOne?.value || "#38bdf8");
    tagPreview.style.setProperty("--tag-two", tagColorTwo?.value || "#a78bfa");
  };
  [tagText,tagColorOne,tagColorTwo].filter(Boolean).forEach(input => input.addEventListener("input",updateTagPreview));
  updateTagPreview();

  const gradientName = $("#gradient-username"), gradientPreview = $("#gradient-live-preview");
  const gradientColors = [$("#gradient-color-one"),$("#gradient-color-two"),$("#gradient-color-three")];
  const updateGradientPreview = () => {
    if (!gradientPreview) return;
    gradientPreview.textContent = gradientName?.value.trim().slice(0,16) || "YourName";
    gradientColors.forEach((input,index) => gradientPreview.style.setProperty("--name-" + ["one","two","three"][index],input?.value || ["#34d399","#38bdf8","#818cf8"][index]));
  };
  [gradientName,...gradientColors].filter(Boolean).forEach(input => input.addEventListener("input",updateGradientPreview));
  updateGradientPreview();

  document.querySelectorAll(".catalog-search").forEach(search => search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    document.querySelectorAll(".design-card").forEach(card => { card.hidden = !card.textContent.toLowerCase().includes(term); });
  }));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const copyButton = $("#copy-ip"), serverIp = $("#server-ip"), feedback = $("#copy-feedback");
  if (copyButton && serverIp && feedback) copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(serverIp.textContent.trim());
      feedback.textContent = "Server address copied."; playTone(760, .07, .025);
    } catch { feedback.textContent = "Copy is unavailable in this browser."; }
  });

  const donationSlider = $("#donation-slider"), donationAmount = $("#donate-amount");
  const customAmount = $("#custom-amount"), presetButtons = document.querySelectorAll("[data-amount]");
  const updateDonationAmount = raw => {
    if (!donationSlider || !customAmount || !donationAmount) return;
    const value = Math.min(250, Math.max(1, Number(raw) || 1));
    donationSlider.value = String(value); customAmount.value = String(value);
    donationAmount.textContent = "$" + value.toFixed(2);
    presetButtons.forEach(button => button.classList.toggle("selected", Number(button.dataset.amount) === value));
  };
  if (donationSlider && customAmount) {
    donationSlider.addEventListener("input", () => updateDonationAmount(donationSlider.value));
    customAmount.addEventListener("change", () => updateDonationAmount(customAmount.value));
    presetButtons.forEach(button => button.addEventListener("click", () => updateDonationAmount(button.dataset.amount)));
    updateDonationAmount(donationSlider.value);
  }

  const soundButton = document.createElement("button");
  soundButton.className = "sound-toggle"; soundButton.type = "button";
  soundButton.setAttribute("aria-label", "Toggle interface sounds");
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundButton.textContent = soundOn ? "♪" : "♪̸";
  document.body.appendChild(soundButton);
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn; localStorage.setItem("core-ui-sound", soundOn ? "on" : "off");
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.textContent = soundOn ? "♪" : "♪̸";
    if (soundOn) playTone(700, .09, .025);
  });

  document.querySelectorAll(".button, .nav-links a, .donate-nav a, .feature-card, .tier-card, .amount-presets button").forEach(element => {
    element.addEventListener("pointerenter", () => {
      if (element.matches(".feature-card, .tier-card, .button, .amount-presets button")) playTone(430, .025, .008);
    }, {passive:true});
    if (element.matches(".button, .nav-links a, .donate-nav a, .amount-presets button"))
      element.addEventListener("click", () => playTone(590, .04, .015));
  });

  const progress = document.createElement("div"); progress.className = "scroll-progress"; document.body.appendChild(progress);
  let scrollQueued = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%"; scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, {passive:true});
  updateProgress();

  const revealTargets = document.querySelectorAll(".hero-copy, .hero-art, .join-strip, .section-heading, .feature-card, .community-banner, .store-status, .tier-card, .store-hero, .donate-panel");
  revealTargets.forEach((element,index) => {
    element.classList.add("reveal");
    if (element.classList.contains("feature-card") || element.classList.contains("tier-card"))
      element.style.transitionDelay = (index % 3) * 75 + "ms";
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), {threshold:.12});
    revealTargets.forEach(element => observer.observe(element));
  } else revealTargets.forEach(element => element.classList.add("is-visible"));

  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(link => link.addEventListener("click", event => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault(); document.body.classList.add("page-leaving");
    setTimeout(() => location.href = url.href, 180);
  }));
})();
