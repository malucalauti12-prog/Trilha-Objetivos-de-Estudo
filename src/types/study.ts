export type GoalStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';

export type GoalPriority = 'baixa' | 'media' | 'alta';

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string; // ISO format: YYYY-MM-DD
  status: GoalStatus;
  category: string;
  priority: GoalPriority;
  createdAt: string;
  updatedAt: string;
}

export interface StudyCategory {
  id: string;
  name: string;
  color: string;
  isCustom?: boolean;
}

export type StatusFilter = 'todos' | GoalStatus;
export type SortOption = 'prazo_proximo' | 'prazo_distante' | 'recentes' | 'alfabetica';

export interface StudyStats {
  total: number;
  naoIniciados: number;
  emAndamento: number;
  concluidos: number;
  completionRate: number;
  overdueCount: number;
  dueSoonCount: number;
  dueTodayCount: number;
}

export interface DeadlineAlert {
  goalId: string;
  title: string;
  category: string;
  targetDate: string;
  daysDiff: number;
  type: 'hoje' | 'breve' | 'atrasado';
  message: string;
}

export interface AIPlanRequest {
  topic: string;
  timeframe: string;
  dailyMinutes: number;
  experienceLevel: 'iniciante' | 'intermediario';
}

export interface AIGeneratedGoal {
  title: string;
  description: string;
  category: string;
  daysAhead: number;
  priority: GoalPriority;
  studyTip?: string;
}

export interface SyncData {
  syncCode: string;
  goals: StudyGoal[];
  categories: StudyCategory[];
  lastSyncedAt: string;
}
