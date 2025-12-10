import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Performance from "./Performance";
import Rapports from "./Rapports";

type ActiveSection = "menu" | "performance" | "rapports";

const sections = [
  {
    id: "performance" as const,
    title: "Performance",
    description: "Analysez vos indicateurs clés et tendances",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-900/20",
    borderColor: "border-blue-200 dark:border-blue-800/40",
  },
  {
    id: "rapports" as const,
    title: "Rapports",
    description: "Générez des rapports détaillés",
    icon: FileText,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-100/50 dark:from-indigo-950/30 dark:to-purple-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800/40",
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
        Analysez vos performances et générez des rapports détaillés
      </p>

      {/* Cartes de navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
