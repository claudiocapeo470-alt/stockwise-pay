import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 illustration */}
        <div className="mx-auto w-32 h-32">
          <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="64" cy="64" r="56" className="fill-muted stroke-border" strokeWidth="2" />
            <text x="64" y="72" textAnchor="middle" className="fill-foreground" fontSize="36" fontWeight="bold" fontFamily="system-ui">404</text>
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page introuvable</h1>
          <p className="text-muted-foreground">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <Button onClick={() => navigate('/app')}>
            <Home className="h-4 w-4 mr-2" /> Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
