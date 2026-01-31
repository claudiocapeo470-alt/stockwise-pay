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
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success", 
    warning: "bg-warning/10 text-warning"
  }

  const accentClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning"
  }

  const valueClasses = {
    primary: "text-foreground",
    success: "text-foreground",
    warning: "text-foreground"
  }

  const changeClasses = {
    positive: "text-success font-medium",
    negative: "text-destructive font-medium",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className="relative overflow-hidden group card-hover">
      {/* Accent line at top */}
      <div className={`absolute top-0 left-0 w-full h-0.5 ${accentClasses[gradient]}`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-lg ${iconBgClasses[gradient]} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`text-2xl font-bold tracking-tight ${valueClasses[gradient]}`}>
          {value}
        </div>
        {change && (
          <p className={`text-xs ${changeClasses[changeType]} mt-1.5 flex items-center gap-1`}>
            {changeType === "positive" && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            )}
            {changeType === "negative" && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            )}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
