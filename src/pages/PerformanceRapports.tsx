import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, ArrowLeft, ChevronRight } from "lucide-react";
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
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "rapports" as const,
    title: "Rapports",
    description: "Générez des rapports détaillés et personnalisés",
    icon: FileText,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
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
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => setActiveSection("menu")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux analytics
        </Button>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Performance & Rapports</h1>
        <p className="text-sm text-muted-foreground">Analysez vos données et générez des rapports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/30"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className={`h-12 w-12 ${section.bgColor} flex items-center justify-center`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {section.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
