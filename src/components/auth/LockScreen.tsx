import { useState } from "react";
import { Lock } from "lucide-react";
import { PinKeypad } from "./PinKeypad";

interface LockScreenProps {
  memberName: string;
  companyName?: string;
  companyLogo?: string;
  onUnlock: (pin: string) => Promise<boolean>;
}

export function LockScreen({ memberName, companyName, companyLogo, onUnlock }: LockScreenProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePin = async (pin: string) => {
    setIsLoading(true);
    setError("");
    try {
      const success = await onUnlock(pin);
      if (!success) {
        setError("PIN incorrect");
      }
    } catch {
      setError("Erreur de vérification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Company logo or lock icon */}
        {companyLogo ? (
          <img src={companyLogo} alt={companyName} className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        )}

        {companyName && (
          <p className="text-sm text-muted-foreground">{companyName}</p>
        )}

        <div className="text-center">
          <h2 className="text-xl font-bold">Session verrouillée</h2>
          <p className="text-muted-foreground mt-1">{memberName}</p>
        </div>

        <PinKeypad
          onComplete={handlePin}
          label="Entrez votre PIN pour déverrouiller"
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
