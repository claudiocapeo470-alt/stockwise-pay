import { useEffect, useRef, useState } from "react";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export const ScrollReveal = ({ children, className = "", delay = 0, threshold = 0.1 }: ScrollAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const ParallaxElement = ({ 
  children, 
  className = "", 
  speed = 0.5, 
  direction = "up" 
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
}) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = scrolled * speed;
      
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  const getTransform = () => {
    switch (direction) {
      case "up":
        return `translateY(-${offset}px)`;
      case "down":
        return `translateY(${offset}px)`;
      case "left":
        return `translateX(-${offset}px)`;
      case "right":
        return `translateX(${offset}px)`;
      default:
        return `translateY(-${offset}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: getTransform() }}
    >
      {children}
    </div>
  );
};

export const MorphingBlob = ({ 
  className = "", 
  size = 200, 
  colors = ["var(--primary)", "var(--accent)"],
  speed = "20s"
}: {
  className?: string;
  size?: number;
  colors?: string[];
  speed?: string;
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!blobRef.current) return;
      
      const rect = blobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      setMousePos({ x: deltaX * 50, y: deltaY * 50 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={blobRef}
      className={`morphing-shape interactive-blob scroll-morph ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(ellipse at ${50 + mousePos.x}% ${50 + mousePos.y}%, 
          hsl(${colors[0]} / 0.6), 
          hsl(${colors[1]} / 0.3), 
          transparent)`,
        transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
        animation: `morphing-pulse ${speed} ease-in-out infinite`,
        filter: `blur(${40 + Math.abs(mousePos.x + mousePos.y) * 0.5}px)`,
      }}
    />
  );
};

export const InteractiveParticles = ({ 
  count = 20, 
  className = "" 
}: {
  count?: number;
  className?: string;
}) => {
  const [particles] = useState(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 10 + Math.random() * 10,
    }))
  );

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-particle absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `translateY(${scrollY * -0.1 * (1 + particle.id * 0.05)}px)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            background: `radial-gradient(circle, hsl(var(--${particle.id % 2 === 0 ? 'primary' : 'accent'}) / 0.${4 + particle.id % 3}), transparent)`,
          }}
        />
      ))}
    </div>
  );
};