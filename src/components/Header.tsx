import React from 'react';
import { Plus, BookOpen, Lightbulb, Download, Upload, Bell, Sparkles, Tag, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenNewGoal: () => void;
  onOpenTips: () => void;
  onOpenAIPlanner: () => void;
  onOpenCategoryManager: () => void;
  onOpenSync: () => void;
  onOpenNotifications: () => void;
  onExportData: () => void;
  onImportData: () => void;
  goalsCount: number;
  alertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewGoal,
  onOpenTips,
  onOpenAIPlanner,
  onOpenCategoryManager,
  onOpenSync,
  onOpenNotifications,
  onExportData,
  onImportData,
  goalsCount,
  alertsCount,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
                Trilha Viva
              </h1>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 font-mono tabular-nums">
                {goalsCount} {goalsCount === 1 ? 'meta' : 'metas'}
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-stone-500 whitespace-nowrap">
              Sua Jornada de Estudos Passo a Passo
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Features */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={onOpenAIPlanner}
            className="hover:text-teal-700 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-teal-700 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            Planejar com IA
          </button>

          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="hover:text-stone-900 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-stone-600"
          >
            <Tag className="w-4 h-4 text-stone-400" />
            Categorias
          </button>

          <button
            type="button"
            onClick={onOpenSync}
            className="hover:text-stone-900 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-stone-600"
          >
            <RefreshCw className="w-4 h-4 text-stone-400" />
            Sincronizar
          </button>

          <button
            type="button"
            onClick={onOpenTips}
            className="hover:text-stone-900 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-amber-700"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Dicas
          </button>

          <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
            <button
              type="button"
              onClick={onExportData}
              title="Baixar cópia de segurança em JSON"
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Backup
            </button>
            <button
              type="button"
              onClick={onImportData}
              title="Restaurar objetivos de arquivo JSON"
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar
            </button>
          </div>
        </nav>

        {/* Zone 3: Notification Bell & Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Lembretes de Prazos"
            aria-label="Notificações de prazos"
          >
            <Bell className="w-5 h-5 text-stone-700" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                {alertsCount > 9 ? '9+' : alertsCount}
              </span>
            )}
          </button>

          {/* Quick AI button on mobile/tablet */}
          <button
            type="button"
            onClick={onOpenAIPlanner}
            className="lg:hidden p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
            title="Planejar com IA"
            aria-label="Planejar com IA"
          >
            <Sparkles className="w-5 h-5 text-teal-600" />
          </button>

          {/* Sync button on mobile */}
          <button
            type="button"
            onClick={onOpenSync}
            className="lg:hidden p-2 text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            title="Sincronizar entre dispositivos"
            aria-label="Sincronizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* New Goal Primary CTA */}
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:scale-98 transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Novo Objetivo</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
