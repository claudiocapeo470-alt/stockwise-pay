import { memo } from "react";

const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-background/95" />
      
      {/* Animated fluid shapes */}
      <div className="absolute inset-0">
        <div className="fluid-blob fluid-blob-1" />
        <div className="fluid-blob fluid-blob-2" />
        <div className="fluid-blob fluid-blob-3" />
        <div className="fluid-blob fluid-blob-4" />
        <div className="fluid-blob fluid-blob-5" />
        <div className="fluid-blob fluid-blob-6" />
      </div>
      
      {/* Strong overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export { AnimatedBackground };