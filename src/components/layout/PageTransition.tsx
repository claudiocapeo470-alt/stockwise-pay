import React from "react";
import { useLocation, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Transitions de page uniformes dans toute l'app :
 * fade + léger slide vertical, ~180ms, easing doux.
 * Enveloppe un bloc <Routes> (y compris les routes imbriquées /app/* et /admin/*).
 */
export function AnimatedRoutes({ children, topLevel = false }: { children: React.ReactNode; topLevel?: boolean }) {
  const location = useLocation();
  // Au niveau racine, on ne re-anime pas quand on navigue à l'intérieur de /app ou /admin
  // (leurs blocs <Routes> imbriqués ont leur propre AnimatedRoutes) — sinon tout le layout serait remonté.
  const segment = location.pathname.split('/')[1] || '/';
  const key = topLevel && (segment === 'app' || segment === 'admin') ? segment : location.pathname;
  return (
    <div className="grid h-full w-full">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full w-full min-w-0 [grid-area:1/1]"
        >
          <Routes location={location}>{children}</Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

