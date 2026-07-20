/**
 * Abertura de conta PF — endpoints públicos do wizard.
 * Rotas protegidas por token de retomada (header X-Opening-Token), guardado
 * em sessionStorage (limpo ao fechar a aba — mais seguro que localStorage).
 */

import { api } from '@traxii/shared';

/* ---------- Tipos espelhando a API ---------- */

export interface PersonalDataPayload {
  full_name: string;
  email: string;
  cpf: string;
  document_type: 'rg' | 'cnh';
  document_number: string;
  document_issuer: string;
  document_issuer_uf: string;
  birth_date: string;
  phone: string;
}

export interface AddressPayload {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type DocumentSlot = 'document_front' | 'document_back' | 'address_proof' | 'selfie';

export interface OpeningProgress {
  uuid: string;
  status: 'draft' | 'pending' | 'in_analysis' | 'approved' | 'rejected';
  current_step: number;
  total_steps: number;
  personal_data: PersonalDataPayload;
  address: Partial<AddressPayload>;
  documents: Record<DocumentSlot, { uploaded: boolean; original_name: string | null; size: number | null }>;
  liveness_completed: boolean;
  acceptances: { terms: boolean; privacy: boolean; truthfulness: boolean };
  submitted_at: string | null;
}

interface OpeningResponse {
  data: OpeningProgress & { resume_token?: string };
  message?: string;
}

/* ---------- Sessão do wizard (retomada na mesma aba) ---------- */

const SESSION_KEY = 'tx_wl_opening';

interface OpeningSession {
  uuid: string;
  token: string;
}

export function getOpeningSession(): OpeningSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as OpeningSession) : null;
  } catch {
    return null;
  }
}

function saveOpeningSession(session: OpeningSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearOpeningSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

function authHeaders(): Record<string, string> {
  const session = getOpeningSession();
  return session ? { 'X-Opening-Token': session.token } : {};
}

function openingPath(suffix = ''): string {
  const session = getOpeningSession();
  if (!session) throw new Error('Nenhum cadastro em andamento.');
  return `/public/account-openings/${session.uuid}${suffix}`;
}

/* ---------- Chamadas à API ---------- */

/** Etapa 1 — cria o rascunho e guarda uuid + token na sessão. */
export async function startOpening(payload: PersonalDataPayload): Promise<OpeningProgress> {
  const res = await api<OpeningResponse>('/public/account-openings', {
    method: 'POST',
    body: { ...payload, domain: window.location.hostname },
  });

  if (res.data.resume_token) {
    saveOpeningSession({ uuid: res.data.uuid, token: res.data.resume_token });
  }
  return res.data;
}

/** Retomada — progresso atual do cadastro da sessão. */
export async function fetchOpeningProgress(): Promise<OpeningProgress> {
  const res = await api<OpeningResponse>(openingPath(), { headers: authHeaders() });
  return res.data;
}

/** Etapa 1 — edição dos dados pessoais de um rascunho existente. */
export async function updatePersonalData(payload: PersonalDataPayload): Promise<OpeningProgress> {
  const res = await api<OpeningResponse>(openingPath('/personal-data'), {
    method: 'PUT',
    body: payload,
    headers: authHeaders(),
  });
  return res.data;
}

/** Etapa 2 — endereço. */
export async function updateAddress(payload: AddressPayload): Promise<OpeningProgress> {
  const res = await api<OpeningResponse>(openingPath('/address'), {
    method: 'PUT',
    body: payload,
    headers: authHeaders(),
  });
  return res.data;
}

/** Etapa 3 — upload (parcial ou completo) dos documentos. */
export async function uploadDocuments(
  files: Partial<Record<'document_front' | 'document_back' | 'address_proof', File>>,
): Promise<OpeningProgress> {
  const formData = new FormData();
  for (const [slot, file] of Object.entries(files)) {
    if (file) formData.append(slot, file);
  }

  const res = await api<OpeningResponse>(openingPath('/documents'), {
    method: 'POST',
    formData,
    headers: authHeaders(),
  });
  return res.data;
}

/** Etapa 4 — registra a prova de vida concluída. */
export async function completeLiveness(challenges: string[]): Promise<OpeningProgress> {
  const res = await api<OpeningResponse>(openingPath('/liveness'), {
    method: 'POST',
    body: { challenges },
    headers: authHeaders(),
  });
  return res.data;
}

/** Etapa 5 — envia a selfie capturada pela câmera. */
export async function uploadSelfie(selfie: File): Promise<OpeningProgress> {
  const formData = new FormData();
  formData.append('selfie', selfie);

  const res = await api<OpeningResponse>(openingPath('/selfie'), {
    method: 'POST',
    formData,
    headers: authHeaders(),
  });
  return res.data;
}

/** Etapa 6 — aceites obrigatórios + envio para análise. */
export async function submitOpening(): Promise<{ progress: OpeningProgress; message: string }> {
  const res = await api<OpeningResponse>(openingPath('/submit'), {
    method: 'POST',
    body: {
      accept_terms: true,
      accept_privacy: true,
      accept_truthfulness: true,
    },
    headers: authHeaders(),
  });
  return { progress: res.data, message: res.message ?? 'Cadastro enviado para análise.' };
}
