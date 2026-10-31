import React from 'react';
import { Plus, Search, RotateCcw, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
  onOpenNewGoal: () => void;
  onLoadSamples?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onClearFilters,
  onOpenNewGoal,
  onLoadSamples,
}) => {
  if (isFiltered) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-900">
          Nenhum objetivo encontrado com esse filtro
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Tente alterar o termo de busca ou limpar os filtros de status selecionados.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Limpar Filtros de Busca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900">
        Nenhum objetivo de estudo cadastrado ainda
      </h3>
      <p className="text-xs text-stone-500 mt-2 leading-relaxed">
        Grandes conquistas começam com pequenos passos diários. Cadastre sua primeira meta para organizar seu tempo e acompanhar sua evolução!
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onOpenNewGoal}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Cadastrar Meu Primeiro Objetivo
        </button>

        {onLoadSamples && (
          <button
            type="button"
            onClick={onLoadSamples}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            Carregar Exemplos
          </button>
        )}
      </div>
    </div>
  );
};
