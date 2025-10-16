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
  const iconBgClasses = {
    primary: "bg-blue-500",
    success: "bg-emerald-500", 
    warning: "bg-amber-500"
  }

  const cardGradientClasses = {
    primary: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
    success: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20", 
    warning: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20"
  }

  const borderClasses = {
    primary: "border-blue-200 dark:border-blue-800/40",
    success: "border-emerald-200 dark:border-emerald-800/40",
    warning: "border-amber-200 dark:border-amber-800/40"
  }

  const topBorderClasses = {
    primary: "from-blue-500 to-blue-600",
    success: "from-emerald-500 to-emerald-600",
    warning: "from-amber-500 to-amber-600"
  }

  const textClasses = {
    primary: "text-blue-900 dark:text-blue-100",
    success: "text-emerald-900 dark:text-emerald-100",
    warning: "text-amber-900 dark:text-amber-100"
  }

  const valueClasses = {
    primary: "text-blue-600 dark:text-blue-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400"
  }

  const changeClasses = {
    positive: "text-green-600 dark:text-green-400 font-medium",
    negative: "text-red-600 dark:text-red-400 font-medium",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${cardGradientClasses[gradient]} border-2 ${borderClasses[gradient]} hover:shadow-lg transition-all duration-300 group`}>
      {/* Bordure colorée en haut */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${topBorderClasses[gradient]}`}></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className={`text-sm font-medium ${textClasses[gradient]}`}>
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-lg shadow-md ${iconBgClasses[gradient]} group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClasses[gradient]}`}>{value}</div>
        {change && (
          <p className={`text-xs ${changeClasses[changeType]} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}