/**
 * Formulário Modal para Criar ou Editar Objetivos de Estudo
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Sparkles, Check, Clock, CircleDashed } from 'lucide-react';
import { Goal, GoalFormData, GoalStatus } from '../types/goal';
import { getFutureDateString } from '../utils/dateUtils';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: GoalFormData) => void;
  goalToEdit: Goal | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goalToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<GoalStatus>('nao_iniciado');
  const [errorMessage, setErrorMessage] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Inicializa ou limpa formulário ao abrir ou mudar goalToEdit
  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title);
        setDescription(goalToEdit.description);
        setDeadline(goalToEdit.deadline || '');
        setStatus(goalToEdit.status);
      } else {
        setTitle('');
        setDescription('');
        setDeadline(getFutureDateString(3)); // Padrão: 3 dias à frente
        setStatus('nao_iniciado');
      }
      setErrorMessage('');

      // Foca automaticamente no campo de título
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor, informe o título do seu objetivo de estudo.');
      titleInputRef.current?.focus();
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      deadline,
      status,
    });
    onClose();
  };

  const handleShortcutDeadline = (days: number) => {
    setDeadline(getFutureDateString(days));
  };

  const isEditing = Boolean(goalToEdit);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all scale-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
              {isEditing ? 'Editar Objetivo de Estudo' : 'Cadastrar Novo Objetivo'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Atualize os detalhes do seu plano de aprendizagem'
                : 'Defina o que você vai aprender de forma clara e focada'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Campo: Título */}
          <div>
            <label htmlFor="goal-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título do objetivo <span className="text-blue-600">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Ex.: Aprender a resolver equações de 1º grau"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Campo: Descrição */}
          <div>
            <label htmlFor="goal-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Descrição ou anotações adicionais <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="goal-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Assistir videoaula no YouTube, ler capítulo 2 do livro e resolver os exercícios ímpares."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Grid: Prazo e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prazo */}
            <div>
              <label htmlFor="goal-deadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prazo para concluir
              </label>
              <div className="relative">
                <input
                  id="goal-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                />
              </div>
              {/* Atalhos de data rápida para iniciantes */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-slate-400">Atalhos:</span>
                <button
                  type="button"
                  onClick={() => handleShortcutDeadline(0)}
                  className="text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:underline cursor-pointer"
                >
                  Hoje
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleShortcutDeadline(3)}
                  className="text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:underline cursor-pointer"
                >
                  3 dias
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleShortcutDeadline(7)}
                  className="text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:underline cursor-pointer"
                >
                  1 semana
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status inicial
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'nao_iniciado', label: 'Não iniciado', icon: CircleDashed },
                  { id: 'em_andamento', label: 'Em andamento', icon: Clock },
                  { id: 'concluido', label: 'Concluído', icon: Check },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = status === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatus(item.id as GoalStatus)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dica acolhedora para o estudante */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800 leading-relaxed">
              <strong>Dica de estudo:</strong> Comece com objetivos menores e específicos. É mais fácil estudar 30 minutos hoje do que tentar absorver tudo de uma vez.
            </p>
          </div>

          {/* Ações do Rodapé */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Objetivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
