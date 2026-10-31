import React from 'react';
import { CheckCircle2, Clock, CircleAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { StudyStats } from '../types/study';

interface GoalStatsProps {
  stats: StudyStats;
  onFilterByStatus?: (status: 'todos' | 'nao_iniciado' | 'em_andamento' | 'concluido') => void;
  onOpenNotifications?: () => void;
  activeStatusFilter: string;
}

export const GoalStats: React.FC<GoalStatsProps> = ({
  stats,
  onFilterByStatus,
  onOpenNotifications,
  activeStatusFilter,
}) => {
  const getMotivationalMessage = (rate: number, total: number) => {
    if (total === 0) return 'Dê o primeiro passo cadastrando seu primeiro objetivo de estudo!';
    if (rate === 100) return 'Incrível! Você concluiu todos os objetivos planejados. Hora de comemorar ou traçar novas metas!';
    if (rate >= 60) return 'Excelente progresso! Você já superou mais da metade do seu planejamento.';
    if (rate >= 25) return 'Muito bem! O hábito de estudar se constrói dia a dia, com passos constantes.';
    return 'Cada pequeno estudo conta. Foque no próximo passo de 15 a 20 minutos!';
  };

  const totalUrgent = stats.overdueCount + stats.dueTodayCount + stats.dueSoonCount;

  return (
    <section id="resumo" className="space-y-4">
      {/* Progress Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-semibold text-stone-900">
                Seu Ritmo de Aprendizagem
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {getMotivationalMessage(stats.completionRate, stats.total)}
            </p>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            {totalUrgent > 0 && onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200/80 text-xs font-semibold transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{totalUrgent} {totalUrgent === 1 ? 'prazo próximo' : 'prazos próximos'}</span>
              </button>
            )}

            <div className="text-right">
              <span className="text-2xl font-bold text-teal-700 font-mono tabular-nums">
                {stats.completionRate}%
              </span>
              <span className="block text-xs text-stone-500">
                {stats.concluidos} de {stats.total} metas concluídas
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* KPI 4-Card Strip (Interactive filters on click) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => onFilterByStatus?.('todos')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeStatusFilter === 'todos'
              ? 'bg-stone-100/90 border-stone-400 ring-1 ring-stone-400'
              : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="text-xs font-medium text-stone-500">Total de Metas</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-stone-500">cadastradas</span>
          </div>
        </button>

        {/* Não Iniciado */}
        <button
          type="button"
          onClick={() => onFilterByStatus?.('nao_iniciado')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeStatusFilter === 'nao_iniciado'
              ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
              : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span>A Começar</span>
            <CircleAlert className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {stats.naoIniciados}
            </span>
            <span className="text-xs text-stone-500">não iniciados</span>
          </div>
        </button>

        {/* Em Andamento */}
        <button
          type="button"
          onClick={() => onFilterByStatus?.('em_andamento')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeStatusFilter === 'em_andamento'
              ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400'
              : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span>Estudando</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
              {stats.emAndamento}
            </span>
            <span className="text-xs text-stone-500">em andamento</span>
          </div>
        </button>

        {/* Concluídos */}
        <button
          type="button"
          onClick={() => onFilterByStatus?.('concluido')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeStatusFilter === 'concluido'
              ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400'
              : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span>Finalizados</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {stats.concluidos}
            </span>
            <span className="text-xs text-stone-500">concluídos</span>
          </div>
        </button>
      </div>
    </section>
  );
};
