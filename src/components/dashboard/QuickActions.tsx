import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Zap, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AddSaleDialog } from "@/components/sales/AddSaleDialog"
import { AddProductDialog } from "@/components/stocks/AddProductDialog"
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog"

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="[&_button]:w-full [&_button]:justify-start">
          <AddSaleDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:justify-start">
          <AddProductDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:justify-start">
          <AddPaymentDialog />
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-between group mt-1"
          onClick={() => navigate("/app/rapports")}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Voir les rapports
          </span>
          <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>
      </CardContent>
    </Card>
  )
}
