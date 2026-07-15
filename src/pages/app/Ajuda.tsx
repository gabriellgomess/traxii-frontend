import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { FAQS } from '../../mocks/db';

export function Ajuda() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="max-w-[640px]">
      <div className="animate-fade-up rounded-[18px] bg-white p-7 shadow-sm">
        <div className="mb-[18px] font-display text-xl font-bold text-ink">
          Como podemos ajudar?
        </div>

        <div className="mb-[22px] flex flex-col gap-2.5">
          {FAQS.map((faq, i) => (
            <div key={faq.question} className="overflow-hidden rounded-[14px] border border-line">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-white p-4 text-left text-sm font-bold text-ink"
              >
                <span className="flex-1">{faq.question}</span>
                <span
                  className="text-lg text-muted transition-transform duration-200"
                  style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ⌄
                </span>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-[13.5px] font-medium leading-relaxed text-muted-2">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-primary p-5">
          <span className="text-white">
            <Icon name="chat" size={28} />
          </span>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-white">
              Precisa falar com a gente?
            </div>
            <div className="text-[12.5px] font-semibold text-white/80">
              Atendimento pelo chat todos os dias, das 8h às 22h.
            </div>
          </div>
          <button className="cursor-pointer rounded-[10px] border-none bg-white px-[18px] py-[11px] text-[13px] font-bold text-primary">
            Abrir chat
          </button>
        </div>
      </div>
    </div>
  );
}
