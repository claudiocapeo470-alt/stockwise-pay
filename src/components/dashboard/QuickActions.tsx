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
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-2 border-purple-200 dark:border-purple-800/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <Plus className="h-4 w-4 text-white" />
          </div>
          Actions rapides
        </CardTitle>
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
          className="w-full mt-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800/30 hover:shadow-md transition-all"
          onClick={() => navigate("/app/rapports")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Voir tous les rapports
        </Button>
      </CardContent>
    </Card>
  )
}