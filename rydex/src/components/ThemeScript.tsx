"use client";

export default function ThemeScript() {
  // Runs on client only; used when inserted before content to avoid theme flash.
  // Kept as a component so Next can inline it safely.
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  try {
    var key = "rydex-theme";
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();`,
      }}
    />
  );
}

