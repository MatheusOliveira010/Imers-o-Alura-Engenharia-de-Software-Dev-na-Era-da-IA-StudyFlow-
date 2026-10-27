/**
 * Lista de Objetivos com Controles de Filtro, Busca e Apresentação em Grade de Cartões
 */

import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { Goal, GoalFilter, GoalStatus } from '../types/goal';
import { GoalCard } from './GoalCard';
import { EmptyState } from './EmptyState';

interface GoalListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDeleteRequest: (goal: Goal) => void;
  onStatusChange: (goalId: string, newStatus: GoalStatus) => void;
  onOpenNewGoalModal: () => void;
  onLoadSamples: () => void;
}

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  onEdit,
  onDeleteRequest,
  onStatusChange,
  onOpenNewGoalModal,
  onLoadSamples,
}) => {
  const [filter, setFilter] = useState<GoalFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'recent'>('deadline');

  // Filtragem e busca
  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Filtro por status
        if (filter !== 'todos' && goal.status !== filter) {
          return false;
        }

        // Busca por texto
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = goal.title.toLowerCase().includes(query);
          const matchDesc = goal.description.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          // Itens sem prazo vão para o final
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        } else {
          // Mais recentes primeiro
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [goals, filter, searchQuery, sortBy]);

  const hasNoGoalsAtAll = goals.length === 0;
  const isFilteredEmpty = !hasNoGoalsAtAll && filteredGoals.length === 0;

  return (
    <section aria-label="Objetivos de estudo">
      {/* Barra de Filtros e Busca (somente quando há objetivos no sistema) */}
      {!hasNoGoalsAtAll && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Control de Filtro de Status */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'nao_iniciado', label: 'A Iniciar' },
              { id: 'em_andamento', label: 'Em Andamento' },
              { id: 'concluido', label: 'Concluídos' },
            ].map((tab) => {
              const isActive = filter === tab.id;
              const count =
                tab.id === 'todos'
                  ? goals.length
                  : goals.filter((g) => g.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as GoalFilter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Busca e Ordenação */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar objetivo..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <label htmlFor="sort-by-select" className="sr-only">
                Ordenar por
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'deadline' | 'recent')}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                <option value="deadline">Prazo mais próximo</option>
                <option value="recent">Mais recentes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Exibição condicional de lista ou empty state */}
      {hasNoGoalsAtAll ? (
        <EmptyState
          isFiltered={false}
          onOpenNewGoalModal={onOpenNewGoalModal}
          onLoadSamples={onLoadSamples}
        />
      ) : isFilteredEmpty ? (
        <EmptyState
          isFiltered={true}
          onOpenNewGoalModal={onOpenNewGoalModal}
          onClearFilter={() => {
            setFilter('todos');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </section>
  );
};
