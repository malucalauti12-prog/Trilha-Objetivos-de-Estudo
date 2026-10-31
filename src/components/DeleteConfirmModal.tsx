import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StudyGoal } from '../types/study';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  goal: StudyGoal | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  goal,
}) => {
  if (!isOpen || !goal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="delete-title" className="text-base font-semibold text-stone-900">
              Excluir este objetivo de estudo?
            </h3>
            <p className="mt-1 text-sm text-stone-600 leading-relaxed">
              Você está prestes a remover o objetivo{' '}
              <strong className="text-stone-900 font-medium">"{goal.title}"</strong>.
              Essa ação não poderá ser desfeita.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  );
};
