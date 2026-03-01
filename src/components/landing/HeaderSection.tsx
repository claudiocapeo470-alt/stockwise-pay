import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import stocknixLogo from '@/assets/stocknix-logo.png';

const HeaderSection = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.remove('dark', 'light');
    root.classList.add(isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const navLinks = [
    { label: "Fonctionnalités", href: "/fonctionnalites" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div
        className={`transition-all duration-500 ease-in-out mx-auto ${
          scrolled
            ? 'mt-3 max-w-5xl bg-background/70 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl shadow-black/20'
            : 'mt-0 max-w-full bg-transparent border border-transparent rounded-none'
        }`}
      >
        <div className="px-4 sm:px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-14' : 'h-16 sm:h-20'}`}>
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={stocknixLogo} alt="Stocknix" className={`w-auto transition-all duration-300 ${scrolled ? 'h-7 sm:h-8' : 'h-9 sm:h-10'}`} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Changer le thème"
              >
                <Sun className="h-4 w-4 hidden dark:block" />
                <Moon className="h-4 w-4 block dark:hidden" />
              </button>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="font-medium"
              >
                Connexion
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-semibold shadow-lg shadow-primary/20"
              >
                Essai Gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Right */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Changer le thème"
              >
                <Sun className="h-5 w-5 hidden dark:block" />
                <Moon className="h-5 w-5 block dark:hidden" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mx-4 mt-2 bg-background/90 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-4">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 mt-2 border-t border-border/40 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                    className="w-full"
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    Essai Gratuit
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HeaderSection;
