/**
 * Utilitários de data para exibição em Português do Brasil
 */

export function formatDateBR(dateString: string): string {
  if (!dateString) return 'Sem prazo';
  
  // Trata formato YYYY-MM-DD sem distorção de fuso horário
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export interface DeadlineAnalysis {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  daysRemaining: number;
}

export function analyzeDeadline(deadlineStr: string, isCompleted: boolean): DeadlineAnalysis {
  if (!deadlineStr || isCompleted) {
    return {
      label: formatDateBR(deadlineStr),
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      daysRemaining: 999,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = deadlineStr.split('-');
  let targetDate: Date;
  if (parts.length === 3) {
    targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    targetDate = new Date(deadlineStr);
  }
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${overdueDays} dias`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      daysRemaining: diffDays,
    };
  } else if (diffDays === 0) {
    return {
      label: 'Prazo termina hoje',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      daysRemaining: 0,
    };
  } else if (diffDays === 1) {
    return {
      label: 'Prazo amanhã',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      daysRemaining: 1,
    };
  } else if (diffDays <= 7) {
    return {
      label: `Em ${diffDays} dias (${formatDateBR(deadlineStr)})`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      daysRemaining: diffDays,
    };
  }

  return {
    label: formatDateBR(deadlineStr),
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    daysRemaining: diffDays,
  };
}

/**
 * Retorna uma data no formato YYYY-MM-DD para uso em inputs nativos de tipo date
 */
export function getFutureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
