import { api, brandFromCompany, type ApiCompany, type Brand } from '@traxii/shared';

/** GET /api/public/theme — tema whitelabel resolvido pelo domínio atual */
export async function fetchPublicTheme(): Promise<Brand | null> {
  const domain = window.location.hostname;
  const res = await api<{ data: ApiCompany | null }>(
    `/public/theme?domain=${encodeURIComponent(domain)}`,
  );
  return res.data ? brandFromCompany(res.data) : null;
}
