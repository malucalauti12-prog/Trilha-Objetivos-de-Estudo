import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, AlertCircle, Sparkles, Plus, Loader2, Lightbulb } from 'lucide-react';
import { StudyGoal, GoalStatus, GoalPriority, StudyCategory } from '../types/study';
import { getDefaultDueDate, getTodayString } from '../utils/dateUtils';
import { GOAL_TEMPLATES } from '../data/initialGoals';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: {
    id?: string;
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
    category: string;
    priority: GoalPriority;
  }) => void;
  goalToEdit?: StudyGoal | null;
  categories: StudyCategory[];
  onOpenCategoryManager?: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
  categories,
  onOpenCategoryManager,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(getDefaultDueDate(7));
  const [status, setStatus] = useState<GoalStatus>('nao_iniciado');
  const [category, setCategory] = useState('Geral');
  const [priority, setPriority] = useState<GoalPriority>('media');
  const [error, setError] = useState<string | null>(null);

  // AI Refine state
  const [isRefining, setIsRefining] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetDate(goalToEdit.targetDate || getDefaultDueDate(7));
      setStatus(goalToEdit.status || 'nao_iniciado');
      setCategory(goalToEdit.category || 'Geral');
      setPriority(goalToEdit.priority || 'media');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate(getDefaultDueDate(7));
      setStatus('nao_iniciado');
      setCategory(categories[0]?.name || 'Geral');
      setPriority('media');
    }
    setError(null);
    setAiTip(null);
  }, [goalToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Por favor, informe um título para o seu objetivo de estudo.');
      return;
    }

    if (!targetDate) {
      setError('Por favor, defina uma data de conclusão estimada.');
      return;
    }

    onSave({
      id: goalToEdit ? goalToEdit.id : undefined,
      title: trimmedTitle,
      description: description.trim(),
      targetDate,
      status,
      category: category.trim() || 'Geral',
      priority,
    });

    onClose();
  };

  const handleApplyTemplate = (tmpl: {
    title: string;
    description: string;
    category: string;
    daysAhead: number;
  }) => {
    setTitle(tmpl.title);
    setDescription(tmpl.description);
    setCategory(tmpl.category);
    setTargetDate(getDefaultDueDate(tmpl.daysAhead));
    setError(null);
  };

  const handleRefineWithAI = async () => {
    if (!title.trim()) {
      setError('Digite primeiro um título (mesmo que simples) para a IA aprimorar.');
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/refine-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });

      if (!res.ok) throw new Error('Falha ao aprimorar meta com IA.');

      const data = await res.json();
      if (data.refinedTitle) setTitle(data.refinedTitle);
      if (data.refinedDescription) setDescription(data.refinedDescription);
      if (data.suggestedDays) setTargetDate(getDefaultDueDate(data.suggestedDays));
      if (data.suggestedPriority) setPriority(data.suggestedPriority as GoalPriority);
      if (data.pedagogicalTip) setAiTip(data.pedagogicalTip);
    } catch (e: any) {
      console.error(e);
      setError('Não foi possível conectar com o assistente IA no momento.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
              {goalToEdit ? 'Editar Objetivo de Estudo' : 'Cadastrar Novo Objetivo'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Pedagogical Tip Banner */}
          {aiTip && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2 text-xs text-teal-900">
              <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Dica do Mentor IA:</span>
                <span>{aiTip}</span>
              </div>
            </div>
          )}

          {/* Beginner Helper: Suggested Templates (only when creating new goal) */}
          {!goalToEdit && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-stone-700 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sugestões rápidas para começar:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-teal-50 hover:text-teal-800 border border-stone-200 rounded-md transition-colors cursor-pointer text-stone-700 font-medium"
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title with AI Assistant Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="goal-title"
                className="block text-xs font-semibold text-stone-700"
              >
                Título do Objetivo <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleRefineWithAI}
                disabled={isRefining || !title.trim()}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                title="A IA detalha os passos práticos desta meta para você"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Aprimorando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Aprimorar com IA
                  </>
                )}
              </button>
            </div>
            <input
              id="goal-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Entender laços de repetição em Python"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-stone-400 bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Dica: Seja específico. Objetivos curtos e objetivos são mais fáceis de concluir!
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="goal-desc"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Descrição e Passos Práticos
            </label>
            <textarea
              id="goal-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 1. Assistir vídeo de 15 min. 2. Anotar no caderno. 3. Fazer 2 exercícios."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-stone-400 bg-white resize-y"
            />
          </div>

          {/* Row: Target Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Date */}
            <div>
              <label
                htmlFor="goal-date"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Data Estimada de Conclusão <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="goal-date"
                  type="date"
                  required
                  min={getTodayString()}
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="goal-status"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Status de Progresso
              </label>
              <select
                id="goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white cursor-pointer"
              >
                <option value="nao_iniciado">Não iniciado (A Começar)</option>
                <option value="em_andamento">Em andamento (Estudando)</option>
                <option value="concluido">Concluído (Finalizado)</option>
              </select>
            </div>
          </div>

          {/* Row: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="goal-category"
                  className="block text-xs font-semibold text-stone-700"
                >
                  Área / Disciplina
                </label>
                {onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={onOpenCategoryManager}
                    className="text-[11px] text-teal-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Gerenciar
                  </button>
                )}
              </div>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.isCustom ? '(Personalizada)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="goal-priority"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Nível de Prioridade
              </label>
              <select
                id="goal-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white cursor-pointer"
              >
                <option value="baixa">Baixa (Pode esperar)</option>
                <option value="media">Média (Importante)</option>
                <option value="alta">Alta (Prioridade da semana)</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              {goalToEdit ? 'Salvar Alterações' : 'Cadastrar Objetivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
