import { AlertTriangle, Clock } from 'lucide-react';
import type { Tag } from '../../types/analytics';

interface AlertPanelProps {
  alerts: Tag[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Todos os dispositivos estão online</span>
        </div>
      </div>
    );
  }

  // Get the 3 most critical (longest offline)
  const criticalAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'} de atenção
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {criticalAlerts.map((tag) => (
          <div 
            key={tag.id}
            className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tag.name}
                </span>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Offline
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
              ID: {tag.brgpsId}
            </p>
          </div>
        ))}
      </div>

      {alerts.length > 3 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          +{alerts.length - 3} dispositivos precisam de atenção
        </p>
      )}
    </div>
  );
}
