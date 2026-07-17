/**
 * Wizard de abertura de conta PF (mobile first, 6 etapas).
 * O progresso é salvo na API a cada etapa; uuid + token de retomada ficam em
 * sessionStorage, permitindo continuar de onde parou na mesma aba.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '@traxii/shared';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useBrand } from '../../contexts/BrandContext';
import {
  clearOpeningSession,
  fetchOpeningProgress,
  getOpeningSession,
  type OpeningProgress,
} from '../../services/accountOpeningService';
import { DadosPessoaisStep } from './steps/DadosPessoaisStep';
import { EnderecoStep } from './steps/EnderecoStep';
import { DocumentosStep } from './steps/DocumentosStep';
import { ProvaVidaStep } from './steps/ProvaVidaStep';
import { SelfieStep } from './steps/SelfieStep';
import { ConfirmacaoStep } from './steps/ConfirmacaoStep';

const TOTAL_STEPS = 6;

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Dados pessoais', subtitle: 'Conte um pouco sobre você para começar.' },
  2: { title: 'Endereço', subtitle: 'Informe o CEP e confirmamos o restante.' },
  3: { title: 'Documentação', subtitle: 'Envie fotos legíveis dos seus documentos.' },
  4: { title: 'Prova de vida', subtitle: 'Validação rápida com a câmera do dispositivo.' },
  5: { title: 'Selfie', subtitle: 'Uma foto sua para confirmar a identidade.' },
  6: { title: 'Confirmações', subtitle: 'Aceites obrigatórios para finalizar.' },
};

export function AbrirConta() {
  const { activeBrand } = useBrand();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState<OpeningProgress | null>(null);
  const [resuming, setResuming] = useState(getOpeningSession() !== null);
  const [successMessage, setSuccessMessage] = useState('');
  // Captura da prova de vida em andamento (controla o "Cancelar" do cabeçalho)
  const [livenessRunning, setLivenessRunning] = useState(false);

  // Retomada: recupera o progresso salvo na API para a sessão atual
  useEffect(() => {
    if (!getOpeningSession()) return;

    fetchOpeningProgress()
      .then((saved) => {
        setProgress(saved);
        if (saved.status !== 'draft') {
          setSuccessMessage(
            'Seu cadastro já foi enviado e está em análise. Você receberá um retorno em breve.',
          );
        } else {
          setStep(Math.min(Math.max(saved.current_step, 1), TOTAL_STEPS));
        }
      })
      .catch(() => {
        // Sessão expirada/inválida → recomeça do zero
        clearOpeningSession();
        setProgress(null);
        setStep(1);
      })
      .finally(() => setResuming(false));
  }, []);

  function advance(updated: OpeningProgress): void {
    setProgress(updated);
    setLivenessRunning(false);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  function handleSubmitted(updated: OpeningProgress, message: string): void {
    setProgress(updated);
    setSuccessMessage(message);
    clearOpeningSession();
  }

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="min-h-screen bg-page">
      {/* Faixa escura do topo — hero da landing, com brilhos nas cores da marca.
          A borda inferior usa uma sombra extremamente sutil para a troca de
          cor não parecer um corte; a máscara abaixo esmaece os brilhos. */}
      <div className="relative overflow-hidden bg-[#0e0f13] pb-24 shadow-[0_16px_28px_-22px_rgba(14,15,19,0.6)]">
        {/* Brilhos da marca com máscara de esmaecimento: somem gradualmente
            antes da transição de cor, sem criar linha de corte */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 75%)',
          }}
        >
          {/* Véu na cor primária tingindo todo o fundo escuro */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ background: 'linear-gradient(180deg, var(--p), transparent)' }}
          />
          <div
            className="absolute -right-16 -top-24 h-80 w-80 rounded-full opacity-50 blur-[100px]"
            style={{ background: 'var(--p)' }}
          />
          <div
            className="absolute -left-20 -top-10 h-64 w-64 rounded-full opacity-30 blur-[110px]"
            style={{ background: 'var(--p)' }}
          />
          <div
            className="absolute left-1/3 top-8 h-40 w-40 rounded-full opacity-15 blur-[90px]"
            style={{ background: 'var(--s)' }}
          />
        </div>

        <div className="relative mx-auto flex max-w-[640px] items-center gap-2.5 px-5 py-[22px]">
          <BrandLogo brand={activeBrand} size={32} />
          <div className="font-display text-[15px] font-bold text-white">
            {activeBrand.name}
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Fechar e voltar à página inicial"
            className="grid h-9 w-9 cursor-pointer place-items-center text-white/80 hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div className="relative mx-auto max-w-[640px] px-5 pt-1 text-center">
          <div
            className="inline-block rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold tracking-[1.5px] text-white"
            style={{ boxShadow: '0 6px 24px -8px var(--p)' }}
          >
            ABERTURA DE CONTA DIGITAL
          </div>
        </div>
      </div>

      {/* Conteúdo sobreposto à faixa escura */}
      <div className="mx-auto -mt-16 w-full max-w-[640px] px-4 pb-8 sm:px-5">
        {successMessage ? (
          /* Tela final — cadastro enviado */
          <div className="animate-fade-up rounded-[22px] border border-line bg-white p-7 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-[38px]">
            <div className="mb-4 inline-grid h-20 w-20 place-items-center rounded-full bg-positive/10 text-positive">
              <FontAwesomeIcon icon={faCircleCheck} style={{ width: 40, height: 40 }} />
            </div>
            <h1 className="m-0 mb-2.5 font-display text-2xl font-bold text-ink">
              Cadastro enviado!
            </h1>
            <p className="mx-auto m-0 mb-7 max-w-[380px] text-sm font-medium leading-relaxed text-muted-2">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full cursor-pointer rounded-xl border-none bg-primary py-[15px] text-[15px] font-bold text-white hover:brightness-110 sm:w-auto sm:px-10"
            >
              Voltar ao início
            </button>
          </div>
        ) : resuming ? (
          <div className="grid place-items-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <div className="animate-fade-up">
            {/* Card da etapa — flat como os cards da landing (borda fina,
                micro-sombra de acabamento quase imperceptível) */}
            <div className="rounded-[22px] border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-[34px]">
              {/* Voltar à esquerda + bolinhas das etapas centralizadas */}
              <div
                className="mb-6 flex items-center"
                aria-label={`Etapa ${step} de ${TOTAL_STEPS}`}
              >
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLivenessRunning(false);
                      setStep((current) => Math.max(current - 1, 1));
                    }}
                    aria-label="Voltar à etapa anterior"
                    className="grid h-8 w-8 cursor-pointer place-items-center border-none bg-transparent text-slate-ink hover:text-primary"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} style={{ width: 14, height: 14 }} />
                  </button>
                ) : (
                  <div className="h-8 w-8" />
                )}
                <div className="flex flex-1 items-center justify-center gap-2.5">
                  {Array.from({ length: TOTAL_STEPS }, (_, index) => {
                    const dotStep = index + 1;
                    const isFilled = dotStep <= step;
                    return (
                      <span
                        key={dotStep}
                        className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                          isFilled ? 'bg-primary' : 'bg-field'
                        }`}
                      />
                    );
                  })}
                </div>
                {/* Cancelar presente em todas as etapas: interrompe a captura
                    da prova de vida ou sai do wizard */}
                <button
                  type="button"
                  onClick={() => {
                    if (livenessRunning) setLivenessRunning(false);
                    else navigate('/');
                  }}
                  className="cursor-pointer border-none bg-transparent text-[13px] font-bold text-muted-2 hover:text-danger"
                >
                  Cancelar
                </button>
              </div>

              <h1 className="m-0 mb-1 font-display text-[22px] font-bold text-ink">
                {title}
              </h1>
              <p className="m-0 mb-6 text-[13px] font-medium text-muted">{subtitle}</p>

              {step === 1 && <DadosPessoaisStep progress={progress} onDone={advance} />}
              {step === 2 && progress && (
                <EnderecoStep progress={progress} onDone={advance} />
              )}
              {step === 3 && progress && (
                <DocumentosStep progress={progress} onDone={advance} />
              )}
              {step === 4 && progress && (
                <ProvaVidaStep
                  progress={progress}
                  running={livenessRunning}
                  onRunningChange={setLivenessRunning}
                  onDone={advance}
                />
              )}
              {step === 5 && progress && (
                <SelfieStep progress={progress} onDone={advance} />
              )}
              {step === 6 && <ConfirmacaoStep onSubmitted={handleSubmitted} />}
            </div>

            <div className="mt-5 text-center text-[11px] font-medium leading-relaxed text-muted">
              Ambiente seguro · Seus dados são protegidos conforme a LGPD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
