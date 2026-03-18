import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { DeviceMap } from '../components/map/DeviceMap';
import { tagsApi, settingsApi } from '../services/api';
import { useMapStore } from '../store/mapStore';
import type { Tag } from '../store/mapStore';
import { Activity, Clock, AlertCircle, ShieldCheck, Database, Wifi, WifiOff, MapPin, TrendingUp } from 'lucide-react';
import { spacing } from '../design-tokens';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ServiceStatus {
  api: { status: string; healthy: boolean; message: string };
  database: { status: string; healthy: boolean; message: string };
  brgps: { status: string; healthy: boolean; message: string };
  sync: { status: string; healthy: boolean; message: string };
}

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${Math.floor(diffHours / 24)}d atrás`;
}

export function Dashboard() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const navigate = useNavigate();
  const { setSelectedDevice } = useMapStore();

  useEffect(() => {
    loadTags();
    loadServiceStatus();
    const interval = setInterval(loadServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      const tagsData = response.data as Tag[];
      setTags(tagsData);
      
      const tagsWithSync = tagsData.filter((t) => t.lastSyncAt);
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

  const stats = useMemo(() => ({
    total: tags.length,
    active: tags.filter((t) => t.status === 'ACTIVE').length,
    inactive: tags.filter((t) => t.status === 'INACTIVE').length,
  }), [tags]);

  const pieData = useMemo(() => [
    { name: 'Ativas', value: stats.active, color: '#10B981' },
    { name: 'Inativas', value: stats.inactive, color: '#F59E0B' },
  ], [stats]);

  const activityData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      const syncs = tags.filter((t) => {
        if (!t.lastSyncAt) return false;
        const syncDate = new Date(t.lastSyncAt).toISOString().split('T')[0];
        return syncDate === dateStr;
      }).length;

      data.push({ date: dateStr, syncs, label });
    }
    return data;
  }, [tags]);

  const handleDeviceClick = (device: Tag) => {
    setSelectedDevice(device.id);
  };

  const handleViewHistory = (device: Tag) => {
    navigate(`/tags?history=${device.id}`);
  };

  const statCards = [
    {
      title: 'Total de Tags',
      value: stats.total,
      icon: Database,
      subtitle: 'Dispositivos na conta',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      detail: 'Cadastradas no sistema'
    },
    {
      title: 'Ativas agora',
      value: stats.active,
      icon: Activity,
      subtitle: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% da frota total`,
      color: '#10B981',
      bgColor: '#ECFDF5',
      detail: 'Transmitindo dados'
    },
    {
      title: 'Alertas / Inativas',
      value: stats.inactive,
      icon: AlertCircle,
      subtitle: 'Aguardando manutenção',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      detail: 'Offline ou desativadas'
    },
  ];

  if (loading) {
    return (
      <div className={`p-8 max-w-[1600px] mx-auto ${spacing.section}`}>
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visão geral da sua frota de tags e localização em tempo real.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="group hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all duration-300 cursor-default"
          >
            <CardBody className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Map and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Mapa da Frota
                </h2>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tags')}>
                Ver Lista
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div style={{ height: '400px' }}>
              <DeviceMap 
                devices={tags} 
                onDeviceClick={handleDeviceClick}
                onViewHistory={handleViewHistory}
                height="100%"
              />
            </div>
          </CardBody>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Atividade
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="syncs" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Sincronizações nos últimos 7 dias
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Donut */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Status da Frota
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Service Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Status dos Serviços
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">BRGPS API</span>
                  {loadingStatus ? (
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                  ) : serviceStatus?.brgps?.healthy ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  {loadingStatus ? 'Verificando...' : serviceStatus?.brgps?.healthy ? (
                    <><Wifi className="w-3 h-3" /> Online</>
                  ) : (
                    <><WifiOff className="w-3 h-3" /> Offline</>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Banco</span>
                  {loadingStatus ? (
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                  ) : serviceStatus?.database?.healthy ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  {loadingStatus ? 'Verificando...' : serviceStatus?.database?.healthy ? (
                    <><Database className="w-3 h-3" /> Conectado</>
                  ) : (
                    <><AlertCircle className="w-3 h-3" /> Erro</>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Última Sync</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {lastSyncTime ? formatRelativeTime(lastSyncTime) : 'Nunca'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
