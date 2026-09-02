import { useState, useEffect } from 'react';
import { X, Download, Share, Plus, MoreVertical, Smartphone, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function Step({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
        {index}
      </span>
      <span className="text-sm leading-snug text-foreground">{children}</span>
    </li>
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
      return;
    }
    setShowGuide(true);
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="w-full text-left bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">Installer Stocknix</p>
            <p className="text-xs text-muted-foreground">
              {isIOS ? "Voir comment l'ajouter à l'écran d'accueil" : 'Accédez à votre gestion sans navigateur'}
            </p>
          </div>
          {!isIOS && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleInstall(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleInstall(); } }}
              className="flex-shrink-0 inline-flex h-9 items-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              Installer
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            aria-label="Fermer"
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); dismiss(); } }}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </span>
        </button>
      </div>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-primary" /> Installer Stocknix
            </DialogTitle>
            <DialogDescription className="text-sm">
              Ajoutez l'application à votre écran d'accueil pour l'ouvrir comme une vraie app, sans navigateur.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section className="rounded-2xl border border-border/60 p-3.5">
              <p className="mb-2.5 text-[13px] font-bold">Sur iPhone / iPad (Safari)</p>
              <ol className="space-y-2.5">
                <Step index={1}>
                  Appuyez sur l'icône <Share className="inline h-3.5 w-3.5 align-[-2px]" /> <b>Partager</b> en bas de Safari.
                </Step>
                <Step index={2}>
                  Faites défiler puis choisissez <b>« Sur l'écran d'accueil »</b> <Plus className="inline h-3.5 w-3.5 align-[-2px]" />.
                </Step>
                <Step index={3}>Appuyez sur <b>Ajouter</b> : l'icône Stocknix apparaît sur votre écran.</Step>
              </ol>
            </section>

            <section className="rounded-2xl border border-border/60 p-3.5">
              <p className="mb-2.5 text-[13px] font-bold">Sur Android (Chrome)</p>
              <ol className="space-y-2.5">
                <Step index={1}>
                  Ouvrez le menu <MoreVertical className="inline h-3.5 w-3.5 align-[-2px]" /> en haut à droite de Chrome.
                </Step>
                <Step index={2}>
                  Choisissez <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b> <Chrome className="inline h-3.5 w-3.5 align-[-2px]" />.
                </Step>
                <Step index={3}>Confirmez avec <b>Installer</b>.</Step>
              </ol>
            </section>

            {!isIOS && deferredPrompt && (
              <Button className="w-full h-11 rounded-xl" onClick={() => { setShowGuide(false); handleInstall(); }}>
                Installer maintenant
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
