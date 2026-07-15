import { useAuth } from '../../contexts/AuthContext';

function Field({
  label,
  value,
  full = false,
  noBorder = false,
}: {
  label: string;
  value: string;
  full?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div
      className={
        'py-3.5 ' +
        (noBorder ? '' : 'border-b border-soft ') +
        (full ? 'col-span-2' : '')
      }
    >
      <div className="mb-1 text-[11px] font-bold tracking-[.5px] text-muted">
        {label}
      </div>
      <div className="text-sm font-bold text-ink">{value}</div>
    </div>
  );
}

export function Dados() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-[640px]">
      <div className="animate-fade-up rounded-[18px] bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div
            className="grid h-[60px] w-[60px] place-items-center rounded-full bg-primary text-2xl font-extrabold text-white"
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-display text-xl font-bold text-ink">{user.name}</div>
            <div className="text-[13px] font-semibold text-muted">
              Cliente desde {user.customerSince}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          <Field label="CPF" value={user.cpf} />
          <Field label="DATA DE NASCIMENTO" value={user.birthDate} />
          <Field label="E-MAIL" value={user.email} />
          <Field label="CELULAR" value={user.phone} />
          <Field label="ENDEREÇO" value={user.address} full />
          <Field label="AGÊNCIA" value={user.agency} noBorder />
          <Field label="CONTA" value={user.account} noBorder />
        </div>

        <div className="mt-4 rounded-[10px] bg-primary-soft px-4 py-3 text-[12.5px] font-semibold text-primary">
          Para alterar seus dados cadastrais, fale com a gente pelo chat na aba Ajuda.
        </div>
      </div>
    </div>
  );
}
