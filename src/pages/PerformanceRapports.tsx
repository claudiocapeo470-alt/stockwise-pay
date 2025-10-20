import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText } from "lucide-react";
import Performance from "./Performance";
import Rapports from "./Rapports";

export default function PerformanceRapports() {
  const [activeTab, setActiveTab] = useState("performance");

  return (
    <div className="space-y-6">
      {/* En-tête simplifié - Description seulement */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/40 rounded-lg p-6">
        <p className="text-lg text-blue-900 dark:text-blue-100 font-medium">
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
