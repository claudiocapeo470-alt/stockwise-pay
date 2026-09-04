import React from "react";
import { useLocation, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Transitions de page uniformes dans toute l'app :
 * fade + léger slide vertical, ~180ms, easing doux.
 * Enveloppe un bloc <Routes> (y compris les routes imbriquées /app/* et /admin/*).
 */
export function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full"
      >
        <Routes location={location}>{children}</Routes>
      </motion.div>
    </AnimatePresence>
  );
}
