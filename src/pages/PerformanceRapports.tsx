import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText } from "lucide-react";
import Performance from "./Performance";
import Rapports from "./Rapports";

export default function PerformanceRapports() {
  const [activeTab, setActiveTab] = useState("performance");

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent">
          Performance & Rapports
        </h1>
        <p className="text-muted-foreground mt-1">
          Analysez vos performances et générez des rapports détaillés
        </p>
      </div>

      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid bg-muted/50 p-1">
          <TabsTrigger 
            value="performance" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rapports"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Rapports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <Performance />
        </TabsContent>

        <TabsContent value="rapports" className="mt-6">
          <Rapports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
