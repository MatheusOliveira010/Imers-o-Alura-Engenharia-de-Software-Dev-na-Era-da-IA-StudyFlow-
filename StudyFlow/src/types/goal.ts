/**
 * Definições de tipos de dados para o StudyFlow
 */

export type GoalStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string; // Formato YYYY-MM-DD
  status: GoalStatus;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type GoalFormData = {
  title: string;
  description: string;
  deadline: string;
  status: GoalStatus;
};

export type GoalFilter = 'todos' | GoalStatus;
