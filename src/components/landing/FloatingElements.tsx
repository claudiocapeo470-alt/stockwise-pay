import { motion } from "framer-motion";
import { Package, CreditCard, BarChart3, Bell, FileText, TrendingUp, Shield, Smartphone, Monitor, Cloud } from "lucide-react";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FloatingCard = ({ children, className = "", delay = 0, duration = 4 }: FloatingCardProps) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-8, 8, -8] }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FloatingIcon = ({ 
  icon: Icon, 
  className = "", 
  delay = 0,
  size = 24
}: { 
  icon: React.ElementType; 
  className?: string; 
  delay?: number;
  size?: number;
}) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={`p-3 rounded-2xl backdrop-blur-xl bg-card/60 shadow-lg ${className}`}
  >
    <Icon size={size} className="text-primary" />
  </motion.div>
);

export const GlowOrb = ({ 
  className = "", 
  color = "primary",
  size = "lg"
}: { 
  className?: string; 
  color?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
    xl: "w-96 h-96"
  };
  
  const colorClasses = {
    primary: "from-primary/20 to-primary/5",
    secondary: "from-secondary/20 to-secondary/5",
    accent: "from-accent/20 to-accent/5"
  };
  
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.5 }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`rounded-full bg-gradient-radial ${colorClasses[color]} blur-3xl ${sizeClasses[size]} ${className}`}
    />
  );
};

export const StatsCard = ({ 
  value, 
  label, 
  trend,
  icon: Icon,
  delay = 0
}: { 
  value: string; 
  label: string; 
  trend?: string;
  icon: React.ElementType;
  delay?: number;
}) => (
  <FloatingCard delay={delay} duration={4.5}>
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/20">
          <Icon size={14} className="text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={12} className="text-success" />
          <span className="text-xs text-success">{trend}</span>
        </div>
      )}
    </div>
  </FloatingCard>
);

export const DeviceMockup = ({ 
  type = "desktop",
  className = "",
  children
}: { 
  type?: "desktop" | "mobile";
  className?: string;
  children?: React.ReactNode;
}) => {
  if (type === "mobile") {
    return (
      <div className={`relative ${className}`}>
        <div className="relative w-[200px] h-[400px] bg-card/90 rounded-[32px] border-4 border-border/60 shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-background rounded-full z-10" />
          {/* Screen */}
          <div className="absolute inset-3 top-8 rounded-2xl bg-background overflow-hidden">
            {children}
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-primary via-secondary to-accent" />
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-card/90 rounded-2xl border-4 border-border/60 shadow-2xl overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-warning/70" />
            <div className="w-3 h-3 rounded-full bg-success/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 bg-background/50 rounded-full px-3 flex items-center">
              <span className="text-xs text-muted-foreground">stocknix.app</span>
            </div>
          </div>
        </div>
        {/* Screen */}
        <div className="bg-background">
          {children}
        </div>
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-br from-primary via-secondary to-accent scale-110" />
    </div>
  );
};

export const ConnectorLine = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={`absolute ${className}`}
    width="200"
    height="100"
    viewBox="0 0 200 100"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.5 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  >
    <motion.path
      d="M0 50 Q100 0 200 50"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const GridPattern = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 ${className}`}>
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                         linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}
    />
  </div>
);
