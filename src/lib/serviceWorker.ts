const isEmbedded = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const isLovablePreview = (hostname: string) =>
  hostname.startsWith("id-preview--") ||
  hostname.startsWith("preview--") ||
  hostname === "lovableproject.com" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname === "lovableproject-dev.com" ||
  hostname.endsWith(".lovableproject-dev.com") ||
  hostname === "beta.lovable.dev" ||
  hostname.endsWith(".beta.lovable.dev");

const removeAppWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith("/sw.js"))
      .map((registration) => registration.unregister()),
  );
};

export async function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const disabled = new URLSearchParams(window.location.search).has("sw") &&
    new URLSearchParams(window.location.search).get("sw") === "off";
  const shouldRefuse = !import.meta.env.PROD || isLovablePreview(window.location.hostname) || disabled;

  if (shouldRefuse) {
    await removeAppWorker();
    return;
  }

  // A same-origin shop preview must never manage the parent page's worker.
  if (isEmbedded()) return;

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
}