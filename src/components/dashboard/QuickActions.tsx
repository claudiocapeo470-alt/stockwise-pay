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
    <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-80">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      
      {/* Mesh background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
      
      <CardHeader className="pb-4 pt-6 relative z-10">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">
            Actions rapides
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 px-6 pb-6 relative z-10">
        {/* Action buttons with modern styling */}
        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-primary [&_button]:to-secondary [&_button]:hover:from-primary/90 [&_button]:hover:to-secondary/90 [&_button]:text-primary-foreground [&_button]:shadow-md [&_button]:hover:shadow-glow [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddSaleDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-secondary [&_button]:to-accent [&_button]:hover:from-secondary/90 [&_button]:hover:to-accent/90 [&_button]:text-secondary-foreground [&_button]:shadow-md [&_button]:hover:shadow-blue-glow [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddProductDialog />
        </div>

        <div className="[&_button]:w-full [&_button]:h-14 [&_button]:bg-gradient-to-r [&_button]:from-accent [&_button]:to-secondary [&_button]:hover:from-accent/90 [&_button]:hover:to-secondary/90 [&_button]:text-accent-foreground [&_button]:shadow-md [&_button]:hover:shadow-blue-glow [&_button]:transition-all [&_button]:duration-300 [&_button]:rounded-2xl [&_button]:font-semibold [&_button]:text-base [&_button]:border-0">
          <AddPaymentDialog />
        </div>
        
        {/* Reports button */}
        <Button 
          variant="outline" 
          className="w-full h-12 bg-transparent hover:bg-primary/10 border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 rounded-2xl font-medium text-foreground group mt-2"
          onClick={() => navigate("/app/rapports")}
        >
          <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform text-primary" />
          Voir tous les rapports
          <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
        </Button>
      </CardContent>
      
      {/* Decorative glow */}
      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-primary to-secondary opacity-10 blur-3xl" />
    </Card>
  )
}
