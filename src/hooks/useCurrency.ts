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
};

const STORAGE_KEY = 'stocknix_currency';

function getCurrencyFromStorage(): CurrencyConfig {
  const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('app_currency');
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
    localStorage.setItem('app_currency', code);
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
