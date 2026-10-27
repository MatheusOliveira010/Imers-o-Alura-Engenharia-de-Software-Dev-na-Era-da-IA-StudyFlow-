/**
 * Barra de estatísticas e métricas de estudo
 */

import React from 'react';
import { Target, Clock, CheckCircle2, CircleDashed } from 'lucide-react';
import { Goal } from '../types/goal';

interface StatsSummaryProps {
  goals: Goal[];
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ goals }) => {
  const total = goals.length;
  const naoIniciados = goals.filter((g) => g.status === 'nao_iniciado').length;
  const emAndamento = goals.filter((g) => g.status === 'em_andamento').length;
  const concluidos = goals.filter((g) => g.status === 'concluido').length;

  const percentConcluido = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Bloco de progresso geral */}
        <div className="lg:max-w-xs w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Progresso Geral
            </span>
            <span className="text-sm font-semibold text-slate-800 font-mono tabular-nums">
              {percentConcluido}% concluído
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentConcluido}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {total === 0
              ? 'Nenhum objetivo cadastrado no momento.'
              : concluidos === total
              ? 'Parabéns! Todos os objetivos foram concluídos! 🎉'
              : `${concluidos} de ${total} objetivos finalizados`}
          </p>
        </div>

        {/* Grade de cartões de contagem */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {/* Total cadastrado */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Cadastrado</p>
              <p className="text-xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
                {total}
              </p>
            </div>
          </div>

          {/* Não Iniciados */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <CircleDashed className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">A Iniciar</p>
              <p className="text-xl font-bold text-slate-800 font-mono tabular-nums leading-tight">
                {naoIniciados}
              </p>
            </div>
          </div>

          {/* Em Andamento */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-800">Em Andamento</p>
              <p className="text-xl font-bold text-amber-900 font-mono tabular-nums leading-tight">
                {emAndamento}
              </p>
            </div>
          </div>

          {/* Concluídos */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-800">Concluídos</p>
              <p className="text-xl font-bold text-emerald-900 font-mono tabular-nums leading-tight">
                {concluidos}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
