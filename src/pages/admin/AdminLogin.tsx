import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const inputClass =
  'w-full box-border rounded-xl border-[1.5px] border-field px-3.5 py-[13px] text-sm font-semibold text-ink outline-none focus:border-ink';

export function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#0e0f13] px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-[400px] max-w-full animate-fade-up rounded-[22px] bg-white p-[38px] shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]"
      >
        <div className="mb-1.5 font-display text-[22px] font-bold text-ink">
          Gerenciador Whitelabel
        </div>
        <div className="mb-6 text-[13px] font-medium text-muted">
          Acesso restrito à administração da plataforma.
        </div>

        <label className="mb-1.5 block text-xs font-bold text-slate-ink">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@empresa.com"
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

        {error && <div className="mb-2 text-xs font-semibold text-danger">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full cursor-pointer rounded-xl border-none bg-ink py-[15px] text-[15px] font-bold text-white hover:brightness-150 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
