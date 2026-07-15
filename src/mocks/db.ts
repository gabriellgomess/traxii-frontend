import type {
  Brand,
  User,
  StatementGroup,
  Faq,
  FinanceSummary,
  Bill,
  PixKeyTypeOption,
} from '../types';

export const DEFAULT_BRANDS: Brand[] = [
  { id: 'nova', name: 'NovaBank', domain: 'novabank.com.br', primaryColor: '#1437C9', secondaryColor: '#FF7A1A', logoUrl: null },
  { id: 'verde', name: 'Verde Pay', domain: 'verdepay.com.br', primaryColor: '#0B8A5C', secondaryColor: '#FFC53D', logoUrl: null },
  { id: 'aurum', name: 'Aurum', domain: 'aurum.com.br', primaryColor: '#8A6D1F', secondaryColor: '#16181D', logoUrl: null },
  { id: 'rubi', name: 'Rubi Bank', domain: 'rubibank.com.br', primaryColor: '#C81E4B', secondaryColor: '#5B2A86', logoUrl: null },
];

export const MOCK_USER: User = {
  id: '1',
  name: 'Samuel Ribeiro da Costa',
  cpf: '412.658.930-05',
  birthDate: '14/02/1991',
  email: 'samuel.costa@email.com',
  phone: '(11) 98765-4321',
  address: 'Rua das Figueiras, 842 · ap 73 · Santo André/SP · 09080-300',
  agency: '0001',
  account: '78412-6',
  customerSince: 'março de 2023',
};

export const MOCK_BALANCE = 8421.1;
export const MOCK_ACCOUNT_LIMIT = 5000;

export const MOCK_STATEMENT: StatementGroup[] = [
  {
    date: '12 de julho',
    items: [
      { id: 't1', name: 'ifd*ifood', kind: 'compra no débito', value: -50.0, date: '12 de julho' },
      { id: 't2', name: 'Pix recebido · Ana Lima', kind: 'pix', value: 350.0, date: '12 de julho' },
    ],
  },
  {
    date: '10 de julho',
    items: [
      { id: 't3', name: 'Mercado Central', kind: 'compra no débito', value: -86.4, date: '10 de julho' },
      { id: 't4', name: 'Enel · conta de luz', kind: 'pagamento', value: -214.9, date: '10 de julho' },
    ],
  },
  {
    date: '05 de julho',
    items: [
      { id: 't5', name: 'Salário · Acme Ltda', kind: 'ted recebida', value: 9800.0, date: '05 de julho' },
      { id: 't6', name: 'CDB liquidez diária', kind: 'investimento', value: -1500.0, date: '05 de julho' },
    ],
  },
];

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
  month: 'Julho',
  income: 9800.0,
  invested: 1500.0,
  expenses: 2300.0,
};

export const MOCK_BILLS: Bill[] = [
  { id: 'b1', description: 'Aluguel julho', dueDate: 'vence dia 08/08', value: 2550.0 },
];

export const PIX_KEY_TYPES: PixKeyTypeOption[] = [
  { id: 'cpf', label: 'CPF/CNPJ', placeholder: '000.000.000-00' },
  { id: 'celular', label: 'Celular', placeholder: '(11) 90000-0000' },
  { id: 'email', label: 'E-mail', placeholder: 'nome@email.com' },
  { id: 'aleatoria', label: 'Chave aleatória', placeholder: 'a1b2c3d4-...' },
];

export const BANKS = [
  '001 · Banco do Brasil',
  '237 · Bradesco',
  '341 · Itaú Unibanco',
  '104 · Caixa Econômica',
  '260 · Nu Pagamentos',
  '290 · PagBank',
];

export const FAQS: Faq[] = [
  {
    question: 'Qual o limite do Pix?',
    answer:
      'O limite padrão é de R$ 5.000,00 por transação durante o dia e R$ 1.000,00 no período noturno (20h às 6h). Você pode ajustar seus limites na área de segurança.',
  },
  {
    question: 'Quanto custa fazer uma TED?',
    answer: 'Nada. TEDs enviadas pelo internet banking são gratuitas, sem limite de quantidade.',
  },
  {
    question: 'Esqueci minha senha, e agora?',
    answer:
      'Na tela de login, toque em "Esqueci minha senha". Você receberá um link de redefinição no e-mail cadastrado.',
  },
  {
    question: 'Como altero meus dados cadastrais?',
    answer:
      'Por segurança, alterações de dados cadastrais são feitas pelo chat de atendimento, disponível todos os dias das 8h às 22h.',
  },
];
