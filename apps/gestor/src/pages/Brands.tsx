import { useEffect, useState, type ChangeEvent } from 'react';
import { Icon, type Brand } from '@traxii/shared';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import * as brandService from '../services/brandService';

const inputClass =
  'w-full box-border rounded-xl border-[1.5px] border-field p-[13px] text-sm font-semibold text-ink outline-none focus:border-ink';
const labelClass = 'mb-1.5 block text-xs font-bold text-slate-ink';

function emptyBrand(): Brand {
  return {
    id: '',
    name: '',
    domain: '',
    primaryColor: '#1437C9',
    secondaryColor: '#FF7A1A',
    logoUrl: null,
    isActive: true,
  };
}

export function Brands() {
  const { user, logout } = useAdminAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandService
      .listBrands()
      .then(setBrands)
      .catch(() => setError('Não foi possível carregar as empresas.'))
      .finally(() => setLoading(false));
  }, []);

  const editInitial = edit ? (edit.name || '?').charAt(0).toUpperCase() : '?';

  function patch(changes: Partial<Brand>) {
    setEdit((e) => (e ? { ...e, ...changes } : e));
    setError('');
  }

  function startEdit(brand: Brand) {
    setEdit({ ...brand });
    setIsNew(false);
    setLogoFile(null);
    setRemoveLogo(false);
    setError('');
  }

  function startNew() {
    setEdit(emptyBrand());
    setIsNew(true);
    setLogoFile(null);
    setRemoveLogo(false);
    setError('');
  }

  function onLogoFile(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setRemoveLogo(false);
    const reader = new FileReader();
    reader.onload = () => patch({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  function onRemoveLogo() {
    setLogoFile(null);
    setRemoveLogo(true);
    patch({ logoUrl: null });
  }

  async function handleSave() {
    if (!edit) return;
    setSaving(true);
    setError('');
    try {
      const saved = await brandService.saveBrand(edit, { isNew, logoFile, removeLogo });
      setBrands((prev) => {
        const exists = prev.some((b) => b.id === saved.id);
        return exists
          ? prev.map((b) => (b.id === saved.id ? saved : b))
          : [...prev, saved];
      });
      setEdit(saved);
      setIsNew(false);
      setLogoFile(null);
      setRemoveLogo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!edit || isNew) return;
    setError('');
    try {
      await brandService.deleteBrand(edit.id);
      setBrands((prev) => prev.filter((b) => b.id !== edit.id));
      setEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
    }
  }

  return (
    <div className="box-border min-h-screen bg-soft px-8 py-[30px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-center gap-3.5">
          <div>
            <div className="font-display text-2xl font-extrabold text-ink">
              Gerenciador de Whitelabel
            </div>
            <div className="text-[13px] font-semibold text-muted">
              Crie clientes, defina cores e logotipo — a dist genérica puxa o tema pelo
              domínio.
            </div>
          </div>
          <div className="flex-1" />
          <div className="text-[13px] font-semibold text-muted">{user?.name}</div>
          <button
            onClick={startNew}
            className="cursor-pointer rounded-xl border-none bg-ink px-[22px] py-[13px] text-sm font-bold text-white hover:brightness-150"
          >
            + Novo cliente
          </button>
          <button
            onClick={logout}
            title="sair"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border-none bg-white text-danger shadow-sm"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>

        {error && !edit && (
          <div className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-[13px] font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]">
          {/* lista de clientes */}
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="rounded-2xl bg-white p-4 text-[13px] font-semibold text-muted shadow-sm">
                Carregando empresas…
              </div>
            )}
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => startEdit(brand)}
                className="flex cursor-pointer items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm"
                style={{
                  border:
                    '1.5px solid ' +
                    (edit && edit.id === brand.id ? '#16181d' : 'transparent'),
                }}
              >
                {brand.logoUrl ? (
                  <div
                    role="img"
                    aria-label="logo"
                    className="h-11 w-11 rounded-xl bg-soft bg-cover bg-center"
                    style={{ backgroundImage: `url(${brand.logoUrl})` }}
                  />
                ) : (
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl font-display text-xl font-extrabold text-white"
                    style={{ background: brand.primaryColor }}
                  >
                    {(brand.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-ink">{brand.name}</div>
                  <div className="text-xs font-semibold text-muted">{brand.domain}</div>
                </div>
                <div className="flex gap-[5px]">
                  <span
                    className="inline-block h-[18px] w-[18px] rounded-md border border-black/10"
                    style={{ background: brand.primaryColor }}
                  />
                  <span
                    className="inline-block h-[18px] w-[18px] rounded-md border border-black/10"
                    style={{ background: brand.secondaryColor }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* edição + preview */}
          {edit ? (
            <div className="flex min-w-0 flex-col gap-[22px]">
              <div className="rounded-[18px] bg-white p-[26px] shadow-sm">
                <div className="mb-5 font-display text-[17px] font-bold text-ink">
                  {isNew ? 'Novo cliente' : `Editar cliente — ${edit.name || 'sem nome'}`}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nome do cliente</label>
                    <input
                      value={edit.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      placeholder="Ex.: Nexustech"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Domínio onde a dist vai rodar</label>
                    <input
                      value={edit.domain}
                      onChange={(e) => patch({ domain: e.target.value })}
                      placeholder="banco.nexustech.com.br"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cor primária</label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={edit.primaryColor}
                        onChange={(e) => patch({ primaryColor: e.target.value })}
                        className="h-[46px] w-[46px] flex-none cursor-pointer rounded-xl border-[1.5px] border-field bg-white p-1"
                      />
                      <input
                        value={edit.primaryColor}
                        onChange={(e) => patch({ primaryColor: e.target.value })}
                        className="box-border w-full flex-1 rounded-xl border-[1.5px] border-field p-[13px] font-mono text-[13px] font-semibold uppercase outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cor secundária</label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={edit.secondaryColor}
                        onChange={(e) => patch({ secondaryColor: e.target.value })}
                        className="h-[46px] w-[46px] flex-none cursor-pointer rounded-xl border-[1.5px] border-field bg-white p-1"
                      />
                      <input
                        value={edit.secondaryColor}
                        onChange={(e) => patch({ secondaryColor: e.target.value })}
                        className="box-border w-full flex-1 rounded-xl border-[1.5px] border-field p-[13px] font-mono text-[13px] font-semibold uppercase outline-none"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Logotipo</label>
                    <div className="flex flex-wrap items-center gap-3.5">
                      {edit.logoUrl ? (
                        <div
                          role="img"
                          aria-label="logo"
                          className="h-14 w-14 rounded-[14px] border border-line bg-soft bg-cover bg-center"
                          style={{ backgroundImage: `url(${edit.logoUrl})` }}
                        />
                      ) : (
                        <div
                          className="grid h-14 w-14 place-items-center rounded-[14px] font-display text-2xl font-extrabold text-white"
                          style={{ background: edit.primaryColor }}
                        >
                          {editInitial}
                        </div>
                      )}
                      <label className="cursor-pointer rounded-xl border-[1.5px] border-dashed border-[#b9c0d0] bg-[#fafbfd] px-5 py-[13px] text-[13px] font-bold text-slate-ink">
                        Enviar imagem
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onLogoFile}
                          className="hidden"
                        />
                      </label>
                      {edit.logoUrl && (
                        <button
                          onClick={onRemoveLogo}
                          className="cursor-pointer border-none bg-transparent text-[13px] font-bold text-danger"
                        >
                          remover
                        </button>
                      )}
                      <div className="text-xs font-semibold text-muted">
                        Sem logo, usamos a inicial do nome sobre a cor primária. Máx. 2 MB.
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-[13px] font-semibold text-danger">{error}</div>
                )}

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="cursor-pointer rounded-xl border-none bg-ink px-[26px] py-3.5 text-sm font-bold text-white hover:brightness-150 disabled:opacity-60"
                  >
                    {saving ? 'Salvando…' : 'Salvar cliente'}
                  </button>
                  <div className="flex-1" />
                  {!isNew && brands.length > 1 && (
                    <button
                      onClick={handleDelete}
                      className="cursor-pointer border-none bg-transparent text-[13px] font-bold text-danger"
                    >
                      Excluir cliente
                    </button>
                  )}
                </div>
              </div>

              {/* preview ao vivo */}
              <div className="rounded-[18px] bg-white p-[26px] shadow-sm">
                <div className="mb-4 text-[13px] font-bold tracking-[1px] text-muted">
                  PREVIEW AO VIVO
                </div>
                <div className="flex gap-3.5 rounded-2xl bg-page p-[18px]">
                  <div
                    className="flex w-[54px] flex-col items-center gap-2 rounded-2xl py-3"
                    style={{ background: edit.primaryColor }}
                  >
                    {edit.logoUrl ? (
                      <div
                        role="img"
                        aria-label="logo"
                        className="h-[30px] w-[30px] rounded-lg bg-white bg-cover bg-center"
                        style={{ backgroundImage: `url(${edit.logoUrl})` }}
                      />
                    ) : (
                      <div
                        className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-white font-display text-sm font-extrabold"
                        style={{ color: edit.primaryColor }}
                      >
                        {editInitial}
                      </div>
                    )}
                    <div className="h-[26px] w-[26px] rounded-lg bg-white/30" />
                    <div className="h-[26px] w-[26px] rounded-lg" />
                    <div className="h-[26px] w-[26px] rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="mb-0.5 font-display text-base font-extrabold"
                      style={{ color: edit.primaryColor }}
                    >
                      Olá, Samuel
                    </div>
                    <div className="mb-3 text-[11px] font-semibold text-muted">
                      que bom te ver por aqui!
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3.5">
                        <div className="text-[11px] font-bold text-muted">
                          saldo em conta
                        </div>
                        <div className="my-0.5 mb-2 font-display text-[17px] font-extrabold text-ink">
                          R$ 8.421,10
                        </div>
                        <div
                          className="text-[11px] font-bold"
                          style={{ color: edit.primaryColor }}
                        >
                          conferir extrato ›
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-3.5"
                        style={{ background: edit.primaryColor }}
                      >
                        <div className="mb-2 text-[11px] font-bold text-white">
                          atalhos
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-white"
                            style={{ color: edit.primaryColor }}
                          >
                            <Icon name="pix" size={15} />
                          </div>
                          <div
                            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-white"
                            style={{ color: edit.primaryColor }}
                          >
                            <Icon name="ted" size={15} />
                          </div>
                          <div
                            className="h-[34px] w-[34px] rounded-[9px]"
                            style={{ background: edit.secondaryColor }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2.5">
                      <button
                        className="rounded-full border-none px-[18px] py-[9px] text-[11px] font-bold text-white"
                        style={{ background: edit.primaryColor }}
                      >
                        Acessar Internet Banking
                      </button>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: edit.secondaryColor }}
                      >
                        sem tarifas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid rounded-[18px] border-[1.5px] border-dashed border-[#c6ccda] p-[60px] text-center">
              <div>
                <div className="mb-1.5 text-base font-bold text-slate-ink">
                  Selecione um cliente para editar
                </div>
                <div className="text-[13px] font-semibold text-muted">
                  ou crie um novo com o botão acima. As alterações aparecem no preview ao
                  vivo.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
