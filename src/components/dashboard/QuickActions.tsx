import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Zap, ArrowRight, Plus, ShoppingCart, Package, Receipt } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AddSaleDialog } from "@/components/sales/AddSaleDialog"
import { AddProductDialog } from "@/components/stocks/AddProductDialog"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Bordure lumineuse */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
      
      {/* Effet de brillance */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Actions rapides
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 relative">
        {/* Bouton Nouvelle Vente */}
        <div className="group">
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:border-primary/50 hover:from-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="[&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-0 [&_button]:shadow-none [&_button]:hover:bg-transparent [&_button]:text-foreground [&_button]:font-semibold [&_button]:py-6 [&_button]:px-4">
              <AddSaleDialog />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        {/* Bouton Nouveau Produit */}
        <div className="group">
          <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent hover:border-accent/50 hover:from-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="[&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-0 [&_button]:shadow-none [&_button]:hover:bg-transparent [&_button]:text-foreground [&_button]:font-semibold [&_button]:py-6 [&_button]:px-4">
              <AddProductDialog />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
              <Package className="h-4 w-4 text-accent" />
            </div>
          </div>
        </div>

        {/* Bouton Nouveau Paiement */}
        <div className="group">
          <div className="relative overflow-hidden rounded-xl border-2 border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent hover:border-success/50 hover:from-success/20 transition-all duration-300 hover:shadow-lg hover:shadow-success/20">
            <div className="absolute inset-0 bg-gradient-to-r from-success/0 via-success/5 to-success/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="[&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-0 [&_button]:shadow-none [&_button]:hover:bg-transparent [&_button]:text-foreground [&_button]:font-semibold [&_button]:py-6 [&_button]:px-4">
              <AddPaymentDialog />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-success/20 group-hover:bg-success/30 transition-colors">
              <Receipt className="h-4 w-4 text-success" />
            </div>
          </div>
        </div>
        
        {/* Bouton Rapports */}
        <Button 
          variant="outline" 
          className="w-full justify-between group mt-2 py-6 border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          onClick={() => navigate("/app/rapports")}
        >
          <span className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-semibold">Voir les rapports</span>
          </span>
          <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </CardContent>
    </Card>
  )
}
