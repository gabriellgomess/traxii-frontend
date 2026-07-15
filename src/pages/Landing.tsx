import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { BrandLogo } from '../components/BrandLogo';
import { useBrand } from '../contexts/BrandContext';

const FEATURES = [
  {
    icon: 'pix',
    title: 'Pix em segundos',
    text: 'Transfira a qualquer hora, todos os dias, sem custo e com comprovante na hora.',
  },
  {
    icon: 'ted',
    title: 'TED sem tarifa',
    text: 'Envie para qualquer banco em horário comercial, sem pagar nada por isso.',
  },
  {
    icon: 'extrato',
    title: 'Extrato inteligente',
    text: 'Acompanhe entradas e saídas em tempo real, com filtros e busca.',
  },
] as const;

export function Landing() {
  const { activeBrand } = useBrand();
  const navigate = useNavigate();

  return (
    <div>
      {/* hero escuro */}
      <div className="bg-[#0e0f13] text-white">
        <nav className="mx-auto flex max-w-[1180px] items-center gap-9 px-8 py-[26px]">
          <div className="flex items-center gap-2.5">
            <BrandLogo brand={activeBrand} size={36} />
            <div className="font-display text-[17px] font-bold">{activeBrand.name}</div>
          </div>
          <div className="hidden gap-[26px] text-[13px] font-semibold text-white/75 md:flex">
            <span className="cursor-pointer hover:text-white">Conta</span>
            <span className="cursor-pointer hover:text-white">Pix</span>
            <span className="cursor-pointer hover:text-white">Transferências</span>
            <span className="cursor-pointer hover:text-white">Sobre nós</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer rounded-full border-none bg-primary px-[22px] py-[11px] text-[13px] font-bold text-white hover:brightness-110"
          >
            Internet Banking
          </button>
        </nav>

        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-8 pb-[90px] pt-[54px] lg:grid-cols-[1.1fr_.9fr]">
          <div className="animate-fade-up">
            <div className="mb-[26px] inline-block rounded-full border border-white/20 px-3.5 py-1.5 text-[11px] font-semibold tracking-[1.5px] text-white/70">
              CONTA DIGITAL COMPLETA
            </div>
            <h1 className="m-0 mb-5 font-display text-[54px] font-bold leading-[1.08]">
              Seu dinheiro, <span className="text-secondary">sem tarifas</span> e sem
              complicação.
            </h1>
            <p className="m-0 mb-[34px] max-w-[480px] text-[17px] font-medium leading-relaxed text-white/65">
              Pix, TED e extrato em tempo real. Abra sua conta em minutos e acesse de
              onde estiver.
            </p>
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate('/login')}
                className="cursor-pointer rounded-full border-none bg-primary px-[30px] py-4 text-[15px] font-bold text-white hover:brightness-110"
                style={{ boxShadow: '0 8px 30px -6px var(--p)' }}
              >
                Acessar Internet Banking
              </button>
              <button className="cursor-pointer rounded-full border border-white/25 bg-transparent px-[26px] py-4 text-sm font-semibold text-white hover:border-white">
                Abrir conta grátis
              </button>
            </div>
          </div>

          {/* mock de cards flutuantes */}
          <div className="relative hidden h-[420px] animate-fade-up lg:block">
            <div className="absolute bottom-[30px] right-10 h-[300px] w-[300px] rounded-full bg-primary opacity-90" />
            <div className="absolute left-[30px] top-2.5 w-[270px] -rotate-4 rounded-[22px] bg-white p-[22px] text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)]">
              <div className="text-[11px] font-semibold text-muted">Saldo total</div>
              <div className="mb-4 mt-1 font-display text-[30px] font-bold">
                R$ 8.421,10
              </div>
              <div className="mb-[18px] h-2 overflow-hidden rounded-full bg-page">
                <div className="h-full w-[64%] bg-primary" />
              </div>
              <div className="mb-2.5 text-xs font-bold">Transações</div>
              <div className="flex flex-col gap-2.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-2">Mercado Central</span>
                  <span>-R$ 86,40</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-2">Pix recebido</span>
                  <span className="text-primary">+R$ 350,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-2">Conta de luz</span>
                  <span>-R$ 214,90</span>
                </div>
              </div>
            </div>
            <div
              className="absolute right-2.5 top-[60px] box-border h-[118px] w-[190px] rotate-6 rounded-2xl p-4 shadow-[0_24px_50px_-18px_rgba(0,0,0,.7)]"
              style={{ background: 'linear-gradient(135deg, var(--p), var(--s))' }}
            >
              <div className="font-display text-[13px] font-bold text-white">
                {activeBrand.name}
              </div>
              <div className="mt-[38px] text-[13px] font-semibold tracking-[2px] text-white/90">
                •••• 2692
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* features */}
      <div className="bg-white">
        <div className="mx-auto max-w-[1180px] px-8 py-[70px]">
          <h2 className="m-0 mb-9 font-display text-[30px] font-bold text-ink">
            Tudo que você precisa, em um só lugar
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-[18px] border border-line p-7">
                <div className="mb-[18px] grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={f.icon} />
                </div>
                <div className="mb-2 text-[17px] font-bold text-ink">{f.title}</div>
                <div className="text-sm font-medium leading-relaxed text-muted-2">
                  {f.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-8 py-7">
            <div className="font-display text-sm font-bold text-ink">
              {activeBrand.name}
            </div>
            <div className="text-xs font-medium text-muted">
              {activeBrand.domain} · Instituição de pagamento autorizada pelo Banco
              Central do Brasil
            </div>
            <div className="flex-1" />
            <div className="text-xs font-medium text-muted">
              Ouvidoria 0800 000 0000 · SAC 24h
            </div>
            <Link to="/admin" className="text-xs font-medium text-muted no-underline hover:text-ink">
              admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
