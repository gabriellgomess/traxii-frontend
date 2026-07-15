import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Brand } from '@traxii/shared';
import { DEFAULT_BRANDS } from '../mocks/db';
import { fetchPublicTheme } from '../services/themeService';

interface BrandContextValue {
  /** Tema whitelabel resolvido pelo domínio onde a dist está instalada */
  activeBrand: Brand;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [publicBrand, setPublicBrand] = useState<Brand | null>(null);

  useEffect(() => {
    fetchPublicTheme()
      .then(setPublicBrand)
      .catch(() => setPublicBrand(null)); // API fora do ar → fallback local
  }, []);

  const activeBrand = publicBrand ?? DEFAULT_BRANDS[0];

  // Aplica o tema em toda a aplicação (CSS variables)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--p', activeBrand.primaryColor);
    root.style.setProperty('--s', activeBrand.secondaryColor);
    root.style.setProperty('--psoft', activeBrand.primaryColor + '14');
    document.title = activeBrand.name + ' · Internet Banking';
  }, [activeBrand]);

  return (
    <BrandContext.Provider value={{ activeBrand }}>{children}</BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand deve ser usado dentro de <BrandProvider>');
  return ctx;
}
