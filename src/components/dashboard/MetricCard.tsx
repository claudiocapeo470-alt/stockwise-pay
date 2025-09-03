import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  gradient?: "primary" | "success" | "warning"
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  gradient = "primary"
}: MetricCardProps) {
  const gradientClasses = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success", 
    warning: "bg-gradient-warning"
  }

  const changeClasses = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${gradientClasses[gradient]}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs ${changeClasses[changeType]} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}