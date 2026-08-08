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
    <div className="flex flex-col items-center gap-3 w-full max-w-[16rem] sm:max-w-xs mx-auto">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      
      {/* PIN dots */}
      <div className="flex gap-2 sm:gap-3 mb-1">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-150 ${
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            disabled={isLoading}
            onClick={() => handleKey(key)}
            className={`
              h-12 sm:h-14 rounded-2xl sm:rounded-[1.25rem] font-semibold text-lg sm:text-xl transition-all duration-150
              active:scale-95 select-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${key === "clear"
                ? "text-sm sm:text-base text-destructive bg-destructive/10 hover:bg-destructive/15 border border-transparent"
                : key === "delete"
                ? "bg-muted/70 hover:bg-muted flex items-center justify-center text-foreground border border-transparent"
                : "bg-muted/50 text-foreground border border-transparent hover:bg-muted active:bg-muted"
              }
            `}
          >
            {key === "delete" ? (
              <Delete className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" />
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
