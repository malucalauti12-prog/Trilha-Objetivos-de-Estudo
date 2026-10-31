import React, { useState, useEffect } from 'react';
import { X, RefreshCw, UploadCloud, DownloadCloud, Copy, Check, Smartphone, Laptop, AlertCircle, Loader2 } from 'lucide-react';
import { StudyGoal, StudyCategory } from '../types/study';
import { storageService } from '../services/storageService';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: StudyGoal[];
  categories: StudyCategory[];
  onDataSynced: (goals: StudyGoal[], categories: StudyCategory[]) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  goals,
  categories,
  onDataSynced,
}) => {
  const [syncCode, setSyncCode] = useState<string>(() => storageService.getSyncCode() || '');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen && !syncCode) {
      handleGenerateNewCode();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateNewCode = async () => {
    try {
      const res = await fetch('/api/sync/generate-code', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSyncCode(data.syncCode);
        storageService.saveSyncCode(data.syncCode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePushData = async () => {
    if (!syncCode) return;
    setIsPushing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          goals,
          categories,
        }),
      });

      if (!res.ok) throw new Error('Falha ao enviar dados para a nuvem.');

      const data = await res.json();
      const dateFormatted = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSynced(dateFormatted);
      setMessage({
        type: 'success',
        text: `Nuvem atualizada às ${dateFormatted}! ${data.goalsCount} metas sincronizadas sob o código ${syncCode}.`,
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao sincronizar.' });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    const codeToPull = (inputCode || syncCode).trim().toUpperCase();
    if (!codeToPull) {
      setMessage({ type: 'error', text: 'Informe um código de sincronização.' });
      return;
    }

    setIsPulling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sync/pull/${codeToPull}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Código não encontrado. Verifique se digitou corretamente.');
        }
        throw new Error('Falha ao baixar dados da nuvem.');
      }

      const data = await res.json();
      if (Array.isArray(data.goals)) {
        storageService.saveGoals(data.goals);
        if (Array.isArray(data.categories)) {
          storageService.saveCategories(data.categories);
        }
        storageService.saveSyncCode(codeToPull);
        setSyncCode(codeToPull);
        onDataSynced(data.goals, data.categories || []);

        const dateFormatted = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSynced(dateFormatted);
        setMessage({
          type: 'success',
          text: `Sucesso! ${data.goals.length} objetivos carregados deste dispositivo.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao restaurar dados.' });
    } finally {
      setIsPulling(false);
    }
  };

  const copySyncLink = () => {
    if (!syncCode) return;
    const url = `${window.location.origin}${window.location.pathname}?sync=${syncCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 id="sync-modal-title" className="text-base font-semibold text-stone-900">
                Sincronizar entre Dispositivos
              </h2>
              <p className="text-xs text-stone-500">
                Acesse seus objetivos no celular, tablet ou computador.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {message && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
              {message.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Section 1: Seu Código de Sincronização */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
                Código Deste Dispositivo
              </span>
              <button
                type="button"
                onClick={handleGenerateNewCode}
                className="text-[11px] text-teal-700 hover:underline font-medium cursor-pointer"
              >
                Gerar novo código
              </button>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200">
              <span className="text-lg font-bold font-mono tracking-wider text-teal-800 select-all">
                {syncCode || 'Gerando...'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copySyncLink}
                  className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copiar link com código embutido"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Use este código para conectar seu celular ou outro navegador. Ao clicar em <strong>Enviar para Nuvem</strong>, seus objetivos atuais ficam disponíveis para download.
            </p>

            <button
              type="button"
              onClick={handlePushData}
              disabled={isPushing}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Enviando para a Nuvem...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Enviar Meus Dados para a Nuvem
                </>
              )}
            </button>
          </div>

          {/* Section 2: Conectar com outro código */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs">
            <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px] block">
              Conectar com Código de Outro Dispositivo
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: TRILHA-ABC123"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-stone-50/50"
              />
              <button
                type="button"
                onClick={handlePullData}
                disabled={isPulling}
                className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isPulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                Restaurar
              </button>
            </div>
          </div>

          {/* Device illustration hint */}
          <div className="flex items-center justify-center gap-6 py-2 text-stone-400">
            <div className="flex flex-col items-center gap-1">
              <Laptop className="w-5 h-5 text-stone-600" />
              <span className="text-[10px]">Computador</span>
            </div>
            <RefreshCw className="w-4 h-4 text-teal-600 animate-spin-slow" />
            <div className="flex flex-col items-center gap-1">
              <Smartphone className="w-5 h-5 text-stone-600" />
              <span className="text-[10px]">Smartphone</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
