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

export type AppUpdateResult = "updated" | "current" | "unsupported";

export async function updateAppToLatest(): Promise<AppUpdateResult> {
  if (!("serviceWorker" in navigator)) return "unsupported";

  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return "current";

  await registration.update();
  const worker = registration.waiting || registration.installing;
  if (!worker) return "current";

  if (worker.state !== "activated") {
    worker.postMessage({ type: "SKIP_WAITING" });
    await new Promise<void>((resolve) => {
      const finish = () => resolve();
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") finish();
      });
      window.setTimeout(finish, 4000);
    });
  }

  window.location.replace(window.location.href);
  return "updated";
}

export async function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const disabled = new URLSearchParams(window.location.search).has("sw") &&
    new URLSearchParams(window.location.search).get("sw") === "off";
  const shouldRefuse = !import.meta.env.PROD || isLovablePreview(window.location.hostname) || disabled;

  if (shouldRefuse) {
    await removeAppWorker();
    return;
  }

  // An embedded page must never touch the top-level application's worker.
  if (isEmbedded()) return;

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
}