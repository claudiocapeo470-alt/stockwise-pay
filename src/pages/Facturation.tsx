import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileCheck, Receipt } from "lucide-react";
import Factures from "./Factures";
import Devis from "./Devis";
import Paiements from "./Paiements";

export default function Facturation() {
  const [activeTab, setActiveTab] = useState("factures");

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent">
          Facturation
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos factures, devis et paiements en un seul endroit
        </p>
      </div>

      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-muted/50 p-1">
          <TabsTrigger 
            value="factures" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Factures</span>
          </TabsTrigger>
          <TabsTrigger 
            value="devis"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Devis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="paiements"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="factures" className="mt-6">
          <Factures />
        </TabsContent>

        <TabsContent value="devis" className="mt-6">
          <Devis />
        </TabsContent>

        <TabsContent value="paiements" className="mt-6">
          <Paiements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
