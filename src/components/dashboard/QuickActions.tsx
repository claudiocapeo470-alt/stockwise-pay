import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Package, Receipt, FileText, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AddSaleDialog } from "@/components/sales/AddSaleDialog"
import { AddProductDialog } from "@/components/stocks/AddProductDialog"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-purple-100 dark:border-purple-900/40 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Bordure colorée en haut */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600"></div>
      
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Actions rapides
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 px-6 pb-6">
        {/* Styles personnalisés pour les boutons des dialogs */}
        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-blue-500 [&_button]:to-blue-600 [&_button]:hover:from-blue-600 [&_button]:hover:to-blue-700 [&_button]:text-white [&_button]:shadow-md [&_button]:hover:shadow-lg [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddSaleDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-blue-500 [&_button]:to-blue-600 [&_button]:hover:from-blue-600 [&_button]:hover:to-blue-700 [&_button]:text-white [&_button]:shadow-md [&_button]:hover:shadow-lg [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddProductDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-blue-500 [&_button]:to-blue-600 [&_button]:hover:from-blue-600 [&_button]:hover:to-blue-700 [&_button]:text-white [&_button]:shadow-md [&_button]:hover:shadow-lg [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddPaymentDialog />
        </div>
        
        {/* Voir rapports */}
        <Button 
          variant="outline" 
          className="w-full h-12 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 rounded-2xl font-medium text-purple-700 dark:text-purple-300 group mt-2"
          onClick={() => navigate("/app/rapports")}
        >
          <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Voir tous les rapports
        </Button>
      </CardContent>
    </Card>
  )
}