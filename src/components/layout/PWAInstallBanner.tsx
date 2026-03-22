import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa_banner_dismissed')) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // iOS detection
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);
    if (isiOS) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') dismiss();
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Installer Stocknix</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground">
              Appuyez sur <Share className="h-3 w-3 inline" /> puis "Sur l'écran d'accueil"
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Accédez à votre gestion sans navigateur</p>
          )}
        </div>
        {!isIOS && (
          <Button size="sm" onClick={handleInstall} className="flex-shrink-0">
            Installer
          </Button>
        )}
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
