import { Link } from "react-router-dom";
import stocknixLogo from '@/assets/stocknix-logo.png';

const FooterSection = () => {
  return (
    <footer className="relative py-16 bg-card/50 border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={stocknixLogo} alt="Stocknix" className="h-10" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              La solution complète de gestion commerciale pour les PME et TPE en Côte d'Ivoire.
            </p>
            <div className="flex gap-4">
              {["facebook", "twitter", "linkedin", "instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full glass-strong border border-border/40 flex items-center justify-center hover:border-primary/40 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-muted-foreground/50 rounded" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-3">
              {[
                { label: "Fonctionnalités", href: "/fonctionnalites" },
                { label: "Tarifs", href: "/tarifs" },
                { label: "FAQ", href: "/faq" },
                { label: "Mises à jour", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {[
                { label: "À propos", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Carrières", href: "#" },
                { label: "Contact", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-3">
              {[
                { label: "Mentions légales", href: "/legal" },
                { label: "CGU", href: "#" },
                { label: "Politique de confidentialité", href: "#" },
                { label: "Cookies", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Stocknix par DESCHNIX. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🇨🇮</span>
            <span>Fait avec ❤️ en Côte d'Ivoire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
