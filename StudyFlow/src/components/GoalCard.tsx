/**
 * Cartão de apresentação individual de um Objetivo de Estudo
 */

import React from 'react';
import { Calendar, Edit3, Trash2, CheckCircle2, Clock, CircleDashed, AlertCircle } from 'lucide-react';
import { Goal, GoalStatus } from '../types/goal';
import { analyzeDeadline, formatDateBR } from '../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDeleteRequest: (goal: Goal) => void;
  onStatusChange: (goalId: string, newStatus: GoalStatus) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDeleteRequest,
  onStatusChange,
}) => {
  const isCompleted = goal.status === 'concluido';
  const deadlineInfo = analyzeDeadline(goal.deadline, isCompleted);

  // Status visual mapping (seguindo regra 60-30-10 e acessibilidade WCAG)
  const statusConfig = {
    nao_iniciado: {
      label: 'Não iniciado',
      icon: CircleDashed,
      badgeClass: 'text-slate-700 bg-slate-100 border-slate-200',
    },
    em_andamento: {
      label: 'Em andamento',
      icon: Clock,
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    concluido: {
      label: 'Concluído',
      icon: CheckCircle2,
      badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
  }[goal.status];

  const StatusIcon = statusConfig.icon;

  return (
    <article
      className={`group relative bg-white border rounded-xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
        isCompleted
          ? 'border-emerald-200/80 bg-emerald-50/20'
          : deadlineInfo.isOverdue
          ? 'border-red-200'
          : 'border-slate-200 hover:border-blue-200'
      }`}
    >
      {/* Topo do cartão: Status & Ações */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Seletor rápido de Status embutido */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${statusConfig.badgeClass}`}
            >
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          {/* Botões de Ação Secundária */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(goal)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Editar este objetivo"
              aria-label={`Editar ${goal.title}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(goal)}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Excluir este objetivo"
              aria-label={`Excluir ${goal.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título do Objetivo */}
        <h3
          className={`text-base font-semibold leading-snug tracking-tight mb-2 ${
            isCompleted ? 'text-slate-600 line-through decoration-slate-400' : 'text-slate-900'
          }`}
        >
          {goal.title}
        </h3>

        {/* Descrição */}
        {goal.description ? (
          <p
            className={`text-sm leading-relaxed mb-4 line-clamp-3 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {goal.description}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400 mb-4">Sem descrição detalhada.</p>
        )}
      </div>

      {/* Rodapé do cartão: Prazo e Alternador Rápido de Status */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Informação de Prazo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Prazo:</span>
          {goal.deadline ? (
            <span
              className={`font-semibold ${
                isCompleted
                  ? 'text-slate-500'
                  : deadlineInfo.isOverdue
                  ? 'text-red-600 flex items-center gap-1'
                  : deadlineInfo.isToday
                  ? 'text-amber-700 font-bold'
                  : 'text-slate-700'
              }`}
            >
              {deadlineInfo.isOverdue && <AlertCircle className="w-3.5 h-3.5 inline text-red-600" />}
              {deadlineInfo.label}
            </span>
          ) : (
            <span className="text-slate-400">Não informado</span>
          )}
        </div>

        {/* Troca Rápida de Status (Dropdown Simples e Acessível) */}
        <div className="flex items-center gap-1.5">
          <label htmlFor={`status-select-${goal.id}`} className="text-slate-500 font-medium sr-only">
            Alterar status
          </label>
          <select
            id={`status-select-${goal.id}`}
            value={goal.status}
            onChange={(e) => onStatusChange(goal.id, e.target.value as GoalStatus)}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="nao_iniciado">Não iniciado</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>
    </article>
  );
};
