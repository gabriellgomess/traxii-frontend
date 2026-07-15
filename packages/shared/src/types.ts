/**
 * Tipos de domínio — espelham os recursos que a futura API Laravel irá expor.
 */

export interface Brand {
  id: string;
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  /** URL ou data-URL da logo; null usa a inicial do nome sobre a cor primária */
  logoUrl: string | null;
  isActive: boolean;
}

/* ---------- Usuários do sistema (admin / backoffice) ---------- */

export type SystemRole = 'super_admin' | 'company_admin' | 'company_operator';

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: SystemRole;
  companyId: number | null;
}

/** Shape da empresa como a API Laravel devolve */
export interface ApiCompany {
  id: number;
  name: string;
  domain: string | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  is_active: boolean;
}

export function brandFromCompany(c: ApiCompany): Brand {
  return {
    id: String(c.id),
    name: c.name,
    domain: c.domain ?? '',
    primaryColor: c.primary_color,
    secondaryColor: c.secondary_color,
    logoUrl: c.logo_url,
    isActive: c.is_active ?? true,
  };
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  agency: string;
  account: string;
  customerSince: string;
}

export interface Transaction {
  id: string;
  name: string;
  kind: string;
  /** positivo = entrada, negativo = saída */
  value: number;
  /** rótulo da data (ex.: "12 de julho") */
  date: string;
}

export interface StatementGroup {
  date: string;
  items: Transaction[];
}

export type StatementFilter = 'todos' | 'entradas' | 'saidas';

export interface FinanceSummary {
  month: string;
  income: number;
  invested: number;
  expenses: number;
}

export interface Bill {
  id: string;
  description: string;
  dueDate: string;
  value: number;
}

export type PixKeyType = 'cpf' | 'celular' | 'email' | 'aleatoria';

export interface PixKeyTypeOption {
  id: PixKeyType;
  label: string;
  placeholder: string;
}

export interface PixRequest {
  keyType: PixKeyType;
  key: string;
  amount: number;
  message?: string;
}

export interface PixReceipt {
  id: string;
  authCode: string;
  date: string;
  amount: number;
  key: string;
  keyTypeLabel: string;
  recipientName: string;
  institution: string;
  message?: string;
}

export interface TedRequest {
  bank: string;
  agency: string;
  account: string;
  recipientName: string;
  document: string;
  amount: number;
}

export interface TedReceipt {
  id: string;
  authCode: string;
  date: string;
  amount: number;
  recipientName: string;
  bank: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface LoginCredentials {
  cpf: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
