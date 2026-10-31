import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Check } from 'lucide-react';
import { StudyCategory } from '../types/study';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: StudyCategory[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#0D9488', // Teal
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#059669', // Emerald
  '#DC2626', // Red
  '#DB2777', // Pink
  '#4F46E5', // Indigo
  '#0891B2', // Cyan
  '#64748B', // Slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Por favor, informe um nome para a categoria.');
      return;
    }

    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setError('Já existe uma categoria com esse nome.');
      return;
    }

    onAddCategory(trimmed, selectedColor);
    setName('');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" />
            <h2 id="cat-modal-title" className="text-lg font-semibold text-stone-900">
              Categorias de Estudo
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Create Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Criar Nova Categoria
            </h3>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ex: Filosofia, Estatística, Concurso INSS..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* Color Palette Selector */}
            <div>
              <span className="text-[11px] font-medium text-stone-600 block mb-1.5">
                Escolha uma cor para a categoria:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ring-offset-2 ring-stone-400 focus:outline-none"
                    title={color}
                  >
                    {selectedColor === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              Categorias Existentes ({categories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-2.5 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-stone-800 truncate">
                      {cat.name}
                    </span>
                    {cat.isCustom && (
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        Personalizada
                      </span>
                    )}
                  </div>

                  {cat.isCustom && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
