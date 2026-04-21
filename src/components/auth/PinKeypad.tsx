import { useState, useCallback } from "react";
import { Delete } from "lucide-react";

interface PinKeypadProps {
  length?: number;
  onComplete: (pin: string) => void;
  label?: string;
  isLoading?: boolean;
  error?: string;
}

export function PinKeypad({ length = 6, onComplete, label = "Code PIN", isLoading = false, error }: PinKeypadProps) {
  const [pin, setPin] = useState("");

  const handleKey = useCallback((key: string) => {
    if (isLoading) return;
    
    if (key === "delete") {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    
    if (key === "clear") {
      setPin("");
      return;
    }

    setPin(prev => {
      const newPin = prev + key;
      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 100);
      }
      if (newPin.length > length) return prev;
      return newPin;
    });
  }, [length, onComplete, isLoading]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      
      {/* PIN dots */}
      <div className="flex gap-3 mb-2">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? "bg-primary border-primary scale-110"
                : "border-muted-foreground/30 bg-transparent"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            disabled={isLoading}
            onClick={() => handleKey(key)}
            className={`
              h-16 rounded-2xl font-semibold text-xl transition-all duration-150
              active:scale-95 select-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${key === "clear"
                ? "text-base text-destructive bg-destructive/10 hover:bg-destructive/15 border border-destructive/20"
                : key === "delete"
                ? "bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground border border-border/60"
                : "bg-card text-foreground border border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 hover:bg-primary/5"
              }
            `}
          >
            {key === "delete" ? (
              <Delete className="h-6 w-6 mx-auto" />
            ) : key === "clear" ? (
              "C"
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          Vérification...
        </div>
      )}
    </div>
  );
}
