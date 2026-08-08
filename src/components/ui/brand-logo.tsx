import lightLogo from "@/assets/stocknix-logo-light.png.asset.json";
import darkLogo from "@/assets/stocknix-logo-dark.png.asset.json";
import whiteLogo from "@/assets/stocknix-logo-white.png.asset.json";

export const stocknixLogoLight = lightLogo.url;
export const stocknixLogoDark = darkLogo.url;
export const stocknixLogoWhite = whiteLogo.url;

interface BrandLogoProps {
  /** Tailwind classes applied to the image (height, width, etc.) */
  className?: string;
  /** Force the white version (for dark/coloured backgrounds) */
  variant?: "auto" | "white";
}

/**
 * Logo Stocknix : version sombre (texte noir) en mode jour,
 * version claire (texte blanc) en mode nuit.
 */
export function BrandLogo({ className = "h-10 w-auto", variant = "auto" }: BrandLogoProps) {
  if (variant === "white") {
    return <img src={stocknixLogoWhite} alt="Stocknix" className={`object-contain ${className}`} />;
  }
  return (
    <>
      <img src={stocknixLogoLight} alt="Stocknix" className={`object-contain dark:hidden ${className}`} />
      <img src={stocknixLogoDark} alt="Stocknix" className={`object-contain hidden dark:block ${className}`} />
    </>
  );
}

export default BrandLogo;
