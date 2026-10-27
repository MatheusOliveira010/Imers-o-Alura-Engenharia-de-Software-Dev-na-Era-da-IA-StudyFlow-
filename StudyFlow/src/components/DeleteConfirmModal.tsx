/**
 * Modal de confirmação segura antes de excluir um objetivo de estudo
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Goal } from '../types/goal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
  onConfirm: (goalId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  goal,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !goal) return null;

  const handleConfirm = () => {
    onConfirm(goal.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden scale-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                Confirmar exclusão
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tem certeza que deseja excluir o objetivo abaixo? Esta ação removerá o item permanentemente do seu histórico.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Destaque do objetivo que será excluído */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Objetivo selecionado
            </p>
            <p className="text-sm font-semibold text-slate-800 line-clamp-2">
              "{goal.title}"
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sim, excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
