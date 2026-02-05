import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// PORTAL TRANSITION - Effet tunnel 3D entre sections
// ═══════════════════════════════════════════════════════════════

interface PortalSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const PortalSection = ({ children, className = "", id }: PortalSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [15, 0, 0, -15]);
  const z = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [-200, 0, 0, -200]);

  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative ${className}`}
      style={{
        scale: smoothScale,
        opacity,
        rotateX: smoothRotateX,
        transformStyle: "preserve-3d",
        perspective: "1500px",
        transformOrigin: "center center",
      }}
    >
      {children}
    </motion.section>
  );
};

// ═══════════════════════════════════════════════════════════════
// CURTAIN REVEAL - Effet rideau qui se sépare
// ═══════════════════════════════════════════════════════════════

interface CurtainRevealProps {
  children: ReactNode;
  className?: string;
}

export const CurtainReveal = ({ children, className = "" }: CurtainRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const leftCurtain = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rightCurtain = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);
  const contentScale = useTransform(scrollYProgress, [0.3, 0.8], [0.9, 1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Rideaux gauche et droit */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background via-background to-transparent z-10 pointer-events-none"
        style={{ x: leftCurtain }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-background via-background to-transparent z-10 pointer-events-none"
        style={{ x: rightCurtain }}
      />
      
      {/* Contenu révélé */}
      <motion.div
        style={{ opacity: contentOpacity, scale: contentScale }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DEPTH PARALLAX - Parallax multi-couches avec profondeur
// ═══════════════════════════════════════════════════════════════

interface DepthParallaxProps {
  children: ReactNode;
  depth?: number; // -1 (background) to 1 (foreground)
  className?: string;
}

export const DepthParallax = ({ children, depth = 0, className = "" }: DepthParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Plus le depth est élevé, plus le mouvement est prononcé
  const yRange = 100 * depth;
  const scaleRange = 1 + (depth * 0.1);
  
  const y = useTransform(scrollYProgress, [0, 1], [yRange, -yRange]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, scaleRange, 1]);
  const blur = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    [Math.abs(depth) * 2, 0, Math.abs(depth) * 2]
  );

  const smoothY = useSpring(y, { stiffness: 50, damping: 20 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: smoothY,
        scale,
        filter: depth !== 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ZOOM CINEMATIC - Zoom dramatique au scroll
// ═══════════════════════════════════════════════════════════════

interface ZoomCinematicProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export const ZoomCinematic = ({ children, className = "", intensity = 1 }: ZoomCinematicProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.5 + (0.5 / intensity), 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1]);
  const z = useTransform(scrollYProgress, [0, 1], [-500 * intensity, 0]);

  const smoothScale = useSpring(scale, { stiffness: 80, damping: 25 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        scale: smoothScale,
        opacity,
        transformStyle: "preserve-3d",
        perspective: "2000px",
      }}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// FLOATING 3D - Lévitation avec rotation subtile
// ═══════════════════════════════════════════════════════════════

interface Floating3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  rotationIntensity?: number;
}

export const Floating3D = ({ 
  children, 
  className = "", 
  intensity = 1,
  rotationIntensity = 1 
}: Floating3DProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{
        y: [0, -10 * intensity, 0],
        rotateX: mousePos.y * -10 * rotationIntensity,
        rotateY: mousePos.x * 10 * rotationIntensity,
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotateX: { duration: 0.3, ease: "easeOut" },
        rotateY: { duration: 0.3, ease: "easeOut" },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAGNETIC ELEMENT - Élément attiré par le curseur
// ═══════════════════════════════════════════════════════════════

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export const Magnetic = ({ children, className = "", strength = 0.3 }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// VELOCITY SCROLL - Animation basée sur la vitesse de scroll
// ═══════════════════════════════════════════════════════════════

interface VelocityScrollProps {
  children: ReactNode;
  className?: string;
}

export const VelocityScroll = ({ children, className = "" }: VelocityScrollProps) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  const skewY = useTransform(scrollVelocity, [-1000, 0, 1000], [-3, 0, 3]);
  const scaleX = useTransform(scrollVelocity, [-1000, 0, 1000], [0.98, 1, 0.98]);
  
  const smoothSkewY = useSpring(skewY, { stiffness: 100, damping: 30 });
  const smoothScaleX = useSpring(scaleX, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={className}
      style={{
        skewY: smoothSkewY,
        scaleX: smoothScaleX,
      }}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SPLIT TEXT - Animation lettre par lettre
// ═══════════════════════════════════════════════════════════════

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const SplitText = ({ text, className = "", delay = 0 }: SplitTextProps) => {
  const letters = text.split("");
  
  return (
    <span className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.03,
            ease: [0.6, 0.01, -0.05, 0.95],
          }}
          className="inline-block"
          style={{ display: letter === " " ? "inline" : "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// GLOW CURSOR - Curseur avec effet glow
// ═══════════════════════════════════════════════════════════════

export const GlowCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-64 h-64 pointer-events-none z-50 mix-blend-screen"
      animate={{
        x: mousePos.x - 128,
        y: mousePos.y - 128,
        opacity: isVisible ? 0.6 : 0,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// PARTICLE FIELD - Champ de particules interactif
// ═══════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export const ParticleField = ({ count = 50, className = "" }: ParticleFieldProps) => {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.3,
    }))
  );

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ y }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, hsl(var(--primary) / ${particle.opacity}), transparent)`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};
