import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Package, Receipt, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

const actions = [
  {
    title: "Nouvelle vente",
    description: "Enregistrer une vente",
    icon: Plus,
    gradient: "primary",
    href: "/ventes/nouvelle"
  },
  {
    title: "Ajouter produit",
    description: "Ajouter au stock",
    icon: Package,
    gradient: "success",
    href: "/stocks/nouveau"
  },
  {
    title: "Paiement reçu", 
    description: "Marquer comme payé",
    icon: Receipt,
    gradient: "warning",
    href: "/paiements/nouveau"
  }
]

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
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.title}
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-accent"
              onClick={() => navigate(action.href)}
            >
              <div className={`p-2 rounded-lg mr-3 ${gradientClasses[action.gradient as keyof typeof gradientClasses]}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          )
        })}
        
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