import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

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
  const gradientStyles = {
    primary: {
      iconBg: "bg-gradient-to-br from-primary to-accent",
      borderAccent: "border-l-primary",
      textColor: "text-primary",
    },
    success: {
      iconBg: "bg-gradient-to-br from-success to-emerald-600",
      borderAccent: "border-l-success",
      textColor: "text-success",
    },
    warning: {
      iconBg: "bg-gradient-to-br from-warning to-orange-600",
      borderAccent: "border-l-warning",
      textColor: "text-warning",
    }
  }

  const changeClasses = {
    positive: "text-success bg-success/10",
    negative: "text-destructive bg-destructive/10",
    neutral: "text-muted-foreground bg-muted/50"
  }

  const style = gradientStyles[gradient]

  return (
    <Card className={`
      relative overflow-hidden group 
      bg-card border-2 border-border/60
      border-l-4 ${style.borderAccent}
      hover:shadow-xl hover:shadow-primary/5
      hover:-translate-y-1
      transition-all duration-300
    `}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
        <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`
          p-2.5 rounded-xl ${style.iconBg} 
          shadow-lg shadow-primary/10
          group-hover:scale-110 group-hover:rotate-3
          transition-all duration-300
        `}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`text-2xl sm:text-3xl font-black text-foreground mb-3`}>
          {value}
        </div>
        {change && (
          <div className={`
            inline-flex items-center gap-1.5 
            text-xs sm:text-sm font-medium 
            px-2.5 py-1 rounded-full
            ${changeClasses[changeType]}
          `}>
            {changeType === "positive" && <TrendingUp className="w-3.5 h-3.5" />}
            {changeType === "negative" && <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
