import { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Globe, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { settingsApi } from '../../services/api';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: string;
  message?: string;
}



interface SystemInfoProps {
  onRefresh?: () => void;
}

interface UptimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function SystemInfo({ onRefresh }: SystemInfoProps) {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Backend', status: 'checking', lastChecked: 'Verificando...' },
    { name: 'Banco de Dados', status: 'checking', lastChecked: 'Verificando...' },
    { name: 'BRGPS API', status: 'checking', lastChecked: 'Verificando...' },
    { name: 'Serviço de Sync', status: 'checking', lastChecked: 'Verificando...' },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [uptime, setUptime] = useState<UptimeData | null>(null);
  const [uptimeLoading, setUptimeLoading] = useState(true);

  useEffect(() => {
    fetchUptime();
    fetchHealth();
    const uptimeInterval = setInterval(fetchUptime, 60000);
    const healthInterval = setInterval(fetchHealth, 30000); // Check health every 30s
    return () => {
      clearInterval(uptimeInterval);
      clearInterval(healthInterval);
    };
  }, []);

  const fetchUptime = async () => {
    try {
      const response = await settingsApi.getUptime();
      setUptime(response.data.uptime);
    } catch (error) {
      console.error('Error fetching uptime:', error);
    } finally {
      setUptimeLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await settingsApi.getHealth();
      const healthData = response.data;
      
      // Map health data to services
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setServices([
        { 
          name: 'API Backend', 
          status: healthData.services.api.status === 'online' ? 'online' : 'offline', 
          lastChecked: now,
          message: healthData.services.api.message 
        },
        { 
          name: 'Banco de Dados', 
          status: healthData.services.database.status === 'online' ? 'online' : 'offline', 
          lastChecked: now,
          message: healthData.services.database.message 
        },
        { 
          name: 'BRGPS API', 
          status: healthData.services.brgps.status === 'online' ? 'online' : 'offline', 
          lastChecked: now,
          message: healthData.services.brgps.message 
        },
        { 
          name: 'Serviço de Sync', 
          status: healthData.services.sync.status === 'online' ? 'online' : 'offline', 
          lastChecked: now,
          message: healthData.services.sync.message 
        },
      ]);
    } catch (error) {
      console.error('Error fetching health:', error);
      // Set all services to offline on error
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setServices(prev => prev.map(s => ({ 
        ...s, 
        status: 'offline',
        lastChecked: now,
        message: 'Erro ao verificar status'
      })));
    }
  };

  const formatUptime = (uptime: UptimeData | null): string => {
    if (!uptime) return '--';
    if (uptime.days > 0) return `${uptime.days}d ${uptime.hours}h`;
    if (uptime.hours > 0) return `${uptime.hours}h ${uptime.minutes}m`;
    return `${uptime.minutes}m ${uptime.seconds}s`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Set all to checking state
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    
    try {
      await fetchHealth();
      onRefresh?.();
    } catch (error) {
      console.error('Error refreshing health:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30';
      case 'offline':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30';
      case 'checking':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Version & Uptime */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Versão
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                1.2.0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Disponibilidade
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {uptimeLoading ? '--' : '100%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Tempo Online
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {uptimeLoading ? '--' : formatUptime(uptime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Status dos Serviços
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {services.map((service) => (
            <div 
              key={service.name}
              className={`flex items-center justify-between p-4 ${getStatusColor(service.status)}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400" title={service.message}>
                    {service.message || `Verificado: ${service.lastChecked}`}
                  </p>
                </div>
              </div>
              
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                service.status === 'online' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : service.status === 'offline'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {service.status === 'online' ? 'Online' : 
                 service.status === 'offline' ? 'Offline' : 'Verificando...'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Links & Resources */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Links Úteis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="#" 
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-sm transition-all"
          >
            <Globe className="w-5 h-5 text-cyan-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Documentação</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Guia completo do sistema</p>
            </div>
          </a>
          
          <a 
            href="http://www.brgps.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-sm transition-all"
          >
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">BRGPS</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portal do rastreador</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
