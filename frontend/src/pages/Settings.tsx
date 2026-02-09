import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Save, RefreshCw, Clock, Globe, Send } from 'lucide-react';
import { syncApi, settingsApi } from '../services/api';
import { useModalStore } from '../store/modalStore';
import { useAuthStore } from '../store/authStore';

export function Settings() {
    const [formData, setFormData] = useState({
        syncInterval: '60',
        brgpsBaseUrl: '',
        brgpsToken: '',
        traccarUrl: '',
        traccarToken: '',
    });
    const [loading, setLoading] = useState(false);
    const { showAlert } = useModalStore();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsApi.get();
                const data = response.data;
                setFormData({
                    syncInterval: data.syncInterval.toString(),
                    brgpsBaseUrl: data.brgpsBaseUrl || '',
                    brgpsToken: data.brgpsToken || '',
                    traccarUrl: data.traccarUrl || '',
                    traccarToken: data.traccarToken || '',
                });
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            showAlert({
                title: 'Acesso Negado',
                message: 'Apenas administradores podem alterar as configurações.',
                type: 'danger',
            });
            return;
        }

        try {
            await settingsApi.update({
                syncInterval: parseInt(formData.syncInterval),
                brgpsToken: formData.brgpsToken,
                traccarUrl: formData.traccarUrl,
                traccarToken: formData.traccarToken,
            });
            showAlert({
                title: 'Sucesso',
                message: 'Configurações salvas e aplicadas com sucesso!',
                type: 'success',
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao salvar configurações';
            showAlert({ title: 'Erro', message, type: 'danger' });
        }
    };

    const handleManualSync = async () => {
        setLoading(true);
        try {
            const response = await syncApi.manualSync();
            const stats = response.data.stats;

            let message = `Sincronização concluída!\n\n`;
            message += `Tags processadas: ${stats.total}\n`;
            message += `Sucesso: ${stats.success}\n`;
            message += `Falhas: ${stats.failed}`;

            showAlert({
                title: 'Relatório de Sincronismo',
                message,
                type: stats.failed > 0 ? 'warning' : 'success',
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro na sincronização';
            showAlert({ title: 'Erro de Sincronismo', message, type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight text-left">Configurações do Sistema</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-left">Gerencie integrações, segurança e parâmetros de rede.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Integração BRGPS */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Globe className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Conectividade BRGPS</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">URL Base da API</label>
                                <input
                                    type="text"
                                    value={formData.brgpsBaseUrl}
                                    onChange={(e) => setFormData({ ...formData, brgpsBaseUrl: e.target.value })}
                                    disabled={!isAdmin}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                    placeholder="Ex: http://www.brgps.com/open"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Chave de API (Token)</label>
                                <input
                                    type="password"
                                    value={formData.brgpsToken}
                                    onChange={(e) => setFormData({ ...formData, brgpsToken: e.target.value })}
                                    disabled={!isAdmin}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                    placeholder="Insira seu API Token"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Integração Traccar */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Send className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Encaminhamento Traccar</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Endpoint de Destino (URL)</label>
                                <input
                                    type="text"
                                    value={formData.traccarUrl}
                                    onChange={(e) => setFormData({ ...formData, traccarUrl: e.target.value })}
                                    disabled={!isAdmin}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                    placeholder="Ex: http://seu-servidor:5055"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Token de Autorização (Opcional)</label>
                                <input
                                    type="password"
                                    value={formData.traccarToken}
                                    onChange={(e) => setFormData({ ...formData, traccarToken: e.target.value })}
                                    disabled={!isAdmin}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                    placeholder="Insira o Token do Traccar se necessário"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Motor de Sincronização */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Frequência de Rede</h2>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Intervalo Global (segundos)</label>
                                <input
                                    type="number"
                                    value={formData.syncInterval}
                                    onChange={(e) => setFormData({ ...formData, syncInterval: e.target.value })}
                                    disabled={!isAdmin}
                                    min="30"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Mínimo sugerido de 60s para evitar bloqueios de taxa de API.</p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Ações Rápidas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operações Manuais</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="flex flex-col justify-center h-full space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Forçar Atualização</p>
                                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60 mb-3">Sincroniza imediatamente todos os dispositivos ativos.</p>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleManualSync}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'Sincronizando...' : 'Executar Sincronismo'}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {isAdmin && (
                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="strong" size="lg" className="w-full md:w-auto px-12">
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Todas as Configurações
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
