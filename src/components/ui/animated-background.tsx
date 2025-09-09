import { memo, useEffect, useState } from "react";

const AnimatedBackground = memo(() => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calculate scroll-based transformations
  const scrollProgress = Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
  const scrollOffset = scrollY * 0.5;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dynamic gradient base that changes with scroll */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(${135 + scrollProgress * 45}deg, 
            hsl(var(--background)) 0%, 
            hsl(var(--card)) ${30 + scrollProgress * 20}%, 
            hsl(var(--background)) 100%)`
        }}
      />
      
      {/* Main fluid shapes with scroll reactivity */}
      <div className="absolute inset-0">
        <div 
          className="fluid-blob fluid-blob-1 interactive-blob scroll-morph"
          style={{
            transform: `translateY(${scrollOffset * 0.3}px) translateX(${mousePos.x * 0.1}px) scale(${1 + scrollProgress * 0.2})`,
            opacity: 0.7 - scrollProgress * 0.3
          }}
        />
        <div 
          className="fluid-blob fluid-blob-2 interactive-blob"
          style={{
            transform: `translateY(${scrollOffset * -0.2}px) translateX(${mousePos.y * 0.05}px) rotate(${scrollProgress * 180}deg)`,
            opacity: 0.6 + scrollProgress * 0.2
          }}
        />
        <div 
          className="fluid-blob fluid-blob-3 interactive-blob scroll-morph"
          style={{
            transform: `translateY(${scrollOffset * 0.4}px) scale(${1.2 - scrollProgress * 0.3})`,
            opacity: 0.5 + Math.sin(scrollProgress * Math.PI) * 0.3
          }}
        />
        <div 
          className="fluid-blob fluid-blob-4 interactive-blob"
          style={{
            transform: `translateY(${scrollOffset * -0.1}px) translateX(${mousePos.x * -0.08}px)`,
            filter: `blur(${40 + scrollProgress * 20}px)`
          }}
        />
      </div>

      {/* Morphing shapes that appear on scroll */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={`morph-${i}`}
            className="morphing-shape scroll-morph"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 12}%`,
              transform: `translateY(${scrollOffset * (0.1 + i * 0.05)}px) rotate(${scrollProgress * 360 + i * 60}deg)`,
              opacity: Math.max(0, scrollProgress * 0.6 - i * 0.1),
              background: `radial-gradient(ellipse at ${50 + Math.sin(scrollProgress * Math.PI + i) * 30}% ${50 + Math.cos(scrollProgress * Math.PI + i) * 30}%, 
                hsl(var(--${i % 2 === 0 ? 'primary' : 'accent'}) / 0.${3 + i}), 
                transparent)`
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="floating-particle"
            style={{
              width: `${4 + i % 3 * 2}px`,
              height: `${4 + i % 3 * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translateY(${scrollOffset * -0.2 * (1 + i * 0.1)}px)`,
              opacity: 0.4 + Math.sin(scrollProgress * Math.PI * 2 + i) * 0.3,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Flowing lines */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="flowing-line"
            style={{
              width: `${300 + i * 100}px`,
              height: `${2 + i}px`,
              top: `${20 + i * 25}%`,
              left: `${-50 + scrollProgress * 100}%`,
              transform: `skewX(${-15 + scrollProgress * 30}deg) translateY(${mousePos.y * 0.1}px)`,
              opacity: 0.6 - i * 0.1,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Dynamic overlay for content readability */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `linear-gradient(${180 + scrollProgress * 60}deg, 
            hsl(var(--background) / ${0.2 + scrollProgress * 0.3}) 0%, 
            transparent 50%, 
            hsl(var(--background) / ${0.1 + scrollProgress * 0.2}) 100%)`
        }}
      />
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export { AnimatedBackground };