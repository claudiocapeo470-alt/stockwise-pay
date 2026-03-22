import { useEffect, useRef, useCallback, useState } from 'react';
import { useCompany } from './useCompany';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useAutoLock(onLock: () => void) {
  const { company } = useCompany();
  const { isEmployee } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const timeoutMinutes = company?.lock_timeout_minutes || 5;
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  useEffect(() => {
    if (!isEmployee || timeoutMinutes <= 0) return;

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMs - elapsed;

      // Warning 1 minute before
      if (remaining <= 60000 && remaining > 0 && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning('Votre session va se verrouiller dans 1 minute', { duration: 5000 });
      }

      if (elapsed >= timeoutMs) {
        onLock();
        resetTimer();
      }
    }, 10000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [isEmployee, timeoutMs, onLock, resetTimer, timeoutMinutes]);

  return { resetTimer };
}
