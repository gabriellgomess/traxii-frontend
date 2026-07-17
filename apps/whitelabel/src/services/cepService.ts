/** Consulta de CEP no ViaCEP (API pública gratuita, com CORS liberado). */

export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

/** Devolve null quando o CEP não existe ou o serviço está indisponível. */
export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
