import type { ApiCompany, Brand } from '@traxii/shared';
import { brandFromCompany } from '@traxii/shared';
import { api } from '@traxii/shared';

/**
 * Marcas whitelabel (companies na API Laravel).
 * CRUD exige autenticação de super admin; o tema é público.
 */

const ACTIVE_KEY = 'wl_active_brand';

export interface SaveBrandOptions {
  isNew: boolean;
  logoFile?: File | null;
  removeLogo?: boolean;
}

/** GET /api/public/theme — tema whitelabel resolvido pelo domínio atual */
export async function fetchPublicTheme(): Promise<Brand | null> {
  const domain = window.location.hostname;
  const res = await api<{ data: ApiCompany | null }>(
    `/public/theme?domain=${encodeURIComponent(domain)}`,
  );
  return res.data ? brandFromCompany(res.data) : null;
}

/** GET /api/companies */
export async function listBrands(): Promise<Brand[]> {
  const res = await api<{ data: ApiCompany[] }>('/companies');
  return res.data.map(brandFromCompany);
}

/** POST /api/companies | POST /api/companies/{id} (_method=PUT) */
export async function saveBrand(
  brand: Brand,
  options: SaveBrandOptions,
): Promise<Brand> {
  const formData = new FormData();
  formData.append('name', brand.name);
  if (brand.domain) formData.append('domain', brand.domain);
  formData.append('primary_color', brand.primaryColor);
  formData.append('secondary_color', brand.secondaryColor);
  formData.append('is_active', brand.isActive ? '1' : '0');
  if (options.logoFile) formData.append('logo', options.logoFile);
  if (options.removeLogo) formData.append('remove_logo', '1');

  let path = '/companies';
  if (!options.isNew) {
    path = `/companies/${brand.id}`;
    formData.append('_method', 'PUT');
  }

  const res = await api<{ data: ApiCompany }>(path, { method: 'POST', formData });
  return brandFromCompany(res.data);
}

/** DELETE /api/companies/{id} */
export async function deleteBrand(id: string): Promise<void> {
  await api(`/companies/${id}`, { method: 'DELETE' });
}

/* Preferência local de tema ativo (demonstração/preview no dispositivo) */

export function getActiveBrandId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveBrandId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}
