import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency as fmt, getAllCurrencies, getSymbolFor } from '@/lib/currency';

interface CurrencyState {
  code: string; // ISO code, e.g., 'INR'
}

interface CurrencyContextType {
  code: string;
  symbol: string;
  isLoading: boolean;
  currencies: { code: string; name: string; symbol: string }[];
  formatCurrency: (value: number, codeOverride?: string, opts?: Intl.NumberFormatOptions) => string;
  setCurrency: (code: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CurrencyState>({ code: 'INR' });
  const [isLoading, setIsLoading] = useState(true);

  // Precompute list for dropdowns
  const currencies = useMemo(() => {
    return getAllCurrencies().map(c => ({ code: c.code, name: c.currency || c.code, symbol: c.symbol }));
  }, []);

  const symbol = useMemo(() => getSymbolFor(state.code), [state.code]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'currency')
        .maybeSingle();
      if (error) throw error;
      const code = (data?.value as any)?.code || 'INR';
      setState({ code });
    } catch (e) {
      // fallback to INR
      setState({ code: 'INR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setCurrency = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('system_settings').upsert({ key: 'currency', value: { code } }, { onConflict: 'key' });
      if (error) throw error;
      setState({ code });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatCurrency = useCallback((value: number, codeOverride?: string, opts?: Intl.NumberFormatOptions) => {
    return fmt(value, codeOverride || state.code, opts);
  }, [state.code]);

  const value = useMemo<CurrencyContextType>(() => ({
    code: state.code,
    symbol,
    isLoading,
    currencies,
    formatCurrency,
    setCurrency,
  }), [state.code, symbol, isLoading, currencies, formatCurrency, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};

