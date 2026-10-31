import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Plus,
  RotateCcw,
  BookOpen,
  FolderCode,
  Download,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { StudyGoal, GoalStatus, GoalPriority, StudyCategory, StatusFilter, SortOption, StudyStats } from './types/study';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { GoalStats as GoalStatsComponent } from './components/GoalStats';
import { GoalCard } from './components/GoalCard';
import { GoalModal } from './components/GoalModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AIPlannerModal } from './components/AIPlannerModal';
import { SyncModal } from './components/SyncModal';
import { StudyTipsModal } from './components/StudyTipsModal';
import { NotificationPanel } from './components/NotificationPanel';
import { EmptyState } from './components/EmptyState';

export default function App() {
  // Dados principais
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [categories, setCategories] = useState<StudyCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filtros e ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<SortOption>('prazo_proximo');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modais
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<StudyGoal | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<StudyGoal | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Mensagens temporárias de feedback (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Input oculto para importação de JSON
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados iniciais do localStorage
  useEffect(() => {
    const loadedGoals = storageService.getGoals();
    const loadedCategories = storageService.getCategories();
    setGoals(loadedGoals);
    setCategories(loadedCategories);
    setIsLoaded(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cálculo das estatísticas
  const stats: StudyStats = useMemo(() => {
    const total = goals.length;
    const naoIniciados = goals.filter((g) => g.status === 'nao_iniciado').length;
    const emAndamento = goals.filter((g) => g.status === 'em_andamento').length;
    const concluidos = goals.filter((g) => g.status === 'concluido').length;
    const completionRate = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    const alerts = storageService.getDeadlineAlerts();
    const overdueCount = alerts.filter((a) => a.type === 'atrasado').length;
    const dueTodayCount = alerts.filter((a) => a.type === 'hoje').length;
    const dueSoonCount = alerts.filter((a) => a.type === 'breve').length;

    return {
      total,
      naoIniciados,
      emAndamento,
      concluidos,
      completionRate,
      overdueCount,
      dueTodayCount,
      dueSoonCount,
    };
  }, [goals]);

  // Lista de alertas de prazo
  const deadlineAlerts = useMemo(() => {
    return storageService.getDeadlineAlerts();
  }, [goals]);

  // Filtragem e ordenação dos objetivos
  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Busca textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = goal.title.toLowerCase().includes(q);
          const matchDesc = goal.description.toLowerCase().includes(q);
          const matchCat = goal.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Filtro por status
        if (statusFilter !== 'todos' && goal.status !== statusFilter) {
          return false;
        }

        // Filtro por categoria
        if (selectedCategory !== 'todos' && goal.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Filtro por prioridade
        if (selectedPriority !== 'todas' && goal.priority !== selectedPriority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'prazo_proximo') {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return a.targetDate.localeCompare(b.targetDate);
        }
        if (sortBy === 'prazo_distante') {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return b.targetDate.localeCompare(a.targetDate);
        }
        if (sortBy === 'recentes') {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        if (sortBy === 'alfabetica') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [goals, searchQuery, statusFilter, selectedCategory, selectedPriority, sortBy]);

  // Handlers de CRUD de Objetivos
  const handleSaveGoal = (goalData: {
    id?: string;
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
    category: string;
    priority: GoalPriority;
  }) => {
    if (goalData.id) {
      // Atualizar existente
      const updated = storageService.updateGoal({
        id: goalData.id,
        title: goalData.title,
        description: goalData.description,
        targetDate: goalData.targetDate,
        status: goalData.status,
        category: goalData.category,
        priority: goalData.priority,
        createdAt: goalToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      showToast('Objetivo atualizado com sucesso!');
    } else {
      // Adicionar novo
      const newGoal = storageService.addGoal({
        title: goalData.title,
        description: goalData.description,
        targetDate: goalData.targetDate,
        status: goalData.status,
        category: goalData.category,
        priority: goalData.priority,
      });
      setGoals((prev) => [newGoal, ...prev]);
      showToast('Novo objetivo cadastrado com sucesso!');
    }
    setGoalToEdit(null);
    setIsGoalModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: GoalStatus) => {
    const updated = storageService.updateStatus(id, newStatus);
    if (updated) {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      if (newStatus === 'concluido') {
        showToast('Parabéns! Objetivo marcado como concluído! 🎉');
      }
    }
  };

  const handleOpenEdit = (goal: StudyGoal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenDelete = (goal: StudyGoal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      storageService.deleteGoal(goalToDelete.id);
      setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
      setGoalToDelete(null);
      setIsDeleteModalOpen(false);
      showToast('Objetivo removido.');
    }
  };

  // Adicionar objetivos gerados pela IA
  const handleAddAIGoals = (
    newGoalsData: Array<{
      title: string;
      description: string;
      targetDate: string;
      status: 'nao_iniciado';
      category: string;
      priority: GoalPriority;
    }>
  ) => {
    const created = storageService.addMultipleGoals(newGoalsData);
    setGoals((prev) => [...created, ...prev]);
    showToast(`${created.length} objetivos criados com sucesso pela IA!`);
  };

  // Gerenciamento de Categorias
  const handleAddCategory = (name: string, color: string) => {
    const created = storageService.addCategory(name, color);
    setCategories((prev) => [...prev, created]);
    showToast(`Categoria "${name}" adicionada.`);
  };

  const handleDeleteCategory = (id: string) => {
    storageService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Categoria removida.');
  };

  // Importar / Exportar Backup
  const handleExportData = () => {
    storageService.exportToJSON();
    showToast('Download do backup iniciado.');
  };

  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await storageService.importFromJSON(file);
      setGoals(storageService.getGoals());
      setCategories(storageService.getCategories());
      showToast(`Importação concluída: ${result.goalsCount} objetivos carregados.`);
    } catch (err: any) {
      alert(err.message || 'Erro ao importar arquivo JSON.');
    }
  };

  // Restaurar dados de exemplo
  const handleResetToSamples = () => {
    if (confirm('Deseja recarregar os exemplos iniciais de estudo?')) {
      const samples = storageService.resetToSamples();
      setGoals(samples);
      setCategories(storageService.getCategories());
      showToast('Exemplos restaurados com sucesso.');
    }
  };

  // Limpar filtros de busca
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('todos');
    setSelectedCategory('todos');
    setSelectedPriority('todas');
  };

  const isFiltered = searchQuery !== '' || statusFilter !== 'todos' || selectedCategory !== 'todos' || selectedPriority !== 'todas';

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Carregando Trilha Viva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20">
      {/* Input de arquivo invisível para importação */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Notificação Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner de Separação de Projetos */}
      <div className="bg-stone-900 text-stone-300 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">Projeto 1: Trilha Viva</span>
            <span className="text-stone-400">— Gestor de Objetivos (React + Vite + Express + Gemini)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400">
              Projeto 2 isolado em: <code className="bg-stone-800 px-1.5 py-0.5 rounded text-teal-300 font-mono">/calcify</code> (Python)
            </span>
            <a
              href="/calcify/calcify.py"
              download="calcify.py"
              className="text-white hover:text-teal-300 font-semibold underline flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              Baixar calcify.py
            </a>
          </div>
        </div>
      </div>

      {/* Header Oficial da Trilha Viva */}
      <Header
        onOpenNewGoal={() => {
          setGoalToEdit(null);
          setIsGoalModalOpen(true);
        }}
        onOpenTips={() => setIsTipsModalOpen(true)}
        onOpenAIPlanner={() => setIsAIPlannerOpen(true)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        onExportData={handleExportData}
        onImportData={handleTriggerImport}
        goalsCount={goals.length}
        alertsCount={deadlineAlerts.length}
      />

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Faixa de Estatísticas e Progresso */}
        <GoalStatsComponent
          stats={stats}
          activeStatusFilter={statusFilter}
          onFilterByStatus={(st) => setStatusFilter(st)}
          onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        />

        {/* Barra de Filtros, Busca e Exibição */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar objetivos por título, descrição ou categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Ações e Alternância de Visualização */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Ordenação */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs bg-transparent text-stone-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="prazo_proximo">Mais Próximos</option>
                  <option value="prazo_distante">Mais Distantes</option>
                  <option value="recentes">Mais Recentes</option>
                  <option value="alfabetica">Ordem Alfabética</option>
                </select>
              </div>

              {/* Modo de Visualização (Grade / Lista) */}
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-teal-700 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-teal-700 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Visualização em Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros em Pílulas: Categorias & Prioridades */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-stone-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Categoria:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'todos'
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todas ({goals.length})
              </button>
              {categories.map((cat) => {
                const count = goals.filter((g) => g.category.toLowerCase() === cat.name.toLowerCase()).length;
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Resetar filtros se ativo */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista de Objetivos */}
        <section aria-label="Lista de Objetivos de Estudo">
          {filteredGoals.length === 0 ? (
            <EmptyState
              isFiltered={isFiltered}
              onClearFilters={handleClearFilters}
              onOpenNewGoal={() => {
                setGoalToEdit(null);
                setIsGoalModalOpen(true);
              }}
              onLoadSamples={handleResetToSamples}
            />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                  : 'flex flex-col space-y-3'
              }
            >
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  categories={categories}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modais do Ecossistema Trilha Viva */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
        categories={categories}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        goal={goalToDelete}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <AIPlannerModal
        isOpen={isAIPlannerOpen}
        onClose={() => setIsAIPlannerOpen(false)}
        onAddGoals={handleAddAIGoals}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        goals={goals}
        categories={categories}
        onDataSynced={(syncedGoals, syncedCats) => {
          setGoals(syncedGoals);
          setCategories(syncedCats);
          showToast('Sincronização em nuvem realizada com sucesso!');
        }}
      />

      <StudyTipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        alerts={deadlineAlerts}
        onCompleteGoal={(goalId) => handleStatusChange(goalId, 'concluido')}
      />
    </div>
  );
}
