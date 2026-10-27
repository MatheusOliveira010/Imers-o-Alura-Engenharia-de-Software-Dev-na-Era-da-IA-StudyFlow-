/**
 * Componente de estado vazio (Empty State) acolhedor e encorajador
 */

import React from 'react';
import { BookOpen, Plus, Sparkles, FilterX } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onOpenNewGoalModal: () => void;
  onLoadSamples?: () => void;
  onClearFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onOpenNewGoalModal,
  onLoadSamples,
  onClearFilter,
}) => {
  if (isFiltered) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <FilterX className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Nenhum objetivo encontrado
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Não encontramos nenhum objetivo correspondente aos filtros selecionados. Tente alterar o status ou o termo de busca.
        </p>
        {onClearFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Limpar filtros de busca
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
        <BookOpen className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5">
        Seu espaço de estudos está pronto para começar!
      </h3>
      <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
        Você ainda não cadastrou nenhum objetivo de estudo. Definir metas claras com prazo é o primeiro passo para aprender qualquer matéria com tranquilidade e foco.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenNewGoalModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Meu Primeiro Objetivo</span>
        </button>

        {onLoadSamples && (
          <button
            type="button"
            onClick={onLoadSamples}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Carregar Exemplos Sugeridos</span>
          </button>
        )}
      </div>
    </div>
  );
};
