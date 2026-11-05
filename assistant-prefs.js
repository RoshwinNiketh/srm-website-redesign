// Applies saved display settings before the page paints, so nothing flashes.
(function () {
  try {
    var prefs = JSON.parse(localStorage.getItem("srm-a11y") || "{}");
    var root = document.documentElement;
    if (prefs.text) root.dataset.a11yText = prefs.text;
    if (prefs.contrast) root.dataset.a11yContrast = "on";
    if (prefs.links) root.dataset.a11yLinks = "on";
    if (prefs.motion) {
      root.dataset.a11yMotion = "off";
      sessionStorage.setItem("srm-landing-intro-v1", "played");
    }
  } catch (error) {}
})();
