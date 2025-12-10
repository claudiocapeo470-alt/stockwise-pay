import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileCheck, Receipt, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Factures from "./Factures";
import Devis from "./Devis";
import Paiements from "./Paiements";

type ActiveSection = "menu" | "paiements" | "factures" | "devis";

const sections = [
  {
    id: "paiements" as const,
    title: "Paiements",
    description: "Gérez et suivez tous vos paiements",
    icon: Receipt,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20",
    borderColor: "border-green-200 dark:border-green-800/40",
  },
  {
    id: "factures" as const,
    title: "Factures",
    description: "Créez et gérez vos factures clients",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-900/20",
    borderColor: "border-blue-200 dark:border-blue-800/40",
  },
  {
    id: "devis" as const,
    title: "Devis",
    description: "Établissez des devis professionnels",
    icon: FileCheck,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-violet-100/50 dark:from-purple-950/30 dark:to-violet-900/20",
    borderColor: "border-purple-200 dark:border-purple-800/40",
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
        {/* Bouton retour */}
        <Button
          variant="ghost"
          onClick={() => setActiveSection("menu")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {/* Contenu de la section */}
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-muted-foreground">
        Gérez vos factures, devis et paiements en un seul endroit
      </p>

      {/* Cartes de navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative overflow-hidden cursor-pointer group ${section.bgColor} border-2 ${section.borderColor} hover:shadow-lg transition-all duration-200`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${section.color}`}></div>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${section.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
