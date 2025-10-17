import { memo, useEffect, useState } from "react";

interface WindmillProps {
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const Windmill = memo(({ size, x, y, duration, delay }: WindmillProps) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg
      viewBox="0 0 100 100"
      className="windmill-rotate"
      style={{ animationDuration: `${duration}s` }}
    >
      {/* Windmill pole */}
      <rect x="47" y="40" width="6" height="60" fill="hsl(var(--primary) / 0.3)" />
      <rect x="40" y="95" width="20" height="5" fill="hsl(var(--primary) / 0.4)" />
      
      {/* Windmill blades */}
      <g className="windmill-blades" style={{ transformOrigin: '50px 40px' }}>
        {/* Blade 1 */}
        <ellipse cx="50" cy="20" rx="8" ry="20" fill="hsl(var(--accent) / 0.5)" />
        {/* Blade 2 */}
        <ellipse cx="70" cy="40" rx="20" ry="8" fill="hsl(var(--accent) / 0.45)" />
        {/* Blade 3 */}
        <ellipse cx="50" cy="60" rx="8" ry="20" fill="hsl(var(--accent) / 0.4)" />
        {/* Blade 4 */}
        <ellipse cx="30" cy="40" rx="20" ry="8" fill="hsl(var(--accent) / 0.55)" />
        {/* Center circle */}
        <circle cx="50" cy="40" r="5" fill="hsl(var(--primary) / 0.6)" />
      </g>
    </svg>
  </div>
));

Windmill.displayName = "Windmill";

interface ParachuteProps {
  size: number;
  x: number;
  duration: number;
  delay: number;
}

const Parachute = memo(({ size, x, duration, delay }: ParachuteProps) => (
  <div
    className="parachute-float"
    style={{
      left: `${x}%`,
      width: `${size}px`,
      height: `${size * 1.5}px`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg viewBox="0 0 100 150" className="parachute-swing">
      {/* Parachute canopy */}
      <path
        d="M 50 20 Q 20 20 10 40 Q 10 50 20 55 L 50 70 L 80 55 Q 90 50 90 40 Q 80 20 50 20 Z"
        fill="hsl(var(--primary) / 0.4)"
      />
      <path
        d="M 50 20 Q 35 22 25 35 L 50 70 Z"
        fill="hsl(var(--accent) / 0.3)"
      />
      <path
        d="M 50 20 Q 65 22 75 35 L 50 70 Z"
        fill="hsl(var(--primary) / 0.5)"
      />
      
      {/* Parachute lines */}
      <line x1="20" y1="55" x2="45" y2="100" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
      <line x1="50" y1="70" x2="50" y2="100" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
      <line x1="80" y1="55" x2="55" y2="100" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
      
      {/* Payload */}
      <rect x="42" y="100" width="16" height="20" rx="2" fill="hsl(var(--accent) / 0.5)" />
    </svg>
  </div>
));

Parachute.displayName = "Parachute";

export const WindmillsParachutesBackground = memo(() => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Page visibility detection for performance
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Responsive element counts
  const windmillCount = isMobile ? 3 : 6;
  const parachuteCount = isMobile ? 2 : 5;

  // Generate windmills with varied properties
  const windmills = Array.from({ length: windmillCount }, (_, i) => ({
    id: i,
    size: isMobile ? 40 + i * 8 : 60 + i * 15,
    x: 5 + i * (90 / windmillCount),
    y: 10 + (i % 3) * 25,
    duration: 15 + i * 5,
    delay: i * 2,
  }));

  // Generate parachutes with varied properties
  const parachutes = Array.from({ length: parachuteCount }, (_, i) => ({
    id: i,
    size: isMobile ? 30 + i * 5 : 50 + i * 10,
    x: 10 + i * (80 / parachuteCount),
    duration: 20 + i * 8,
    delay: i * 3,
  }));

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden light-mode-only"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/30 via-blue-50/20 to-transparent" />
      
      {/* Windmills */}
      {windmills.map((windmill) => (
        <Windmill key={`windmill-${windmill.id}`} {...windmill} />
      ))}
      
      {/* Parachutes */}
      {parachutes.map((parachute) => (
        <Parachute key={`parachute-${parachute.id}`} {...parachute} />
      ))}
      
      {/* Floating clouds for depth */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
    </div>
  );
});

WindmillsParachutesBackground.displayName = "WindmillsParachutesBackground";
