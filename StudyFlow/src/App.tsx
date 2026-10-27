/**
 * StudyFlow - Aplicação Web para Organização de Objetivos de Estudo
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsSummary } from './components/StatsSummary';
import { GoalList } from './components/GoalList';
import { GoalFormModal } from './components/GoalFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { storageService } from './services/storageService';
import { Goal, GoalFormData, GoalStatus } from './types/goal';
import { Check, Info, Sparkles } from 'lucide-react';

export default function App() {
  // Estado principal dos objetivos
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Estados de modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Feedback toast temporário
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Carrega objetivos do localStorage na montagem
  useEffect(() => {
    const loaded = storageService.getGoals();
    setGoals(loaded);
    setIsInitialized(true);
  }, []);

  // Handler: Abrir modal de criação
  const handleOpenNewGoalModal = () => {
    setGoalToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handler: Abrir modal de edição
  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsFormModalOpen(true);
  };

  // Handler: Submeter formulário (criação ou edição)
  const handleFormSubmit = (formData: GoalFormData) => {
    if (goalToEdit) {
      // Edição
      const updated = storageService.updateGoal(goalToEdit.id, formData);
      if (updated) {
        setGoals((prev) =>
          prev.map((g) => (g.id === goalToEdit.id ? updated : g))
        );
        showToast('Objetivo atualizado com sucesso!');
      }
    } else {
      // Criação
      const created = storageService.addGoal(formData);
      setGoals((prev) => [created, ...prev]);
      showToast('Objetivo cadastrado com sucesso!');
    }
  };

  // Handler: Solicitar exclusão (abre o modal de confirmação)
  const handleDeleteRequest = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  };

  // Handler: Confirmar exclusão definitiva
  const handleConfirmDelete = (goalId: string) => {
    const success = storageService.deleteGoal(goalId);
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      showToast('Objetivo excluído com sucesso.');
    }
  };

  // Handler: Alterar status diretamente pelo cartão
  const handleStatusChange = (goalId: string, newStatus: GoalStatus) => {
    const updated = storageService.toggleStatus(goalId, newStatus);
    if (updated) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? updated : g))
      );
      if (newStatus === 'concluido') {
        showToast('Parabéns pela conclusão do objetivo! 🎯');
      } else {
        showToast('Status atualizado.');
      }
    }
  };

  // Handler: Carregar exemplos sugeridos
  const handleLoadSamples = () => {
    const samples = storageService.loadSampleGoals();
    setGoals(samples);
    showToast('Exemplos de objetivos carregados com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Cabeçalho */}
      <Header
        onOpenNewGoalModal={handleOpenNewGoalModal}
        totalGoalsCount={goals.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner acolhedor de boas-vindas */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/15 text-blue-100 mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Planejamento Simplificado</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Qual é a sua meta de aprendizado para hoje?
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
                Estudar com constância é transformar grandes assuntos em pequenos passos diários. Cadastre suas metas, defina um prazo realista e acompanhe sua evolução.
              </p>
            </div>
            {/* Decoração sutil de fundo */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
              <div className="w-96 h-96 rounded-full bg-white blur-3xl transform translate-x-20 -translate-y-20" />
            </div>
          </div>
        </section>

        {/* Resumo de Métricas (Quantidade total e por status) */}
        <StatsSummary goals={goals} />

        {/* Lista e Grade de Objetivos */}
        <GoalList
          goals={goals}
          onEdit={handleEditGoal}
          onDeleteRequest={handleDeleteRequest}
          onStatusChange={handleStatusChange}
          onOpenNewGoalModal={handleOpenNewGoalModal}
          onLoadSamples={handleLoadSamples}
        />
      </main>

      {/* Rodapé institucional acolhedor */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} StudyFlow — Ferramenta de organização de estudos para estudantes iniciantes.</p>
          <p className="text-slate-400">Dados salvos com segurança no armazenamento do seu próprio navegador.</p>
        </div>
      </footer>

      {/* Modal de Cadastro / Edição */}
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        goalToEdit={goalToEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        goal={goalToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Notificação Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
