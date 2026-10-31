import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Pencil,
  Trash2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { StudyGoal, GoalStatus, StudyCategory } from '../types/study';
import { formatDateBR, getDueStatus } from '../utils/dateUtils';

interface GoalCardProps {
  goal: StudyGoal;
  categories?: StudyCategory[];
  onEdit: (goal: StudyGoal) => void;
  onDelete: (goal: StudyGoal) => void;
  onStatusChange: (id: string, newStatus: GoalStatus) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  categories,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isCompleted = goal.status === 'concluido';
  const dueInfo = getDueStatus(goal.targetDate, isCompleted);

  const matchedCategory = categories?.find((c) => c.name.toLowerCase() === (goal.category || '').toLowerCase());
  const categoryColor = matchedCategory?.color || '#64748B';

  const getStatusDetails = (status: GoalStatus) => {
    switch (status) {
      case 'concluido':
        return {
          label: 'Concluído',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          textColor: 'text-emerald-700',
        };
      case 'em_andamento':
        return {
          label: 'Em andamento',
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          textColor: 'text-blue-700',
        };
      case 'nao_iniciado':
      default:
        return {
          label: 'Não iniciado',
          icon: <Circle className="w-4 h-4 text-stone-400" />,
          textColor: 'text-stone-600',
        };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'Alta prioridade';
      case 'baixa':
        return 'Baixa prioridade';
      case 'media':
      default:
        return 'Média prioridade';
    }
  };

  const handleNextStatus = () => {
    if (goal.status === 'nao_iniciado') {
      onStatusChange(goal.id, 'em_andamento');
    } else if (goal.status === 'em_andamento') {
      onStatusChange(goal.id, 'concluido');
    } else {
      onStatusChange(goal.id, 'em_andamento');
    }
  };

  const statusInfo = getStatusDetails(goal.status);

  return (
    <article
      className={`bg-white border rounded-xl p-5 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between gap-4 ${
        isCompleted
          ? 'border-emerald-200/80 bg-stone-50/50'
          : dueInfo.isOverdue
          ? 'border-red-200 bg-red-50/10'
          : dueInfo.isToday
          ? 'border-amber-300 bg-amber-50/10'
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Unboxed Metadata Line with typographic separators (Zero-pill compliant) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor }}
              aria-hidden="true"
            />
            <span className="font-semibold text-stone-800">{goal.category || 'Geral'}</span>
          </div>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{getPriorityLabel(goal.priority)}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <div className="flex items-center gap-1">
            {statusInfo.icon}
            <span className={`font-medium ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold leading-snug transition-colors ${
            isCompleted
              ? 'text-stone-500 line-through decoration-stone-300'
              : 'text-stone-900'
          }`}
        >
          {goal.title}
        </h3>

        {/* Description */}
        {goal.description && (
          <p
            className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${
              isCompleted ? 'text-stone-400' : 'text-stone-600'
            }`}
          >
            {goal.description}
          </p>
        )}
      </div>

      {/* Footer Area: Target Date & Actions */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Date & Deadline Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-stone-500">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Prazo: {formatDateBR(goal.targetDate)}</span>
          </div>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span
            className={`font-medium flex items-center gap-1 ${
              isCompleted
                ? 'text-emerald-700'
                : dueInfo.isOverdue
                ? 'text-red-700'
                : dueInfo.isDueSoon
                ? 'text-amber-700'
                : 'text-stone-500'
            }`}
          >
            {dueInfo.isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
            {dueInfo.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Quick status progress button */}
          <button
            type="button"
            onClick={handleNextStatus}
            title={
              goal.status === 'nao_iniciado'
                ? 'Iniciar estudo'
                : goal.status === 'em_andamento'
                ? 'Concluir objetivo'
                : 'Reabrir objetivo'
            }
            className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-teal-50 hover:text-teal-800 text-stone-700"
          >
            {goal.status === 'nao_iniciado' && (
              <>
                Começar
                <ArrowRight className="w-3 h-3 text-teal-600" />
              </>
            )}
            {goal.status === 'em_andamento' && (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Concluir
              </>
            )}
            {goal.status === 'concluido' && <>Reabrir</>}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
            title="Editar objetivo"
            aria-label="Editar objetivo"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(goal)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title="Excluir objetivo"
            aria-label="Excluir objetivo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
