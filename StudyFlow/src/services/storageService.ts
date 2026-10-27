/**
 * Serviço de Armazenamento Local (localStorage) para o StudyFlow
 */

import { Goal, GoalFormData } from '../types/goal';
import { getFutureDateString } from '../utils/dateUtils';

const STORAGE_KEY = 'studyflow_goals_v1';

export const SAMPLE_GOALS: Goal[] = [
  {
    id: 'sample-1',
    title: 'Dominar a estrutura básica de HTML e CSS',
    description: 'Criar uma página pessoal simples usando tags semânticas, flexbox e layout responsivo.',
    deadline: getFutureDateString(3),
    status: 'em_andamento',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Revisar conceitos fundamentais de Matemática',
    description: 'Praticar 15 exercícios de frações, porcentagem e regra de três para fixar a base.',
    deadline: getFutureDateString(7),
    status: 'nao_iniciado',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Configurar ambiente de estudos e cronograma',
    description: 'Organizar espaço silencioso, baixar materiais didáticos e definir 45 minutos diários de estudo.',
    deadline: getFutureDateString(0),
    status: 'concluido',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const storageService = {
  /**
   * Obtém todos os objetivos salvos no localStorage
   */
  getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.error('Erro ao ler objetivos do localStorage:', error);
      return [];
    }
  },

  /**
   * Grava a lista completa de objetivos no localStorage
   */
  saveGoals(goals: Goal[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      return true;
    } catch (error) {
      console.error('Erro ao salvar objetivos no localStorage:', error);
      return false;
    }
  },

  /**
   * Cadastra um novo objetivo de estudo
   */
  addGoal(formData: GoalFormData): Goal {
    const currentGoals = this.getGoals();
    const newGoal: Goal = {
      id: 'goal_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newGoal, ...currentGoals];
    this.saveGoals(updatedList);
    return newGoal;
  },

  /**
   * Atualiza um objetivo existente
   */
  updateGoal(id: string, updates: Partial<GoalFormData>): Goal | null {
    const currentGoals = this.getGoals();
    const index = currentGoals.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const existing = currentGoals[index];
    const updatedGoal: Goal = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      updatedAt: new Date().toISOString(),
    };

    currentGoals[index] = updatedGoal;
    this.saveGoals(currentGoals);
    return updatedGoal;
  },

  /**
   * Remove um objetivo pelo ID
   */
  deleteGoal(id: string): boolean {
    const currentGoals = this.getGoals();
    const filtered = currentGoals.filter((g) => g.id !== id);
    if (filtered.length === currentGoals.length) {
      return false;
    }
    this.saveGoals(filtered);
    return true;
  },

  /**
   * Alterna rapidamente o status de um objetivo (para conveniência do estudante)
   */
  toggleStatus(id: string, newStatus: Goal['status']): Goal | null {
    return this.updateGoal(id, { status: newStatus });
  },

  /**
   * Popula dados iniciais de exemplo caso o armazenamento esteja vazio e o usuário deseje
   */
  loadSampleGoals(): Goal[] {
    this.saveGoals(SAMPLE_GOALS);
    return SAMPLE_GOALS;
  },

  /**
   * Limpa todos os dados salvos
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  },
};
