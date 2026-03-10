import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, ArrowLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Performance from "./Performance";
import Rapports from "./Rapports";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/hooks/useTeam";
import { useSearchParams } from "react-router-dom";

type ActiveSection = "menu" | "performance" | "rapports" | "employee";

export default function PerformanceRapports() {
  const [searchParams] = useSearchParams();
  const initialMember = searchParams.get('member');
  const [activeSection, setActiveSection] = useState<ActiveSection>(initialMember ? "employee" : "menu");
  const [selectedMemberId, setSelectedMemberId] = useState(initialMember || "");
  const { isEmployee } = useAuth();
  const { members } = useTeam();

  const sections = [
    { id: "performance" as const, title: "Performance", description: "Analysez vos KPIs et tendances en temps réel", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
    { id: "rapports" as const, title: "Rapports", description: "Générez des rapports détaillés et personnalisés", icon: FileText, color: "text-secondary", bgColor: "bg-secondary/10" },
    ...(!isEmployee ? [{ id: "employee" as const, title: "Par Employé", description: "Performance individuelle de chaque membre", icon: Users, color: "text-accent-foreground", bgColor: "bg-accent/10" }] : []),
  ];

  const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId), [members, selectedMemberId]);

  if (activeSection !== "menu") {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => setActiveSection("menu")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour aux analytics
        </Button>
        {activeSection === "performance" && <Performance />}
        {activeSection === "rapports" && <Rapports />}
        {activeSection === "employee" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Performance par Employé</h1>
              <p className="text-sm text-muted-foreground">Sélectionnez un membre pour voir ses statistiques</p>
            </div>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="max-w-sm"><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
              <SelectContent>
                {members.filter(m => m.is_active).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name || ''} — {m.role?.name || 'Sans rôle'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMember && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {selectedMember.first_name[0]}{(selectedMember.last_name || '')[0] || ''}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedMember.first_name} {selectedMember.last_name || ''}</p>
                      <Badge variant="secondary">{selectedMember.role?.name || 'Sans rôle'}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Les statistiques détaillées par employé seront disponibles prochainement. Cette fonctionnalité nécessite des données d'activité liées à chaque membre.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Performance & Rapports</h1>
        <p className="text-sm text-muted-foreground">Analysez vos données et générez des rapports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id} onClick={() => setActiveSection(section.id)} className="cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className={`h-12 w-12 ${section.bgColor} flex items-center justify-center rounded-xl`}><section.icon className={`h-6 w-6 ${section.color}`} /></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
