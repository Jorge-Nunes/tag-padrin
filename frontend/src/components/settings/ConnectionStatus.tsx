import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Globe, Shield } from 'lucide-react';

interface ConnectionStatusProps {
  url: string;
  token: string;
  isConnected?: boolean;
  lastSync?: string;
  onTest: () => Promise<boolean>;
}

export function ConnectionStatus({ 
  url, 
  token, 
  isConnected: initialConnected = false,
  lastSync,
  onTest 
}: ConnectionStatusProps) {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>(
    initialConnected ? 'success' : 'idle'
  );
  const [tested, setTested] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTested(true);
    try {
      const success = await onTest();
      setConnectionStatus(success ? 'success' : 'error');
    } catch {
      setConnectionStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const getStatusConfig = () => {
    if (!tested && !initialConnected) {
      return {
        icon: <Shield className="w-5 h-5" />,
        bg: 'bg-gray-100 dark:bg-slate-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-slate-700',
        message: 'Configure e teste a conexão',
      };
    }
    
    if (connectionStatus === 'success' || (initialConnected && !tested)) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-900/30',
        message: lastSync ? `Conectado • Última sincronização: ${lastSync}` : 'Conectado',
      };
    }
    
    return {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-900/30',
      message: 'Falha na conexão • Verifique URL e Token',
    };
  };

  const config = getStatusConfig();
  const canTest = url && token;

  return (
    <div className={`p-4 rounded-xl border ${config.bg} ${config.border} mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${config.text}`}>
            {config.icon}
          </div>
          <div>
            <p className={`text-sm font-semibold ${config.text}`}>
              Status da Conexão
            </p>
            <p className={`text-xs mt-0.5 ${config.text} opacity-80`}>
              {config.message}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleTest}
          disabled={!canTest || testing}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${canTest && !testing
              ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-500'
            }
          `}
        >
          {testing && <Loader2 className="w-4 h-4 animate-spin" />}
          <Globe className="w-4 h-4" />
          {testing ? 'Testando...' : 'Testar Conexão'}
        </button>
      </div>
    </div>
  );
}
