import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { ConnectionStatus } from '../components/settings/ConnectionStatus';
import { SyncHistory } from '../components/settings/SyncHistory';
import { SystemInfo } from '../components/settings/SystemInfo';
import { Save, RefreshCw, Clock, Globe, Shield, Server, Settings as SettingsIcon } from 'lucide-react';
import { syncApi, settingsApi } from '../services/api';
import { useModalStore } from '../store/modalStore';
import { useAuthStore } from '../store/authStore';
import { spacing } from '../design-tokens';

type TabId = 'general' | 'integrations' | 'operations' | 'system';

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [formData, setFormData] = useState({
    syncInterval: '60',
    brgpsBaseUrl: '',
    brgpsToken: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{
    timestamp: string;
    stats: { total: number; success: number; failed: number };
  } | null>(null);
  
  const { showAlert } = useModalStore();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const tabs = [
    { id: 'general' as TabId, label: 'Geral', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'integrations' as TabId, label: 'Integrações', icon: <Globe className="w-4 h-4" /> },
    { id: 'operations' as TabId, label: 'Operações', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'system' as TabId, label: 'Sistema', icon: <Server className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.get();
        const data = response.data;
        setFormData({
          syncInterval: data.syncInterval.toString(),
          brgpsBaseUrl: data.brgpsBaseUrl || '',
          brgpsToken: data.brgpsToken || '',
        });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!isAdmin) {
      showAlert({
        title: 'Acesso Negado',
        message: 'Apenas administradores podem alterar as configurações.',
        type: 'danger',
      });
      return;
    }

    setSaving(true);
    try {
      const syncInterval = parseInt(formData.syncInterval);
      await settingsApi.update({
        syncInterval: isNaN(syncInterval) ? 60 : syncInterval,
        brgpsBaseUrl: formData.brgpsBaseUrl,
        brgpsToken: formData.brgpsToken,
      });
      setHasChanges(false);
      showAlert({
        title: 'Sucesso',
        message: 'Configurações salvas com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Save error:', error);
      const message = (error as any).response?.data?.message || 'Erro ao salvar configurações';
      showAlert({
        title: 'Erro',
        message: Array.isArray(message) ? message.join('\n') : message,
        type: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await syncApi.manualSync();
      const stats = response.data.stats;
      
      setLastSync({
        timestamp: new Date().toISOString(),
        stats: {
          total: stats.total,
          success: stats.success,
          failed: stats.failed,
        },
      });

      showAlert({
        title: 'Sincronização Concluída',
        message: `Processados: ${stats.total} | Sucesso: ${stats.success} | Falhas: ${stats.failed}`,
        type: stats.failed > 0 ? 'warning' : 'success',
      });
    } catch (error) {
      const message = (error as any).response?.data?.message || 'Erro na sincronização';
      showAlert({ title: 'Erro', message, type: 'danger' });
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async (): Promise<boolean> => {
    try {
      const response = await settingsApi.testConnection(
        formData.brgpsBaseUrl,
        formData.brgpsToken
      );
      
      if (response.data.success) {
        showAlert({
          title: 'Sucesso',
          message: response.data.message,
          type: 'success',
        });
        return true;
      } else {
        showAlert({
          title: 'Erro de Conexão',
          message: response.data.message,
          type: 'danger',
        });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao testar conexão';
      showAlert({
        title: 'Erro',
        message,
        type: 'danger',
      });
      return false;
    }
  };

  // Calculate next sync time
  const getNextSyncTime = () => {
    const interval = parseInt(formData.syncInterval) || 60;
    const now = new Date();
    const next = new Date(now.getTime() + interval * 1000);
    return next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`p-4 sm:p-8 max-w-[1440px] mx-auto ${spacing.section} animate-in fade-in duration-700`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Configurações do Sistema
            </h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 ml-11">
          Gerencie integrações, parâmetros de rede e operações do sistema.
        </p>
      </header>

      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId as TabId)} 
      />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Geral Tab */}
        <TabPanel isActive={activeTab === 'general'}>
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Frequência de Sincronização
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Intervalo entre sincronizações (segundos)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.syncInterval}
                      onChange={(e) => handleInputChange('syncInterval', e.target.value)}
                      disabled={!isAdmin}
                      min="30"
                      max="3600"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white disabled:opacity-50 font-mono text-lg"
                    />
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Próxima sincronização: <strong className="text-cyan-600 dark:text-cyan-400">{getNextSyncTime()}</strong>
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                      Mínimo: 30s
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Recomendação de Segurança
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Intervalos menores que 60 segundos podem causar bloqueios por limite de requisições na API do BRGPS.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>

        {/* Integrações Tab */}
        <TabPanel isActive={activeTab === 'integrations'}>
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Integração BRGPS
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Connection Status */}
                <ConnectionStatus
                  url={formData.brgpsBaseUrl}
                  token={formData.brgpsToken}
                  onTest={handleTestConnection}
                />

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    URL Base da API
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.brgpsBaseUrl}
                      onChange={(e) => handleInputChange('brgpsBaseUrl', e.target.value)}
                      disabled={!isAdmin}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white disabled:opacity-50"
                      placeholder="https://www.brgps.com/open"
                    />
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    URL completa do endpoint da API BRGPS
                  </p>
                </div>

                {/* Token Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Token de API
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.brgpsToken}
                      onChange={(e) => handleInputChange('brgpsToken', e.target.value)}
                      disabled={!isAdmin}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white disabled:opacity-50"
                      placeholder="••••••••••••••••"
                    />
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Token de autenticação fornecido pelo BRGPS
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Como obter as credenciais
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Acesse o portal BRGPS em <a href="http://www.brgps.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">www.brgps.com</a> e gere um token de API na seção de configurações da sua conta.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>

        {/* Operações Tab */}
        <TabPanel isActive={activeTab === 'operations'}>
          <div className="max-w-3xl">
            <SyncHistory 
              onSync={handleManualSync}
              loading={syncing}
              lastSync={lastSync}
            />
          </div>
        </TabPanel>

        {/* Sistema Tab */}
        <TabPanel isActive={activeTab === 'system'}>
          <div className="max-w-3xl">
            <SystemInfo />
          </div>
        </TabPanel>
      </div>

      {/* Save Button - Fixed at bottom when has changes */}
      {isAdmin && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}>
          <div className="bg-white dark:bg-slate-800 rounded-full shadow-xl border border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Alterações não salvas
            </span>
            <Button
              type="button"
              variant="strong"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for fixed button */}
      {isAdmin && <div className="h-20" />}
    </div>
  );
}
