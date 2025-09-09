import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: "fade" | "slide" | "scale" | "rotate" | "parallax";
  direction?: "up" | "down" | "left" | "right";
  intensity?: number;
}

export const AnimatedElement = ({
  children,
  className = "",
  delay = 0,
  duration = 800,
  type = "fade",
  direction = "up",
  intensity = 1,
}: AnimatedElementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setMousePos({
        x: (e.clientX - centerX) / rect.width,
        y: (e.clientY - centerY) / rect.height,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const getTransform = () => {
    if (!ref.current) return "";
    
    const rect = ref.current.getBoundingClientRect();
    const elementTop = rect.top;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Parallax effect based on scroll position
    const scrollProgress = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
    const parallaxY = type === "parallax" ? (scrollY * intensity * 0.1) : 0;
    
    // Mouse interaction effect
    const mouseX = mousePos.x * intensity * 2;
    const mouseY = mousePos.y * intensity * 2;

    if (!isVisible) {
      switch (type) {
        case "fade":
          return "translateY(30px) scale(0.95)";
        case "slide":
          const slideDistance = 50 * intensity;
          return direction === "up" ? `translateY(${slideDistance}px)` :
                 direction === "down" ? `translateY(-${slideDistance}px)` :
                 direction === "left" ? `translateX(${slideDistance}px)` :
                 `translateX(-${slideDistance}px)`;
        case "scale":
          return "scale(0.8) rotateY(-10deg)";
        case "rotate":
          return "rotateX(-15deg) rotateY(15deg) scale(0.9)";
        case "parallax":
          return `translateY(${parallaxY}px)`;
        default:
          return "";
      }
    }

    return `translateY(${parallaxY}px) translateX(${mouseX}px) translateY(${mouseY}px)`;
  };

  const getTransitionStyle = () => ({
    transform: getTransform(),
    opacity: isVisible ? 1 : 0,
    filter: `blur(${isVisible ? 0 : 4}px)`,
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transitionDelay: `${delay}ms`,
  });

  return (
    <div
      ref={ref}
      className={cn("transform-gpu will-change-transform", className)}
      style={getTransitionStyle()}
    >
      {children}
    </div>
  );
};

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 100,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <AnimatedElement key={index} delay={index * staggerDelay}>
              {child}
            </AnimatedElement>
          ))
        : children}
    </div>
  );
};

export const FloatingElement = ({
  children,
  className = "",
  amplitude = 10,
  speed = 3,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  speed?: number;
  delay?: number;
}) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay * 1000;
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newOffset = Math.sin(elapsed * speed) * amplitude;
      setOffset(newOffset);
      requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(() => {
      animate();
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [amplitude, speed, delay]);

  return (
    <div
      className={cn("transition-transform duration-300 ease-out", className)}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const MagneticElement = ({
  children,
  className = "",
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-300 ease-out cursor-pointer", className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${isHovered ? 1.05 : 1})`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};