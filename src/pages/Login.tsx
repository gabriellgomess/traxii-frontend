import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';

export function Login() {
  const { activeBrand } = useBrand();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ cpf, password });
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? '/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full box-border rounded-xl border-[1.5px] border-field px-3.5 py-[13px] text-sm font-semibold text-ink outline-none focus:border-primary';

  return (
    <div className="grid min-h-screen place-items-center bg-soft px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-[400px] max-w-full animate-fade-up rounded-[22px] bg-white p-[38px] shadow-[0_20px_50px_-20px_rgba(20,30,60,.25)]"
      >
        <div className="mb-[26px] flex items-center gap-2.5">
          <BrandLogo brand={activeBrand} size={40} />
          <div className="font-display text-lg font-bold text-ink">
            {activeBrand.name}
          </div>
        </div>
        <div className="mb-1.5 font-display text-[22px] font-bold text-ink">
          Acesse sua conta
        </div>
        <div className="mb-6 text-[13px] font-medium text-muted">
          Use seu CPF e a senha do internet banking.
        </div>

        <label className="mb-1.5 block text-xs font-bold text-slate-ink">CPF</label>
        <input
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
          className={inputClass + ' mb-4'}
        />

        <label className="mb-1.5 block text-xs font-bold text-slate-ink">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass + ' mb-2'}
        />

        {error && (
          <div className="mb-1 text-xs font-semibold text-danger">{error}</div>
        )}
        <div className="mb-[22px] mt-1.5 cursor-pointer text-xs font-semibold text-primary">
          Esqueci minha senha
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full cursor-pointer border-none bg-transparent pt-3.5 text-[13px] font-semibold text-muted-2"
        >
          ← Voltar ao site
        </button>
      </form>
    </div>
  );
}
