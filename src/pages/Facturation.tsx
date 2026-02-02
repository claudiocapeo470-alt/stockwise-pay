import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileCheck, Receipt, ArrowLeft, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Factures from "./Factures";
import Devis from "./Devis";
import Paiements from "./Paiements";

type ActiveSection = "menu" | "paiements" | "factures" | "devis";

const sections = [
  {
    id: "paiements" as const,
    title: "Paiements",
    description: "Gérez et suivez tous vos paiements clients",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-card",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderAccent: "border-l-emerald-500",
    hoverBorder: "hover:border-emerald-400/50",
    stat: "Temps réel",
    statIcon: Clock,
  },
  {
    id: "factures" as const,
    title: "Factures",
    description: "Créez et gérez vos factures professionnelles",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-card",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    borderAccent: "border-l-blue-500",
    hoverBorder: "hover:border-blue-400/50",
    stat: "Export PDF",
    statIcon: FileText,
  },
  {
    id: "devis" as const,
    title: "Devis",
    description: "Établissez des devis personnalisés",
    icon: FileCheck,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-card",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    borderAccent: "border-l-violet-500",
    hoverBorder: "hover:border-violet-400/50",
    stat: "Conversion facile",
    statIcon: TrendingUp,
  },
];

export default function Facturation() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("menu");

  const renderContent = () => {
    switch (activeSection) {
      case "paiements":
        return <Paiements />;
      case "factures":
        return <Factures />;
      case "devis":
        return <Devis />;
      default:
        return null;
    }
  };

  if (activeSection !== "menu") {
    return (
      <div className="space-y-6">
        {/* Bouton retour amélioré */}
        <Button
          variant="ghost"
          onClick={() => setActiveSection("menu")}
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Retour à la facturation</span>
        </Button>

        {/* Contenu de la section */}
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec titre stylisé */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Facturation
        </h1>
        <p className="text-muted-foreground text-base">
          Gérez vos factures, devis et paiements en toute simplicité
        </p>
      </div>

      {/* Cartes de navigation - Design 2026 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              relative overflow-hidden cursor-pointer group 
              ${section.bgColor} 
              border-2 border-border/60 ${section.hoverBorder}
              border-l-4 ${section.borderAccent}
              hover:shadow-xl hover:shadow-primary/5
              transition-all duration-300 
              hover:-translate-y-1
            `}
          >
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500" />
            
            <CardContent className="p-6 relative">
              <div className="flex flex-col gap-5">
                {/* Icône avec gradient */}
                <div className={`
                  w-14 h-14 rounded-2xl ${section.iconBg} 
                  flex items-center justify-center 
                  shadow-lg shadow-primary/10
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-300
                `}>
                  <section.icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Contenu texte */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
                
                {/* Badge info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <section.statIcon className="h-3.5 w-3.5" />
                  <span className="font-medium">{section.stat}</span>
                </div>
              </div>
              
              {/* Flèche indicateur */}
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <ArrowLeft className="h-4 w-4 text-foreground rotate-180" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
