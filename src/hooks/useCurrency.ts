import { useState, useEffect, useCallback } from 'react';

interface CurrencyConfig {
  code: string;
  symbol: string;
  position: 'before' | 'after';
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  XOF: { code: 'XOF', symbol: 'FCFA', position: 'after' },
  EUR: { code: 'EUR', symbol: '€', position: 'before' },
  USD: { code: 'USD', symbol: '$', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', position: 'before' },
  MAD: { code: 'MAD', symbol: 'MAD', position: 'after' },
  GHS: { code: 'GHS', symbol: 'GH₵', position: 'before' },
  NGN: { code: 'NGN', symbol: '₦', position: 'before' },
};

const STORAGE_KEY = 'stocknix_currency';
const LEGACY_KEY = 'app_currency';

// Migrate legacy 'app_currency' key into the canonical 'stocknix_currency' on first read.
function getCurrencyFromStorage(): CurrencyConfig {
  let stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && CURRENCIES[legacy]) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
      stored = legacy;
    }
  }
  if (stored && CURRENCIES[stored]) return CURRENCIES[stored];
  return CURRENCIES.XOF;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(getCurrencyFromStorage);

  useEffect(() => {
    const handler = () => setCurrencyState(getCurrencyFromStorage());
    window.addEventListener('currency-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('currency-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setCurrency = useCallback((code: string) => {
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.removeItem(LEGACY_KEY);
    setCurrencyState(CURRENCIES[code] || CURRENCIES.XOF);
    window.dispatchEvent(new Event('currency-changed'));
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    const formatted = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    if (currency.position === 'before') return `${currency.symbol}${formatted}`;
    return `${formatted} ${currency.symbol}`;
  }, [currency]);

  return { currency, setCurrency, formatCurrency, currencies: CURRENCIES };
}
