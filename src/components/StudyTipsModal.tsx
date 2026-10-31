import React from 'react';
import { X, Lightbulb, Target, CheckCheck, Compass, Sparkles } from 'lucide-react';

interface StudyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTipsModal: React.FC<StudyTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tips-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 id="tips-title" className="text-lg font-semibold text-stone-900">
              Guia Pedagógico para Estudantes Iniciantes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-stone-700 leading-relaxed">
          <p className="text-stone-600">
            Organizar os estudos pela primeira vez pode parecer desafiador. Como especialista em educação, separamos 4 princípios fundamentais para você não desanimar e conquistar consistência:
          </p>

          {/* Principle 1 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">1. A Regra do Passo Menor Possível (Micro-Metas)</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Em vez de criar uma meta enorme como <em>"Aprender toda a matéria para a prova"</em>, quebre em <em>"Ler 5 páginas e resumir em 3 tópicos"</em>. Metas pequenas reduzem a procrastinação e geram vitória rápida.
              </p>
            </div>
          </div>

          {/* Principle 2 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">2. Prazos Amigáveis e Realistas</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Não lote todos os objetivos para amanhã. Dê a si mesmo 2 a 3 dias de margem para imprevistos. O segredo da aprendizagem é o ritmo contínuo, não a pressa exaustiva.
              </p>
            </div>
          </div>

          {/* Principle 3 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <CheckCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">3. Limite de Metas em Andamento (WIP)</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Mantenha no máximo <strong>2 ou 3 objetivos em andamento ao mesmo tempo</strong>. Nosso cérebro perde foco quando tenta abraçar muitos conteúdos simultaneamente.
              </p>
            </div>
          </div>

          {/* Principle 4 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">4. Celebre cada conclusão</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Ao marcar um objetivo como concluído, reconheça o esforço realizado! A sensação de progresso visível alimenta a dopamina saudável e incentiva você a continuar a trilha.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
          >
            Entendido, vamos aos estudos!
          </button>
        </div>
      </div>
    </div>
  );
};
