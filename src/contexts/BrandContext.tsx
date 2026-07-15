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
import type { SaveBrandOptions } from '../services/brandService';

interface BrandContextValue {
  /** Lista completa (disponível após loadBrands, que exige admin autenticado) */
  brands: Brand[];
  activeBrand: Brand;
  activateBrand: (id: string) => void;
  /** Carrega as marcas da API (chamar no Gerenciador, após login) */
  loadBrands: () => Promise<void>;
  saveBrand: (brand: Brand, options: SaveBrandOptions, apply?: boolean) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [publicBrand, setPublicBrand] = useState<Brand | null>(null);
  const [activeId, setActiveId] = useState<string | null>(
    brandService.getActiveBrandId,
  );

  // Tema público resolvido pelo domínio (landing/login antes de qualquer auth)
  useEffect(() => {
    brandService
      .fetchPublicTheme()
      .then(setPublicBrand)
      .catch(() => setPublicBrand(null)); // API fora do ar → fallback local
  }, []);

  const activeBrand =
    brands.find((b) => b.id === activeId) ??
    publicBrand ??
    DEFAULT_BRANDS[0];

  // Aplica o tema da marca ativa em toda a aplicação (CSS variables)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--p', activeBrand.primaryColor);
    root.style.setProperty('--s', activeBrand.secondaryColor);
    root.style.setProperty('--psoft', activeBrand.primaryColor + '14');
    document.title = activeBrand.name + ' · Internet Banking';
  }, [activeBrand]);

  const loadBrands = useCallback(async () => {
    setBrands(await brandService.listBrands());
  }, []);

  const activateBrand = useCallback((id: string) => {
    brandService.setActiveBrandId(id);
    setActiveId(id);
  }, []);

  const saveBrand = useCallback(
    async (brand: Brand, options: SaveBrandOptions, apply = false) => {
      const saved = await brandService.saveBrand(brand, options);
      setBrands((prev) => {
        const exists = prev.some((b) => b.id === saved.id);
        return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [...prev, saved];
      });
      if (apply) activateBrand(saved.id);
      return saved;
    },
    [activateBrand],
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      await brandService.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      if (id === activeId) {
        localStorage.removeItem('wl_active_brand');
        setActiveId(null);
      }
    },
    [activeId],
  );

  return (
    <BrandContext.Provider
      value={{ brands, activeBrand, activateBrand, loadBrands, saveBrand, deleteBrand }}
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
