const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
const copyButton = document.querySelector("#copy-ip");
const serverIp = document.querySelector("#server-ip");
const feedback = document.querySelector("#copy-feedback");
if (copyButton && serverIp && feedback) {
  copyButton.addEventListener("click", async () => {
    const address = serverIp.textContent.trim();
    if (!address || address === "YOUR SERVER IP") {
      feedback.textContent = "Server address will be added soon.";
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      feedback.textContent = "Server address copied.";
    } catch {
      feedback.textContent = "Copy is unavailable in this browser.";
    }
  });
}