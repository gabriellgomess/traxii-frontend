import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Brand } from '../types';
import { DEFAULT_BRANDS } from '../mocks/db';
import * as brandService from '../services/brandService';

interface BrandContextValue {
  brands: Brand[];
  activeBrand: Brand;
  activateBrand: (id: string) => void;
  saveBrand: (brand: Brand, apply?: boolean) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [activeId, setActiveId] = useState<string>(
    () => brandService.getActiveBrandId() ?? DEFAULT_BRANDS[0].id,
  );

  useEffect(() => {
    brandService.listBrands().then(setBrands);
  }, []);

  const activeBrand =
    brands.find((b) => b.id === activeId) ?? brands[0] ?? DEFAULT_BRANDS[0];

  // Aplica o tema da marca ativa em toda a aplicação (CSS variables)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--p', activeBrand.primaryColor);
    root.style.setProperty('--s', activeBrand.secondaryColor);
    root.style.setProperty('--psoft', activeBrand.primaryColor + '14');
    document.title = activeBrand.name + ' · Internet Banking';
  }, [activeBrand]);

  const activateBrand = useCallback((id: string) => {
    brandService.setActiveBrandId(id);
    setActiveId(id);
  }, []);

  const saveBrand = useCallback(
    async (brand: Brand, apply = false) => {
      const next = await brandService.saveBrand(brand);
      setBrands(next);
      if (apply) activateBrand(brand.id);
    },
    [activateBrand],
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      const next = await brandService.deleteBrand(id);
      setBrands(next);
      if (id === activeId && next.length > 0) activateBrand(next[0].id);
    },
    [activeId, activateBrand],
  );

  return (
    <BrandContext.Provider
      value={{ brands, activeBrand, activateBrand, saveBrand, deleteBrand }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand deve ser usado dentro de <BrandProvider>');
  return ctx;
}
