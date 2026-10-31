import React, { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, Clock, Calendar, CheckCircle2, Volume2, ShieldCheck } from 'lucide-react';
import { DeadlineAlert } from '../types/study';
import { formatDateBR } from '../utils/dateUtils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: DeadlineAlert[];
  onCompleteGoal: (goalId: string) => void;
  onOpenGoalDetails?: (goalId: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  alerts,
  onCompleteGoal,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Seu navegador não suporta notificações de área de trabalho.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        new Notification('Trilha Viva: Notificações Ativadas!', {
          body: 'Você receberá avisos quando suas metas de estudo estiverem próximas do prazo.',
          icon: '/favicon.ico',
        });
        setTestSent(true);
      }
    } catch (e) {
      console.error('Erro ao pedir permissão de notificação:', e);
    }
  };

  const overdueAlerts = alerts.filter((a) => a.type === 'atrasado');
  const todayAlerts = alerts.filter((a) => a.type === 'hoje');
  const soonAlerts = alerts.filter((a) => a.type === 'breve');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notif-title" className="text-base font-semibold text-stone-900">
                Prazos e Lembretes de Estudo
              </h2>
              <p className="text-xs text-stone-500">
                {alerts.length === 0
                  ? 'Tudo em dia! Nenhuma meta atrasada ou urgente.'
                  : `${alerts.length} ${alerts.length === 1 ? 'meta requer' : 'metas requerem'} sua atenção.`}
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Browser Notification Banner */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-800 block">
                  Lembretes na Área de Trabalho
                </span>
                <span className="text-stone-500 text-[11px]">
                  {notificationPermission === 'granted'
                    ? 'Notificações ativadas no seu navegador.'
                    : 'Receba alertas automáticos mesmo com a aba fechada.'}
                </span>
              </div>
            </div>

            {notificationPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                Ativar Avisos
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ativo
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">
                Seus estudos estão no ritmo certo!
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Não há objetivos vencendo hoje ou atrasados. Continue com passos pequenos e constantes!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vence Hoje */}
              {todayAlerts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Vence Hoje ({todayAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {todayAlerts.map((alert) => (
                      <div
                        key={alert.goalId}
                        className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-stone-900 block truncate">
                            {alert.title}
                          </span>
                          <span className="text-amber-700 font-medium text-[11px] block mt-0.5">
                            {alert.message} · {alert.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onCompleteGoal(alert.goalId)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                        >
                          Concluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atrasados */}
              {overdueAlerts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    Prazo Expirado ({overdueAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {overdueAlerts.map((alert) => (
                      <div
                        key={alert.goalId}
                        className="p-3 bg-red-50/60 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-stone-900 block truncate">
                            {alert.title}
                          </span>
                          <span className="text-red-700 font-medium text-[11px] block mt-0.5">
                            {alert.message} · Prazo era: {formatDateBR(alert.targetDate)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onCompleteGoal(alert.goalId)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                        >
                          Concluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vencendo em breve */}
              {soonAlerts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    Próximos Dias ({soonAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {soonAlerts.map((alert) => (
                      <div
                        key={alert.goalId}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-stone-900 block truncate">
                            {alert.title}
                          </span>
                          <span className="text-stone-500 text-[11px] block mt-0.5">
                            {alert.message} ({formatDateBR(alert.targetDate)}) · {alert.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onCompleteGoal(alert.goalId)}
                          className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                        >
                          Concluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
