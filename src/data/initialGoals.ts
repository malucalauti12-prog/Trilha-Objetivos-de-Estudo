import { StudyGoal, StudyCategory } from '../types/study';
import { getDefaultDueDate } from '../utils/dateUtils';

export const DEFAULT_CATEGORIES: StudyCategory[] = [
  { id: 'cat-geral', name: 'Geral', color: '#64748B' },
  { id: 'cat-prog', name: 'Programação', color: '#0D9488' },
  { id: 'cat-idiomas', name: 'Idiomas', color: '#2563EB' },
  { id: 'cat-mat', name: 'Matemática', color: '#7C3AED' },
  { id: 'cat-leitura', name: 'Leitura', color: '#D97706' },
  { id: 'cat-ciencias', name: 'Ciências', color: '#059669' },
  { id: 'cat-concursos', name: 'Concursos & Provas', color: '#DB2777' },
];

export const INITIAL_STUDY_GOALS: StudyGoal[] = [
  {
    id: 'goal-1',
    title: 'Compreender o conceito básico de Algoritmos',
    description: 'Assistir à videoaula de 20 minutos, anotar as palavras-chave no caderno e resolver 2 exercícios de lógica simples.',
    targetDate: getDefaultDueDate(2),
    status: 'em_andamento',
    category: 'Programação',
    priority: 'alta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    title: 'Ler o Capítulo 1 de Biologia Celular',
    description: 'Fazer leitura ativa sublinhando os principais organoides celulares e montar um mapa mental de 1 página.',
    targetDate: getDefaultDueDate(5),
    status: 'nao_iniciado',
    category: 'Ciências',
    priority: 'media',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-3',
    title: 'Organizar meu cronograma semanal de estudos',
    description: 'Definir 30 minutos diários para revisão e separar um cantinho silencioso para manter o foco.',
    targetDate: getDefaultDueDate(0), // Hoje para demonstrar notificação de prazo próximo!
    status: 'em_andamento',
    category: 'Geral',
    priority: 'alta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-4',
    title: 'Revisar vocabulário básico de Inglês',
    description: 'Praticar 15 flashcards de verbos irregulares e formular 5 frases no caderno.',
    targetDate: getDefaultDueDate(-1), // Exemplo recente concluído
    status: 'concluido',
    category: 'Idiomas',
    priority: 'baixa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const GOAL_TEMPLATES: Array<{
  title: string;
  description: string;
  category: string;
  daysAhead: number;
}> = [
  {
    title: 'Revisar anotações da última aula',
    description: 'Reescrever os tópicos principais com minhas próprias palavras e listar 2 dúvidas para o professor.',
    category: 'Geral',
    daysAhead: 2,
  },
  {
    title: 'Praticar 20 minutos de exercícios práticos',
    description: 'Focar em resolver problemas sem olhar a resposta antes de tentar pelo menos 2 vezes.',
    category: 'Matemática',
    daysAhead: 4,
  },
  {
    title: 'Elaborar fichas de resumo (flashcards)',
    description: 'Criar 10 cartões de perguntas e respostas sobre o conteúdo da semana para fixar a memória.',
    category: 'Leitura',
    daysAhead: 5,
  },
];
