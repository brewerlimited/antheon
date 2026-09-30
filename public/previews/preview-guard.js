/* Keep each portfolio demo local while preserving its original interactions. */
(() => {
  const page = new URL(location.href);
  const prefix = page.pathname.replace(/[^/]*$/, "");
  const slug = prefix.split("/").filter(Boolean).at(-1);
  const notify = (type) => parent.postMessage({ type, slug }, page.origin);

  for (const name of ["localStorage", "sessionStorage"]) {
    try { window[name].getItem("antheon-preview-check"); }
    catch {
      const values = new Map();
      Object.defineProperty(window, name, { value: {
        get length() { return values.size; },
        getItem: (key) => values.get(String(key)) ?? null,
        setItem: (key, value) => values.set(String(key), String(value)),
        removeItem: (key) => values.delete(String(key)),
        clear: () => values.clear(),
        key: (index) => [...values.keys()][index] ?? null,
      } });
    }
  }

  // Local galleries may fetch JSON, but demos never send enquiries or analytics.
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    const request = input instanceof Request ? input : null;
    const url = new URL(request ? request.url : String(input), location.href);
    const method = (options?.method || request?.method || "GET").toUpperCase();
    if (url.origin === page.origin && url.pathname.startsWith(prefix) && method === "GET") {
      return originalFetch(input, { ...options, credentials: "omit" });
    }
    return Promise.reject(new TypeError("Requests outside the design preview are disabled."));
  };
  window.open = () => null;

  const blockOutgoingLink = (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!anchor) return;
    const raw = anchor.getAttribute("href") || "";
    if (raw.startsWith("#")) return;
    const url = new URL(raw, location.href);
    const sameDocument = url.origin === page.origin && (url.pathname === page.pathname || url.pathname === "/" || url.pathname === prefix);
    if (sameDocument && url.hash) {
      anchor.setAttribute("href", url.hash);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    if (sameDocument) window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    else notify("antheon-preview-link-blocked");
  };
  document.addEventListener("click", blockOutgoingLink, true);
  document.addEventListener("auxclick", blockOutgoingLink, true);
  document.addEventListener("submit", (event) => event.preventDefault(), true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") notify("antheon-preview-escape");
  });
  window.addEventListener("load", () => notify("antheon-preview-ready"), { once: true });
})();
