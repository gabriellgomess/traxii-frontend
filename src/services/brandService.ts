import type { Brand } from '../types';
import { DEFAULT_BRANDS } from '../mocks/db';
import { delay } from './api';

/**
 * CRUD de marcas whitelabel.
 * Persistência local (localStorage) até a API Laravel existir:
 *   GET/POST/PUT/DELETE /api/brands · POST /api/brands/{id}/activate
 */

const BRANDS_KEY = 'wl_brands';
const ACTIVE_KEY = 'wl_active_brand';

function readBrands(): Brand[] {
  try {
    const raw = localStorage.getItem(BRANDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Brand[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignora e cai no seed */
  }
  return DEFAULT_BRANDS;
}

function writeBrands(brands: Brand[]): void {
  localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
}

export async function listBrands(): Promise<Brand[]> {
  await delay(100);
  return readBrands();
}

export async function saveBrand(brand: Brand): Promise<Brand[]> {
  await delay(150);
  const brands = readBrands();
  const exists = brands.some((b) => b.id === brand.id);
  const next = exists
    ? brands.map((b) => (b.id === brand.id ? brand : b))
    : [...brands, brand];
  writeBrands(next);
  return next;
}

export async function deleteBrand(id: string): Promise<Brand[]> {
  await delay(150);
  const next = readBrands().filter((b) => b.id !== id);
  writeBrands(next);
  return next;
}

export function getActiveBrandId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveBrandId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}
