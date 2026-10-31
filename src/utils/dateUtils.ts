/**
 * Formatação e cálculos de prazos para objetivos de estudo.
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultDueDate(daysAhead: number = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return 'Sem data';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export interface DueStatusInfo {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  isToday: boolean;
}

export function getDueStatus(targetDateStr: string, isCompleted: boolean): DueStatusInfo {
  if (isCompleted) {
    return {
      label: 'Concluído',
      isOverdue: false,
      isDueSoon: false,
      isToday: false,
    };
  }

  if (!targetDateStr) {
    return {
      label: 'Sem prazo',
      isOverdue: false,
      isDueSoon: false,
      isToday: false,
    };
  }

  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const target = new Date(tYear, tMonth - 1, tDay);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      label: daysAgo === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${daysAgo} dias`,
      isOverdue: true,
      isDueSoon: false,
      isToday: false,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Termina hoje!',
      isOverdue: false,
      isDueSoon: true,
      isToday: true,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Falta 1 dia',
      isDueSoon: true,
      isOverdue: false,
      isToday: false,
    };
  }

  if (diffDays <= 3) {
    return {
      label: `Faltam ${diffDays} dias`,
      isDueSoon: true,
      isOverdue: false,
      isToday: false,
    };
  }

  return {
    label: `Faltam ${diffDays} dias`,
    isDueSoon: false,
    isOverdue: false,
    isToday: false,
  };
}
