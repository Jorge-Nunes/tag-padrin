import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { tagsApi, settingsApi } from '../services/api';
import { Activity, Clock, AlertCircle, ShieldCheck, Database, Wifi, WifiOff } from 'lucide-react';
import { spacing, colors } from '../design-tokens';

interface Tag {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastSyncAt?: string;
}

interface ServiceStatus {
  api: { status: string; healthy: boolean; message: string };
  database: { status: string; healthy: boolean; message: string };
  brgps: { status: string; healthy: boolean; message: string };
  sync: { status: string; healthy: boolean; message: string };
}

export function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadServiceStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(loadServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await tagsApi.getAll();
      const tags = response.data as Tag[];
      setStats({
        total: tags.length,
        active: tags.filter((t) => t.status === 'ACTIVE').length,
        inactive: tags.filter((t) => t.status === 'INACTIVE').length,
      });

      // Find last sync time from tags
      const tagsWithSync = tags.filter((t) => t.lastSyncAt);
      if (tagsWithSync.length > 0) {
        const lastSync = tagsWithSync.sort((a, b) =>
          new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime()
        )[0];
        setLastSyncTime(lastSync.lastSyncAt!);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await settingsApi.getHealth();
      setServiceStatus(response.data.services);
    } catch (error) {
      console.error('Erro ao carregar status dos serviços:', error);
    } finally {
      setLoadingStatus(false);
    }
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

  const statCards = [
    {
      title: 'Total de Tags',
      value: stats.total,
      icon: Database,
      subtitle: 'Dispositivos na conta',
      color: 'text-blue-600',
      bgColor: colors.status.info.bg,
      detail: 'Cadastradas no sistema'
    },
    {
      title: 'Ativas agora',
      value: stats.active,
      icon: Activity,
      subtitle: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% da frota total`,
      color: 'text-emerald-600',
      bgColor: colors.status.success.bg,
      detail: 'Transmitindo dados'
    },
    {
      title: 'Alertas / Inativas',
      value: stats.inactive,
      icon: AlertCircle,
      subtitle: 'Aguardando manutenção',
      color: 'text-amber-600',
      bgColor: colors.status.warning.bg,
      detail: 'Offline ou desativadas'
    },
  ];

  if (loading) {
    return (
      <div className={`p-8 max-w-[1440px] mx-auto ${spacing.section}`}>
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-8 max-w-[1440px] mx-auto ${spacing.section} animate-in fade-in duration-700`}>
      <header>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visão geral da sua frota de tags e status de sincronização.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="group hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all duration-300 cursor-default"
          >
            <CardBody className="p-7">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {card.title}
                    </h3>
                    <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 italic">
                      {card.subtitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {card.detail}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Status dos Serviços
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BRGPS API Status */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">BRGPS API</span>
                  {loadingStatus ? (
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                  ) : (serviceStatus?.brgps?.healthy ?? serviceStatus?.brgps?.status === 'online') ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  {loadingStatus ? (
                    'Verificando...'
                  ) : (serviceStatus?.brgps?.healthy ?? serviceStatus?.brgps?.status === 'online') ? (
                    <>
                      <Wifi className="w-3 h-3" /> Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" /> {serviceStatus?.brgps?.message || 'Offline'}
                    </>
                  )}
                </p>
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Banco de Dados</span>
                  {loadingStatus ? (
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                  ) : (serviceStatus?.database?.healthy ?? serviceStatus?.database?.status === 'online') ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  {loadingStatus ? (
                    'Verificando...'
                  ) : (serviceStatus?.database?.healthy ?? serviceStatus?.database?.status === 'online') ? (
                    <>
                      <Database className="w-3 h-3" /> Conectado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> {serviceStatus?.database?.message || 'Erro'}
                    </>
                  )}
                </p>
              </div>

              {/* Last Sync */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Última Sincronização</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-300 font-medium">
                  {lastSyncTime ? formatRelativeTime(lastSyncTime) : 'Nunca'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Sistema
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Serviço de Sync</span>
              <span className={`font-semibold flex items-center ${loadingStatus ? 'text-gray-400' : (serviceStatus?.sync?.healthy ?? serviceStatus?.sync?.status === 'online') ? 'text-emerald-600' : 'text-red-600'}`}>
                {loadingStatus ? (
                  <>
                    <div className="w-3 h-3 mr-1 rounded-full bg-gray-300 animate-pulse" />
                    Verificando...
                  </>
                ) : (serviceStatus?.sync?.healthy ?? serviceStatus?.sync?.status === 'online') ? (
                  <>
                    <Activity className="w-3 h-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {serviceStatus?.sync?.message || 'Inativo'}
                  </>
                )}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-slate-750">
              <Button
                variant="strong"
                size="sm"
                className="w-full"
                onClick={() => navigate('/tags')}
              >
                Relatório Completo
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
