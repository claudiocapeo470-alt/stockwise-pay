import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Package, Receipt, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AddSaleDialog } from "@/components/sales/AddSaleDialog"
import { AddProductDialog } from "@/components/stocks/AddProductDialog"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"

export function QuickActions() {
  const navigate = useNavigate()

  const gradientClasses = {
    primary: "bg-gradient-primary hover:opacity-90",
    success: "bg-gradient-success hover:opacity-90",
    warning: "bg-gradient-warning hover:opacity-90"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Nouvelle vente */}
        <div className="relative">
          <AddSaleDialog />
        </div>

        {/* Ajouter produit */}
        <div className="relative">
          <AddProductDialog />
        </div>

        {/* Paiement reçu */}
        <div className="relative">
          <AddPaymentDialog />
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate("/rapports")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Voir tous les rapports
        </Button>
      </CardContent>
    </Card>
  )
}