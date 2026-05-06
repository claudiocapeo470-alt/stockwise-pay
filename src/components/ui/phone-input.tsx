/**
 * PhoneInput — Champ téléphone international avec drapeaux + indicatifs
 * Wrappe react-phone-number-input et applique nos tokens design.
 */
import * as React from "react";
import PhoneInputBase, { type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  defaultCountry?: Country;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "CI",
  placeholder = "Numéro de téléphone",
  className,
  id,
  disabled,
}: PhoneInputProps) {
  return (
    <div
      className={cn(
        "phone-input-wrapper flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <PhoneInputBase
        id={id}
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry}
        international
        countryCallingCodeEditable={false}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 flex items-center gap-2"
      />
      <style>{`
        .phone-input-wrapper .PhoneInput { width: 100%; }
        .phone-input-wrapper .PhoneInputCountry { display: flex; align-items: center; gap: 4px; margin-right: 8px; }
        .phone-input-wrapper .PhoneInputCountryIcon { width: 24px; height: 18px; box-shadow: none; border-radius: 2px; overflow: hidden; }
        .phone-input-wrapper .PhoneInputCountryIcon--border { box-shadow: none; background: transparent; }
        .phone-input-wrapper .PhoneInputCountrySelectArrow { color: hsl(var(--muted-foreground)); opacity: 1; margin-left: 2px; }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1; min-width: 0; border: none; outline: none; background: transparent;
          color: hsl(var(--foreground)); font-size: 14px;
        }
        .phone-input-wrapper .PhoneInputInput::placeholder { color: hsl(var(--muted-foreground)); }
      `}</style>
    </div>
  );
}
