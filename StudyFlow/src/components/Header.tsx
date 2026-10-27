/**
 * Cabeçalho principal da aplicação StudyFlow
 */

import React from 'react';
import { BookOpen, Plus, Compass } from 'lucide-react';

interface HeaderProps {
  onOpenNewGoalModal: () => void;
  totalGoalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewGoalModal, totalGoalsCount }) => {
  return (
    <header className="border-b border-slate-200/80 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Marca / Identidade */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">StudyFlow</span>
              <span className="hidden sm:inline-block text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Guia do Estudante
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Organize seus estudos passo a passo, no seu próprio ritmo
            </p>
          </div>
        </div>

        {/* Ação Primária */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewGoalModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Objetivo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
