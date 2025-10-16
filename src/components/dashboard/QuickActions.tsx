import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Package, Receipt, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AddSaleDialog } from "@/components/sales/AddSaleDialog"
import { AddProductDialog } from "@/components/stocks/AddProductDialog"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary shadow-md">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">Actions rapides</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Nouvelle vente */}
        <div className="relative group">
          <AddSaleDialog />
        </div>

        {/* Ajouter produit */}
        <div className="relative group">
          <AddProductDialog />
        </div>

        {/* Paiement reçu */}
        <div className="relative group">
          <AddPaymentDialog />
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 bg-background hover:bg-accent border-2 hover:border-primary/50 hover:shadow-md transition-all duration-300 h-12 rounded-xl font-medium group"
          onClick={() => navigate("/app/rapports")}
        >
          <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Voir tous les rapports
        </Button>
      </CardContent>
    </Card>
  )
}