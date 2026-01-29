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
    primary: "bg-gradient-to-br from-primary to-secondary shadow-glow",
    success: "bg-gradient-to-br from-primary to-accent shadow-turquoise-glow", 
    warning: "bg-gradient-to-br from-warning to-orange-500 shadow-lg shadow-warning/30"
  }

  const cardClasses = {
    primary: "bg-card/80 backdrop-blur-xl border-primary/20 hover:border-primary/40 hover:shadow-glow",
    success: "bg-card/80 backdrop-blur-xl border-success/20 hover:border-success/40 hover:shadow-turquoise-glow", 
    warning: "bg-card/80 backdrop-blur-xl border-warning/20 hover:border-warning/40 hover:shadow-lg hover:shadow-warning/20"
  }

  const accentLineClasses = {
    primary: "from-primary via-secondary to-primary",
    success: "from-primary via-accent to-primary",
    warning: "from-warning via-orange-400 to-warning"
  }

  const valueClasses = {
    primary: "text-primary",
    success: "text-primary",
    warning: "text-warning"
  }

  const changeClasses = {
    positive: "text-primary font-semibold",
    negative: "text-destructive font-semibold",
    neutral: "text-muted-foreground"
  }

  return (
    <Card className={`relative overflow-hidden ${cardClasses[gradient]} border transition-all duration-500 group hover:-translate-y-1`}>
      {/* Animated gradient line at top */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentLineClasses[gradient]} opacity-80`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      
      {/* Subtle mesh background */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-2xl ${iconBgClasses[gradient]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className={`text-3xl font-bold tracking-tight ${valueClasses[gradient]}`}>
          {value}
        </div>
        {change && (
          <p className={`text-sm ${changeClasses[changeType]} mt-2 flex items-center gap-1`}>
            {changeType === "positive" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            {changeType === "negative" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            {change}
          </p>
        )}
      </CardContent>
      
      {/* Decorative corner glow */}
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${accentLineClasses[gradient]} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
    </Card>
  )
}
