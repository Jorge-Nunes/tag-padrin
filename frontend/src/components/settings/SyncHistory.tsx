import { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { syncApi } from '../../services/api';

interface SyncOperation {
  id: string;
  createdAt: string;
  totalTags: number;
  successCount: number;
  failedCount: number;
  durationMs: number;
  status: string;
  message?: string;
}

interface SyncHistoryProps {
  onSync: () => Promise<void>;
  loading?: boolean;
  lastSync?: {
    timestamp: string;
    stats: {
      total: number;
      success: number;
      failed: number;
    };
  } | null;
}

export function SyncHistory({ onSync, loading = false, lastSync }: SyncHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SyncOperation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      const response = await syncApi.getHistory(20);
      setHistory(response.data.data || []);
    } catch (err: any) {
      setError('Erro ao carregar histórico');
      console.error('Error fetching sync history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${Math.floor(diffHours / 24)}d atrás`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'PARTIAL':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <RefreshCw className={`w-6 h-6 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sincronização Manual
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Execute uma sincronização imediata de todos os dispositivos
              </p>
              
              {lastSync && (
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatRelativeTime(lastSync.timestamp)}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    {lastSync.stats.success} sucesso
                  </span>
                  {lastSync.stats.failed > 0 && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      {lastSync.stats.failed} falha
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSync}
            disabled={loading}
            className="md:w-auto whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </div>

      {/* History Section */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Histórico de Sincronizações
        </button>
        
        {showHistory && (
          <div className="mt-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {loadingHistory ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Carregando histórico...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <XCircle className="w-6 h-6 mx-auto mb-2" />
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                Nenhuma sincronização realizada ainda
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sucesso
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Falhas
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {history.map((op) => (
                    <tr key={op.id} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(op.status)}
                          {formatTime(op.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {op.totalTags}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {op.successCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {op.failedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle className="w-3.5 h-3.5" />
                            {op.failedCount}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-500 dark:text-gray-400 font-mono">
                        {formatDuration(op.durationMs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
