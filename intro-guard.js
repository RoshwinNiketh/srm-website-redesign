// Decides before first paint whether the landing intro will play, so the page never flashes.
try {
  if (!location.hash && !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.dataset.a11yMotion !== "off" &&
      Element.prototype.animate && sessionStorage.getItem("srm-landing-intro-v1") !== "played") {
    document.documentElement.classList.add("intro-pending");
    setTimeout(() => document.documentElement.classList.remove("intro-pending"), 20000);
  }
} catch {}
