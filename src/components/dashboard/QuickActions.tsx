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
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800/40 hover:shadow-lg transition-all duration-300">
      {/* Bordure colorée en haut */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
      
      <CardHeader className="pb-4 pt-5">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-purple-900 dark:text-purple-100">Actions rapides</span>
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
          className="w-full mt-4 bg-white dark:bg-purple-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/40 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300 h-12 rounded-xl font-medium group text-purple-900 dark:text-purple-100"
          onClick={() => navigate("/app/rapports")}
        >
          <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Voir tous les rapports
        </Button>
      </CardContent>
    </Card>
  )
}