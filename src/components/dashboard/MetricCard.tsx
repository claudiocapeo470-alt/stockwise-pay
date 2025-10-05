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
    primary: "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:to-fuchsia-600 shadow-lg shadow-purple-500/50",
    success: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-500 dark:to-cyan-600 shadow-lg shadow-teal-500/50", 
    warning: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 dark:from-amber-500 dark:to-red-600 shadow-lg shadow-orange-500/50"
  }

  const cardGradientClasses = {
    primary: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-900/20 border-2 border-purple-300 dark:border-purple-700/50 shadow-xl shadow-purple-200/50 dark:shadow-purple-900/30",
    success: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-900/20 border-2 border-teal-300 dark:border-teal-700/50 shadow-xl shadow-teal-200/50 dark:shadow-teal-900/30", 
    warning: "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700/50 shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30"
  }

  const changeClasses = {
    positive: "text-emerald-600 dark:text-emerald-400 font-medium",
    negative: "text-red-600 dark:text-red-400 font-medium",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-2xl ${cardGradientClasses[gradient]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl shadow-lg ${gradientClasses[gradient]} animate-pulse`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</div>
        {change && (
          <p className={`text-xs ${changeClasses[changeType]} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}