import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";

// Performance detection
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return reduced;
};

// Device detection
const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    setCapabilities({ isLowEnd, isMobile, isTablet });
  }, []);

  return capabilities;
};

// ========== PARALLAX DEPTH SCROLL 3D ==========
interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  depth?: "foreground" | "midground" | "background";
  intensity?: number;
}

export const ParallaxContainer = ({
  children,
  className = "",
  depth = "midground",
  intensity = 1,
}: ParallaxContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isMobile, isLowEnd } = useDeviceCapabilities();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const depthMultipliers = {
    foreground: 0.3,
    midground: 0.15,
    background: 0.05,
  };

  const baseMultiplier = depthMultipliers[depth] * intensity;
  const adjustedMultiplier = isMobile || isLowEnd ? baseMultiplier * 0.5 : baseMultiplier;

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-100 * adjustedMultiplier, 100 * adjustedMultiplier]
  );
  
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 });

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== PORTAL TRANSITION ==========
interface PortalSectionProps {
  children: ReactNode;
  className?: string;
}

export const PortalSection = ({ children, className = "" }: PortalSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isMobile } = useDeviceCapabilities();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [1, 1, 1] : [0.85, 0.95, 1]
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [0.3, 0.7, 0.9, 1]
  );
  
  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion || isMobile ? [0, 0, 0] : [8, 2, 0]
  );

  const smoothScale = useSpring(scale, { stiffness: 80, damping: 25 });
  const smoothOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <motion.section
      ref={ref}
      style={{
        scale: smoothScale,
        opacity: smoothOpacity,
        filter: isMobile ? undefined : `blur(${blur.get()}px)`,
      }}
      className={`will-change-transform transform-gpu ${className}`}
    >
      {children}
    </motion.section>
  );
};

// ========== IMMERSIVE DISPLACEMENT MOTION ==========
interface DisplacementMotionProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down" | "diagonal";
  distance?: number;
}

export const DisplacementMotion = ({
  children,
  className = "",
  direction = "up",
  distance = 50,
}: DisplacementMotionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isMobile, isLowEnd } = useDeviceCapabilities();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const adjustedDistance = isMobile || isLowEnd ? distance * 0.3 : distance;

  const getTransforms = () => {
    if (reducedMotion) return { x: 0, y: 0 };
    
    switch (direction) {
      case "left":
        return { x: useTransform(scrollYProgress, [0, 1], [adjustedDistance, -adjustedDistance]), y: 0 };
      case "right":
        return { x: useTransform(scrollYProgress, [0, 1], [-adjustedDistance, adjustedDistance]), y: 0 };
      case "up":
        return { x: 0, y: useTransform(scrollYProgress, [0, 1], [adjustedDistance, -adjustedDistance]) };
      case "down":
        return { x: 0, y: useTransform(scrollYProgress, [0, 1], [-adjustedDistance, adjustedDistance]) };
      case "diagonal":
        return {
          x: useTransform(scrollYProgress, [0, 1], [-adjustedDistance * 0.5, adjustedDistance * 0.5]),
          y: useTransform(scrollYProgress, [0, 1], [adjustedDistance, -adjustedDistance]),
        };
      default:
        return { x: 0, y: 0 };
    }
  };

  const transforms = getTransforms();
  const smoothX = typeof transforms.x === 'number' ? transforms.x : useSpring(transforms.x, { stiffness: 80, damping: 30 });
  const smoothY = typeof transforms.y === 'number' ? transforms.y : useSpring(transforms.y, { stiffness: 80, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ x: smoothX, y: smoothY }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== CADENCE SHIFT ANIMATION ==========
interface CadenceShiftProps {
  children: ReactNode;
  className?: string;
}

export const CadenceShift = ({ children, className = "" }: CadenceShiftProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Variable speed based on scroll position
  const y = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    reducedMotion ? [0, 0, 0, 0] : [80, 20, -20, -80]
  );

  const smoothY = useSpring(y, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== ENTRANCE ANIMATIONS ==========
interface AnimatedEntryProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: "fade-zoom" | "rotate-in" | "blur-sharp" | "slide-bounce";
}

export const AnimatedEntry = ({
  children,
  className = "",
  delay = 0,
  type = "fade-zoom",
}: AnimatedEntryProps) => {
  const reducedMotion = useReducedMotion();

  const variants = {
    "fade-zoom": {
      hidden: { opacity: 0, scale: 0.9, y: 30 },
      visible: { opacity: 1, scale: 1, y: 0 },
    },
    "rotate-in": {
      hidden: { opacity: 0, rotateY: reducedMotion ? 0 : 15, scale: 0.95 },
      visible: { opacity: 1, rotateY: 0, scale: 1 },
    },
    "blur-sharp": {
      hidden: { opacity: 0, filter: reducedMotion ? "blur(0px)" : "blur(10px)", y: 20 },
      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
    },
    "slide-bounce": {
      hidden: { opacity: 0, x: -50, y: 20 },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay,
        },
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom easing for premium feel
      }}
      variants={variants[type]}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== STAGGER CONTAINER ==========
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-5%" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ========== MOUSE PARALLAX (Desktop) ==========
interface MouseParallaxProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export const MouseParallax = ({
  children,
  className = "",
  intensity = 20,
}: MouseParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const { isMobile } = useDeviceCapabilities();
  const reducedMotion = useReducedMotion();

  const smoothX = useSpring(x, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 50, damping: 30 });

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      x.set(deltaX * intensity);
      y.set(deltaY * intensity);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [intensity, isMobile, reducedMotion, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: smoothX, y: smoothY }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== FLOATING 3D ELEMENT ==========
interface Floating3DProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  amplitude?: number;
}

export const Floating3D = ({
  children,
  className = "",
  duration = 6,
  delay = 0,
  amplitude = 15,
}: Floating3DProps) => {
  const reducedMotion = useReducedMotion();
  const { isLowEnd } = useDeviceCapabilities();

  if (reducedMotion || isLowEnd) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotateX: [-2, 2, -2],
        rotateY: [-2, 2, -2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`will-change-transform transform-gpu ${className}`}
      style={{ perspective: "1000px" }}
    >
      {children}
    </motion.div>
  );
};

// ========== GLOW PULSE EFFECT ==========
interface GlowPulseProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export const GlowPulse = ({
  children,
  className = "",
  color = "primary",
}: GlowPulseProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        reducedMotion
          ? {}
          : {
              boxShadow: [
                `0 0 20px hsl(var(--${color}) / 0.2)`,
                `0 0 40px hsl(var(--${color}) / 0.4)`,
                `0 0 20px hsl(var(--${color}) / 0.2)`,
              ],
            }
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ========== PERSPECTIVE WRAPPER ==========
export const PerspectiveWrapper = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`transform-gpu ${className}`}
      style={{ perspective: "1200px", perspectiveOrigin: "center" }}
    >
      {children}
    </div>
  );
};
