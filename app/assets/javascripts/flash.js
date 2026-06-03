// flash.js - Flash notifications auto-dismiss and close behavior
document.addEventListener("turbo:load", setupFlashEvents);
document.addEventListener("DOMContentLoaded", setupFlashEvents);

function setupFlashEvents() {
  const flashElements = document.querySelectorAll(".flash");
  
  flashElements.forEach((flash) => {
    // Prevent duplicate initialization
    if (flash.dataset.flashInitialized) return;
    flash.dataset.flashInitialized = "true";

    // Style adjustments for smooth transitions
    flash.style.transition = "opacity 0.5s ease, transform 0.5s ease, margin 0.5s ease, padding 0.5s ease, height 0.5s ease";
    flash.style.opacity = "1";
    flash.style.transform = "translateY(0)";

    // Dynamically create close button
    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.float = "right";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "1.5rem";
    closeBtn.style.lineHeight = "0.8";
    closeBtn.style.marginLeft = "15px";
    closeBtn.style.color = "var(--color-ink-light)";
    closeBtn.style.opacity = "0.6";
    closeBtn.style.transition = "opacity 0.2s ease";
    
    closeBtn.addEventListener("mouseover", () => closeBtn.style.opacity = "1");
    closeBtn.addEventListener("mouseout", () => closeBtn.style.opacity = "0.6");
    
    closeBtn.addEventListener("click", () => {
      dismissFlash(flash);
    });
    
    // Prepend close button to the flash container
    flash.insertBefore(closeBtn, flash.firstChild);

    // Auto dismiss after 4 seconds (4000ms)
    const timeoutId = setTimeout(() => {
      dismissFlash(flash);
    }, 4000);

    // Save timeout ID to clear it if manually closed
    flash.dataset.timeoutId = timeoutId;
  });
}

function dismissFlash(flash) {
  if (flash.dataset.timeoutId) {
    clearTimeout(parseInt(flash.dataset.timeoutId));
  }
  
  // Step 1: Fade out and slide up slightly
  flash.style.opacity = "0";
  flash.style.transform = "translateY(-10px)";
  
  // Step 2: Smoothly collapse height and margins
  setTimeout(() => {
    flash.style.height = "0";
    flash.style.paddingTop = "0";
    flash.style.paddingBottom = "0";
    flash.style.marginTop = "0";
    flash.style.marginBottom = "0";
    flash.style.borderWidth = "0";
    flash.style.overflow = "hidden";
    
    // Step 3: Remove from DOM
    setTimeout(() => {
      flash.remove();
    }, 300);
  }, 500);
}
