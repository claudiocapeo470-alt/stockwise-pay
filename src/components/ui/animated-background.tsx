import { memo } from "react";

const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
      
      {/* Animated fluid shapes */}
      <div className="absolute inset-0">
        <div className="fluid-blob fluid-blob-1" />
        <div className="fluid-blob fluid-blob-2" />
        <div className="fluid-blob fluid-blob-3" />
        <div className="fluid-blob fluid-blob-4" />
        <div className="fluid-blob fluid-blob-5" />
        <div className="fluid-blob fluid-blob-6" />
      </div>
      
      {/* Overlay for subtle blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export { AnimatedBackground };