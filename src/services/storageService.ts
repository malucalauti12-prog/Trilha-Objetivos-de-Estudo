import { StudyGoal, GoalStatus, GoalPriority, StudyCategory, DeadlineAlert } from '../types/study';
import { INITIAL_STUDY_GOALS, DEFAULT_CATEGORIES } from '../data/initialGoals';

const STORAGE_KEY_GOALS = 'trilhaviva_goals_v1';
const STORAGE_KEY_CATEGORIES = 'trilhaviva_categories_v1';
const STORAGE_KEY_SYNC_CODE = 'trilhaviva_sync_code';

export const storageService = {
  // ===================== OBJETIVOS =====================
  getGoals(): StudyGoal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GOALS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar objetivos do localStorage:', error);
    }
    this.saveGoals(INITIAL_STUDY_GOALS);
    return INITIAL_STUDY_GOALS;
  },

  saveGoals(goals: StudyGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Falha ao persistir objetivos no localStorage:', error);
    }
  },

  addGoal(goalData: {
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
    category: string;
    priority: GoalPriority;
  }): StudyGoal {
    const goals = this.getGoals();
    const now = new Date().toISOString();
    const newGoal: StudyGoal = {
      id: 'tv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      title: goalData.title.trim(),
      description: goalData.description.trim(),
      targetDate: goalData.targetDate,
      status: goalData.status,
      category: goalData.category.trim() || 'Geral',
      priority: goalData.priority,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newGoal, ...goals];
    this.saveGoals(updated);
    return newGoal;
  },

  addMultipleGoals(goalsList: Array<{
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
    category: string;
    priority: GoalPriority;
  }>): StudyGoal[] {
    const existing = this.getGoals();
    const now = new Date().toISOString();
    const newGoals: StudyGoal[] = goalsList.map((g, idx) => ({
      id: 'tv_ai_' + (Date.now() + idx) + '_' + Math.random().toString(36).substring(2, 7),
      title: g.title.trim(),
      description: g.description.trim(),
      targetDate: g.targetDate,
      status: g.status,
      category: g.category.trim() || 'Geral',
      priority: g.priority,
      createdAt: now,
      updatedAt: now,
    }));

    const updated = [...newGoals, ...existing];
    this.saveGoals(updated);
    return newGoals;
  },

  updateGoal(updatedGoal: StudyGoal): StudyGoal {
    const goals = this.getGoals();
    const now = new Date().toISOString();
    const goalWithTimestamp = {
      ...updatedGoal,
      title: updatedGoal.title.trim(),
      description: updatedGoal.description.trim(),
      updatedAt: now,
    };

    const updated = goals.map((g) => (g.id === updatedGoal.id ? goalWithTimestamp : g));
    this.saveGoals(updated);
    return goalWithTimestamp;
  },

  deleteGoal(id: string): void {
    const goals = this.getGoals();
    const updated = goals.filter((g) => g.id !== id);
    this.saveGoals(updated);
  },

  updateStatus(id: string, newStatus: GoalStatus): StudyGoal | null {
    const goals = this.getGoals();
    let targetGoal: StudyGoal | null = null;
    const now = new Date().toISOString();

    const updated = goals.map((g) => {
      if (g.id === id) {
        targetGoal = { ...g, status: newStatus, updatedAt: now };
        return targetGoal;
      }
      return g;
    });

    this.saveGoals(updated);
    return targetGoal;
  },

  resetToSamples(): StudyGoal[] {
    this.saveGoals(INITIAL_STUDY_GOALS);
    this.saveCategories(DEFAULT_CATEGORIES);
    return INITIAL_STUDY_GOALS;
  },

  // ===================== CATEGORIAS PERSONALIZADAS =====================
  getCategories(): StudyCategory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar categorias:', e);
    }
    this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: StudyCategory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Falha ao salvar categorias no localStorage:', e);
    }
  },

  addCategory(name: string, color: string): StudyCategory {
    const categories = this.getCategories();
    const newCategory: StudyCategory = {
      id: 'cat_custom_' + Date.now(),
      name: name.trim(),
      color: color || '#0D9488',
      isCustom: true,
    };
    const updated = [...categories, newCategory];
    this.saveCategories(updated);
    return newCategory;
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== id);
    this.saveCategories(updated);
  },

  // ===================== NOTIFICAÇÕES DE PRAZOS PRÓXIMOS =====================
  getDeadlineAlerts(): DeadlineAlert[] {
    const goals = this.getGoals();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts: DeadlineAlert[] = [];

    goals.forEach((goal) => {
      if (goal.status === 'concluido' || !goal.targetDate) return;

      const [y, m, d] = goal.targetDate.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        alerts.push({
          goalId: goal.id,
          title: goal.title,
          category: goal.category,
          targetDate: goal.targetDate,
          daysDiff: diffDays,
          type: 'atrasado',
          message: diffDays === -1 ? 'Prazo expirou ontem!' : `Atrasado há ${Math.abs(diffDays)} dias`,
        });
      } else if (diffDays === 0) {
        alerts.push({
          goalId: goal.id,
          title: goal.title,
          category: goal.category,
          targetDate: goal.targetDate,
          daysDiff: 0,
          type: 'hoje',
          message: 'Vence hoje! Reserve um momento para concluir.',
        });
      } else if (diffDays <= 3) {
        alerts.push({
          goalId: goal.id,
          title: goal.title,
          category: goal.category,
          targetDate: goal.targetDate,
          daysDiff: diffDays,
          type: 'breve',
          message: diffDays === 1 ? 'Vence amanhã' : `Faltam ${diffDays} dias para o prazo`,
        });
      }
    });

    // Ordenar: primeiro os de hoje, depois atrasados, depois os próximos
    return alerts.sort((a, b) => a.daysDiff - b.daysDiff);
  },

  // ===================== SINCRONIZAÇÃO EM NUVEM =====================
  getSyncCode(): string | null {
    return localStorage.getItem(STORAGE_KEY_SYNC_CODE);
  },

  saveSyncCode(code: string): void {
    localStorage.setItem(STORAGE_KEY_SYNC_CODE, code);
  },

  // Exportar JSON
  exportToJSON(): void {
    const payload = {
      app: 'Trilha Viva',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      goals: this.getGoals(),
      categories: this.getCategories(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trilhaviva_objetivos_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Importar JSON
  importFromJSON(file: File): Promise<{ goalsCount: number; categoriesCount: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          let importedGoals: StudyGoal[] = [];
          let importedCategories: StudyCategory[] = [];

          if (Array.isArray(parsed)) {
            // Suporte ao formato antigo v1
            importedGoals = parsed;
          } else if (parsed && Array.isArray(parsed.goals)) {
            // Formato v2
            importedGoals = parsed.goals;
            if (Array.isArray(parsed.categories)) {
              importedCategories = parsed.categories;
            }
          } else {
            return reject(new Error('Formato de arquivo JSON inválido.'));
          }

          this.saveGoals(importedGoals);
          if (importedCategories.length > 0) {
            this.saveCategories(importedCategories);
          }

          resolve({
            goalsCount: importedGoals.length,
            categoriesCount: importedCategories.length,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
      reader.readAsText(file);
    });
  },
};
