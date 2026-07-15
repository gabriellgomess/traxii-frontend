import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';

const MENU: { to: string; end?: boolean; label: string; icon: IconName }[] = [
  { to: '/app', end: true, label: 'home', icon: 'home' },
  { to: '/app/pix', label: 'pix', icon: 'pix' },
  { to: '/app/ted', label: 'ted', icon: 'ted' },
  { to: '/app/extrato', label: 'extrato', icon: 'extrato' },
  { to: '/app/dados', label: 'dados pessoais', icon: 'dados' },
  { to: '/app/ajuda', label: 'ajuda', icon: 'ajuda' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { activeBrand } = useBrand();
  const navigate = useNavigate();
  const firstName = (user?.name ?? '').split(' ')[0];

  return (
    <div className="flex min-h-screen bg-page">
      {/* sidebar wrapper */}
      <div className="relative w-[98px] shrink-0">
        <aside
          className="group/sidebar absolute left-5 top-5 bottom-5 z-50 flex w-[78px] hover:w-[240px] flex-col items-start gap-1.5 rounded-3xl bg-primary hover:bg-primary/65 hover:backdrop-blur-md border border-transparent hover:border-white/10 px-4 py-[18px] transition-all duration-300 ease-in-out overflow-hidden"
          style={{ boxShadow: '0 14px 34px -14px var(--p)' }}
        >
          <div className="mb-3.5 flex h-[46px] w-[46px] shrink-0 items-center justify-center">
            <BrandLogo brand={activeBrand} size={42} inverted />
          </div>
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                'flex h-[46px] w-full cursor-pointer items-center rounded-[14px] text-white transition-all hover:bg-white/20 overflow-hidden ' +
                (isActive ? 'bg-white/30' : 'bg-transparent')
              }
            >
              <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center">
                <Icon name={item.icon} />
              </div>
              <span className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-75 capitalize">
                {item.label}
              </span>
            </NavLink>
          ))}
          <div className="flex-1" />
          <button
            title="sair"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex h-[46px] w-full cursor-pointer items-center rounded-[14px] border-none bg-white/10 text-white hover:bg-white/25 transition-all duration-300 overflow-hidden"
          >
            <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center">
              <Icon name="logout" size={21} />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-75 capitalize">
              sair
            </span>
          </button>
        </aside>
      </div>

      {/* main */}
      <main className="min-w-0 flex-1 px-8 py-[26px]">
        <header className="mb-6 flex items-center gap-3.5">
          <div>
            <div className="font-display text-2xl font-extrabold text-primary">
              Olá, {firstName}
            </div>
            <div className="text-[13px] font-semibold text-muted">
              que bom te ver por aqui!
            </div>
          </div>
          <div className="flex-1" />
          <button className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border-none bg-white text-primary shadow-sm">
            <Icon name="search" size={19} />
          </button>
          <button className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border-none bg-white text-primary shadow-sm">
            <Icon name="bell" size={19} />
          </button>
          <div
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[15px] font-extrabold text-white"
          >
            {firstName.charAt(0)}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
