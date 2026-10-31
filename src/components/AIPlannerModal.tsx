import React, { useState } from 'react';
import { X, Sparkles, Loader2, Plus, Calendar, CheckCircle, Lightbulb, BookOpen, ArrowRight } from 'lucide-react';
import { AIGeneratedGoal } from '../types/study';
import { getDefaultDueDate } from '../utils/dateUtils';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoals: (
    goals: Array<{
      title: string;
      description: string;
      targetDate: string;
      status: 'nao_iniciado';
      category: string;
      priority: 'baixa' | 'media' | 'alta';
    }>
  ) => void;
}

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  onAddGoals,
}) => {
  const [topic, setTopic] = useState('');
  const [timeframe, setTimeframe] = useState('2 semanas');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [experienceLevel, setExperienceLevel] = useState<'iniciante' | 'intermediario'>('iniciante');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOverview, setGeneratedOverview] = useState<string | null>(null);
  const [generatedGoals, setGeneratedGoals] = useState<AIGeneratedGoal[]>([]);
  const [selectedGoalIndexes, setSelectedGoalIndexes] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor, informe o que você gostaria de aprender.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOverview(null);
    setGeneratedGoals([]);

    try {
      const res = await fetch('/api/ai/plan-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          timeframe,
          dailyMinutes,
          experienceLevel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro ao gerar plano com IA.');
      }

      const data = await res.json();
      setGeneratedOverview(data.studyOverview);
      setGeneratedGoals(data.goals || []);
      // Pre-select all generated goals by default
      setSelectedGoalIndexes((data.goals || []).map((_: any, i: number) => i));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha na comunicação com a inteligência artificial.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectGoal = (index: number) => {
    setSelectedGoalIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleImportSelected = () => {
    const selected = generatedGoals.filter((_, idx) => selectedGoalIndexes.includes(idx));
    if (selected.length === 0) return;

    const formatted = selected.map((g) => ({
      title: g.title,
      description: g.studyTip ? `${g.description}\n\n💡 Dica do Mentor: ${g.studyTip}` : g.description,
      targetDate: getDefaultDueDate(g.daysAhead || 5),
      status: 'nao_iniciado' as const,
      category: g.category || 'Geral',
      priority: g.priority || 'media',
    }));

    onAddGoals(formatted);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-base font-semibold text-stone-900">
                Mentor de Planejamento de Estudos com IA
              </h2>
              <p className="text-xs text-stone-500">
                Transforme qualquer tema em uma trilha de passos fáceis para iniciantes.
              </p>
            </div>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Prompt Form */}
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div>
              <label htmlFor="ai-topic" className="block text-xs font-semibold text-stone-700 mb-1">
                O que você quer aprender ou revisar? <span className="text-red-500">*</span>
              </label>
              <input
                id="ai-topic"
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Introdução à Programação em Python, Revolução Industrial, Conversação básica em Inglês..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="ai-timeframe" className="block text-xs font-semibold text-stone-700 mb-1">
                  Tempo Disponível
                </label>
                <select
                  id="ai-timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
                >
                  <option value="1 semana">1 semana</option>
                  <option value="2 semanas">2 semanas</option>
                  <option value="1 mês">1 mês</option>
                  <option value="2 meses">2 meses</option>
                </select>
              </div>

              <div>
                <label htmlFor="ai-minutes" className="block text-xs font-semibold text-stone-700 mb-1">
                  Estudo por Dia
                </label>
                <select
                  id="ai-minutes"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
                >
                  <option value={15}>15 minutos / dia (Ultra leve)</option>
                  <option value={30}>30 minutos / dia (Recomendado)</option>
                  <option value={45}>45 minutos / dia (Focado)</option>
                  <option value={60}>60 minutos / dia (Intensivo)</option>
                </select>
              </div>

              <div>
                <label htmlFor="ai-exp" className="block text-xs font-semibold text-stone-700 mb-1">
                  Seu Nível
                </label>
                <select
                  id="ai-exp"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
                >
                  <option value="iniciante">Iniciante (Do zero absoluto)</option>
                  <option value="intermediario">Já tenho noções básicas</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                A IA divide o conteúdo na técnica dos pequenos passos.
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Criando Plano Pedagógico...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar Trilha com IA
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Results Area */}
          {generatedGoals.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-200 animate-in fade-in duration-200">
              {generatedOverview && (
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Visão do Plano de Estudos:</span>
                    <span>{generatedOverview}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Metas Sugeridas ({generatedGoals.length})
                </h3>
                <span className="text-[11px] text-stone-500">
                  {selectedGoalIndexes.length} de {generatedGoals.length} selecionadas
                </span>
              </div>

              <div className="space-y-2.5">
                {generatedGoals.map((goal, idx) => {
                  const isSelected = selectedGoalIndexes.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectGoal(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-xs'
                          : 'bg-stone-50/60 border-stone-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-stone-300 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {goal.category}
                          </span>
                          <span className="text-[11px] text-stone-400">·</span>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            Prazo: em ~{goal.daysAhead} dias
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                          {goal.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                        {goal.studyTip && (
                          <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1 font-medium bg-amber-50/70 p-1.5 rounded-md border border-amber-200/50">
                            <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                            {goal.studyTip}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {generatedGoals.length > 0 && (
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={selectedGoalIndexes.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Adicionar {selectedGoalIndexes.length} Metas à Trilha
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
