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
    primary: "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700", 
    warning: "bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
  }

  const cardGradientClasses = {
    primary: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/30",
    success: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800/30", 
    warning: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800/30"
  }

  const changeClasses = {
    positive: "text-emerald-600 dark:text-emerald-400 font-medium",
    negative: "text-red-600 dark:text-red-400 font-medium",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg border-2 ${cardGradientClasses[gradient]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl shadow-md ${gradientClasses[gradient]}`}>
          <Icon className="h-5 w-5 text-white" />
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