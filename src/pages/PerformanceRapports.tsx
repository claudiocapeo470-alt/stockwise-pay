import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, ArrowLeft, BarChart3, PieChart, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Performance from "./Performance";
import Rapports from "./Rapports";

type ActiveSection = "menu" | "performance" | "rapports";

const sections = [
  {
    id: "performance" as const,
    title: "Performance",
    description: "Analysez vos KPIs et tendances en temps réel",
    icon: TrendingUp,
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
    borderAccent: "border-l-blue-500",
    hoverBorder: "hover:border-blue-400/50",
    stat: "Temps réel",
    statIcon: Clock,
    features: ["Graphiques interactifs", "Comparaisons périodes", "Export données"],
  },
  {
    id: "rapports" as const,
    title: "Rapports",
    description: "Générez des rapports détaillés et personnalisés",
    icon: FileText,
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    borderAccent: "border-l-indigo-500",
    hoverBorder: "hover:border-indigo-400/50",
    stat: "Multi-formats",
    statIcon: Download,
    features: ["PDF & Excel", "Rapports automatiques", "Historique complet"],
  },
];

export default function PerformanceRapports() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("menu");

  const renderContent = () => {
    switch (activeSection) {
      case "performance":
        return <Performance />;
      case "rapports":
        return <Rapports />;
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
          <span className="font-medium">Retour aux analytics</span>
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
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Performance & Rapports
          </h1>
        </div>
        <p className="text-muted-foreground text-base">
          Analysez vos performances et générez des rapports professionnels
        </p>
      </div>

      {/* Cartes de navigation - Design 2026 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              relative overflow-hidden cursor-pointer group 
              bg-card
              border-2 border-border/60 ${section.hoverBorder}
              border-l-4 ${section.borderAccent}
              hover:shadow-xl hover:shadow-primary/5
              transition-all duration-300 
              hover:-translate-y-1
            `}
          >
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500" />
            
            {/* Pattern décoratif */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="p-8 relative">
              <div className="flex flex-col gap-6">
                {/* Header avec icône */}
                <div className="flex items-start justify-between">
                  <div className={`
                    w-16 h-16 rounded-2xl ${section.iconBg} 
                    flex items-center justify-center 
                    shadow-lg shadow-primary/10
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                  `}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Badge stat */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                    <section.statIcon className="h-3.5 w-3.5" />
                    <span>{section.stat}</span>
                  </div>
                </div>
                
                {/* Contenu texte */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
                
                {/* Liste des fonctionnalités */}
                <div className="flex flex-wrap gap-2">
                  {section.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-muted/30 text-xs font-medium text-muted-foreground border border-border/40"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Flèche indicateur */}
              <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <ArrowLeft className="h-5 w-5 text-primary rotate-180" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
