import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, MapPin, Search, ChevronLeft, ChevronRight, Filter, Clock, ChevronDown, X, Wifi, WifiOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { tagsApi } from '../services/api';
import { useModalStore } from '../store/modalStore';
import { BulkImportModal } from '../components/BulkImportModal';
import { DeviceMap } from '../components/map/DeviceMap';
import { useMapStore } from '../store/mapStore';
import { useDebounce } from '../hooks/useDebounce';
import type { Position } from '../store/mapStore';

interface Tag {
  id: string;
  brgpsId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  traccarUrl?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSyncAt?: string;
}

const INITIAL_FORM_DATA = {
  brgpsId: '',
  name: '',
  description: '',
  status: 'ACTIVE',
  traccarUrl: '',
};

const ITEMS_PER_PAGE = 10;
const POSITIONS_PER_PAGE = 15;

function openGoogleMaps(latitude: number, longitude: number): void {
  window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function Tags() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'devices';

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // History state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const deviceDropdownRef = useRef<HTMLDivElement>(null);
  const debouncedDeviceSearch = useDebounce(deviceSearchTerm, 300);
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const debouncedHistoryStartDate = useDebounce(historyStartDate, 500);
  const debouncedHistoryEndDate = useDebounce(historyEndDate, 500);
  

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const { showAlert, showConfirm } = useModalStore();
  const { selectedPosition, setSelectedPosition, focusOnPosition } = useMapStore();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data);
    } catch (error: unknown) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async (deviceId: string, page: number, startDate?: string, endDate?: string) => {
    try {
      setPositionsLoading(true);
      const response = await tagsApi.getPositions(deviceId, page, POSITIONS_PER_PAGE, startDate, endDate);
      setPositions(response.data.data);
      setHistoryTotal(response.data.total);
      setHistoryTotalPages(response.data.totalPages);
    } catch (error: unknown) {
      console.error('Erro ao carregar posições:', error);
    } finally {
      setPositionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && tags.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(tags[0].id);
    }
  }, [activeTab, tags, selectedDeviceId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(event.target as Node)) {
        setShowDeviceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && selectedDeviceId) {
      const startIso = debouncedHistoryStartDate ? new Date(debouncedHistoryStartDate).toISOString() : undefined;
      const endIso = debouncedHistoryEndDate ? new Date(debouncedHistoryEndDate).toISOString() : undefined;
      loadPositions(selectedDeviceId, historyPage, startIso, endIso);
    }
  }, [activeTab, selectedDeviceId, historyPage, debouncedHistoryStartDate, debouncedHistoryEndDate]);

  useEffect(() => {
    if (selectedDeviceId) {
      const startIso = debouncedHistoryStartDate ? new Date(debouncedHistoryStartDate).toISOString() : undefined;
      const endIso = debouncedHistoryEndDate ? new Date(debouncedHistoryEndDate).toISOString() : undefined;
      loadPositions(selectedDeviceId, 1, startIso, endIso);
      setHistoryPage(1);
    }
  }, [selectedDeviceId, debouncedHistoryStartDate, debouncedHistoryEndDate]);

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    focusOnPosition(position);
  };

  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch =
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.brgpsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || tag.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tags, searchTerm, statusFilter]);

  const filteredDevicesForHistory = useMemo(() => {
    return tags.filter(tag => {
      const searchLower = debouncedDeviceSearch.toLowerCase();
      const matchesSearch = !debouncedDeviceSearch || 
        tag.name.toLowerCase().includes(searchLower) ||
        tag.brgpsId.toLowerCase().includes(searchLower);
      const matchesStatus = deviceStatusFilter === 'ALL' || tag.status === deviceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tags, debouncedDeviceSearch, deviceStatusFilter]);

  const selectedDevice = useMemo(() => {
    return tags.find(t => t.id === selectedDeviceId);
  }, [tags, selectedDeviceId]);

  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTags.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTags, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, formData);
        showAlert({ title: 'Sucesso', message: 'Tag atualizada com sucesso!', type: 'success' });
      } else {
        await tagsApi.create(formData);
        showAlert({ title: 'Sucesso', message: 'Tag cadastrada com sucesso!', type: 'success' });
      }
      setShowModal(false);
      setEditingTag(null);
      setFormData(INITIAL_FORM_DATA);
      loadTags();
    } catch (error: unknown) {
      console.error('Erro ao salvar tag:', error);
      showAlert({ title: 'Erro', message: ((error as unknown) as {response?: {data?: {message?: string}}}).response?.data?.message || 'Falha ao salvar.', type: 'danger' });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      brgpsId: tag.brgpsId,
      name: tag.name,
      description: tag.description || '',
      status: tag.status,
      traccarUrl: tag.traccarUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      title: 'Excluir Tag',
      message: 'Tem certeza que deseja excluir esta tag? Esta ação não pode ser desfeita.',
      type: 'danger',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          await tagsApi.delete(id);
          loadTags();
          showAlert({ title: 'Sucesso', message: 'Tag excluída!', type: 'success' });
        } catch (error: unknown) {
          console.error(error); showAlert({ title: 'Erro', message: 'Falha ao excluir.', type: 'danger' });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Carregando dispositivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {activeTab === 'history' ? 'Histórico de Posições' : 'Dispositivos'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'history' ? 'Acompanhamento do histórico de' : 'Gerenciando'} <span className="text-blue-600 font-bold">{tags.length}</span> rastreadores.
          </p>
        </div>
        {activeTab === 'devices' && (
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowBulkModal(true)} variant="secondary" size="sm">
              <Search className="w-4 h-4 mr-1" />
              Importar
            </Button>
            <Button onClick={() => { setEditingTag(null); setFormData(INITIAL_FORM_DATA); setShowModal(true); }} variant="strong" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </div>
        )}
      </div>

      {/* Content based on tab */}
      {activeTab === 'devices' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar por nome, ID ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ACTIVE">Apenas Ativos</option>
                <option value="INACTIVE">Apenas Inativos</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl px-4 py-3 flex items-center justify-center">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {filteredTags.length} Encontrados
              </p>
            </div>
          </div>

          <Card className="overflow-hidden border-gray-100 dark:border-slate-800 shadow-premium">
            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-750/50 border-b border-gray-100 dark:border-slate-700/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Dispositivo</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Identificação</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Posição</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {paginatedTags.length > 0 ? paginatedTags.map((tag) => (
                    <tr key={tag.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3 text-left">
                          <div
                            onClick={() => tag.lastLatitude && tag.lastLongitude && openGoogleMaps(tag.lastLatitude, tag.lastLongitude)}
                            className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${tag.lastLatitude && tag.lastLongitude
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-110 active:scale-95'
                              : 'bg-gray-50 dark:bg-slate-800 text-gray-400 cursor-not-allowed opacity-50'
                              }`}
                            title={tag.lastLatitude && tag.lastLongitude ? "Ver localização no Google Maps" : "Sem coordenadas disponíveis"}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900 dark:text-white leading-none mb-1">{tag.name}</p>
                            {tag.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">{tag.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono font-bold bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                          {tag.brgpsId}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tag.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                          }`}>
                          <div className={`h-1.5 w-1.5 rounded-full mr-2 ${tag.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          {tag.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        {tag.lastLatitude && tag.lastLongitude ? (
                          <div
                            onClick={() => openGoogleMaps(tag.lastLatitude!, tag.lastLongitude!)}
                            className="flex flex-col cursor-pointer hover:text-blue-600 transition-colors group/pos"
                            title="Ver no Google Maps"
                          >
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover/pos:text-blue-600">
                              {tag.lastLatitude.toFixed(6)}
                            </span>
                            <span className="text-[10px] text-gray-400 group-hover/pos:text-blue-500">
                              {tag.lastLongitude.toFixed(6)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sem posição</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <p className="text-gray-400 font-medium">Nenhum dispositivo encontrado.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Device selector bar — mesma linguagem visual do filtro da aba Dispositivos */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Combobox para seleção de dispositivo */}
            <div className="relative flex-1 max-w-md" ref={deviceDropdownRef}>
              <div 
                className="relative cursor-pointer"
                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              >
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <div
                  className="w-full pl-10 pr-16 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-left flex items-center justify-between"
                >
                  <span className={`text-sm truncate ${selectedDevice ? 'dark:text-white' : 'text-gray-400'}`}>
                    {selectedDevice ? (
                      <span className="flex items-center gap-2">
                        {selectedDevice.status === 'ACTIVE' ? (
                          <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <WifiOff className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span className="truncate">{selectedDevice.name}</span>
                        <span className="text-gray-400 font-mono text-xs shrink-0">({selectedDevice.brgpsId})</span>
                      </span>
                    ) : (
                      'Selecione um dispositivo...'
                    )}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {selectedDeviceId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeviceId(null);
                          setDeviceSearchTerm('');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Dropdown com busca e filtros */}
              {showDeviceDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={() => setShowDeviceDropdown(false)}
                  />
                  <div className="absolute z-[9999] w-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {/* Campo de busca */}
                  <div className="p-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar dispositivo..."
                        value={deviceSearchTerm}
                        onChange={(e) => setDeviceSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    {/* Filtro de status */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setDeviceStatusFilter('ALL')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          deviceStatusFilter === 'ALL'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Todos ({tags.length})
                      </button>
                      <button
                        onClick={() => setDeviceStatusFilter('ACTIVE')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                          deviceStatusFilter === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Wifi className="w-3 h-3" />
                        Ativos ({tags.filter(t => t.status === 'ACTIVE').length})
                      </button>
                      <button
                        onClick={() => setDeviceStatusFilter('INACTIVE')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                          deviceStatusFilter === 'INACTIVE'
                            ? 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <WifiOff className="w-3 h-3" />
                        Inativos ({tags.filter(t => t.status === 'INACTIVE').length})
                      </button>
                    </div>
                  </div>

                  {/* Lista de dispositivos */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredDevicesForHistory.length > 0 ? (
                      filteredDevicesForHistory.slice(0, 50).map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedDeviceId(tag.id);
                            setShowDeviceDropdown(false);
                            setDeviceSearchTerm('');
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                            selectedDeviceId === tag.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {tag.status === 'ACTIVE' ? (
                              <Wifi className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium dark:text-white">{tag.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{tag.brgpsId}</p>
                            </div>
                          </div>
                          {tag.status === 'ACTIVE' ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full">
                              Inativo
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Search className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum dispositivo encontrado</p>
                      </div>
                    )}
                    {filteredDevicesForHistory.length > 50 && (
                      <div className="px-4 py-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-slate-800">
                        Mostrando 50 de {filteredDevicesForHistory.length} dispositivos. Refine a busca para encontrar mais rápido.
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}
            </div>

            {selectedDeviceId && historyTotal > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {historyTotal.toLocaleString('pt-BR')} registros
                </span>
              </div>
            )}
          </div>

          {/* Map */}
          <Card className="overflow-hidden border-gray-100 dark:border-slate-800 shadow-premium">
            <div style={{ height: '420px' }}>
              <DeviceMap
                devices={selectedDeviceId ? (tags.filter(t => t.id === selectedDeviceId) as unknown as import('../store/mapStore').Tag[]) : []}
                historyPositions={positions}
                height="100%"
              />
            </div>
          </Card>

          {/* Positions table */}
          {selectedDeviceId && (
            <Card className="overflow-hidden border-gray-100 dark:border-slate-800 shadow-premium">
              {/* Table header */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Posições</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {historyTotal.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="datetime-local"
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                      title="Data Inicial"
                    />
                    <span className="text-gray-400 text-xs">até</span>
                    <input
                      type="datetime-local"
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                      title="Data Final"
                    />
                    {(historyStartDate || historyEndDate) && (
                      <button
                        onClick={() => {
                          setHistoryStartDate('');
                          setHistoryEndDate('');
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                        title="Limpar filtros"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  {historyTotalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage(p => p - 1)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium tabular-nums">
                        {historyPage} / {historyTotalPages}
                      </span>
                      <button
                        disabled={historyPage === historyTotalPages}
                        onClick={() => setHistoryPage(p => p + 1)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {positionsLoading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Carregando posições...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50">
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest w-12">#</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Data / Hora</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Latitude</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Longitude</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Velocidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {positions.length > 0 ? positions.map((pos, idx) => {
                        const isSelected = selectedPosition?.id === pos.id;
                        const speed = pos.speed ?? null;

                        return (
                          <tr
                            key={pos.id}
                            onClick={() => handlePositionClick(pos)}
                            className={`group cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/10'
                                : 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-mono text-gray-400 dark:text-slate-500 tabular-nums">
                                {(historyPage - 1) * POSITIONS_PER_PAGE + idx + 1}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                  {formatDate(pos.timestamp)}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-slate-500 font-mono tabular-nums">
                                  {formatTime(pos.timestamp)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tabular-nums">
                                {pos.latitude.toFixed(6)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tabular-nums">
                                {pos.longitude.toFixed(6)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {speed !== null ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  speed < 20
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                    : speed < 60
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                }`}>
                                  {speed.toFixed(1)} km/h
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-14 text-center">
                            <MapPin className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 dark:text-slate-500">
                              Nenhuma posição registrada para este dispositivo.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Modal - Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTag ? 'Editar Dispositivo' : 'Novo Dispositivo'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identificador BRGPS</label>
              <input
                type="text"
                value={formData.brgpsId}
                onChange={(e) => setFormData({ ...formData, brgpsId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                placeholder="Ex: 3092505932"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nome do Dispositivo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                placeholder="Ex: Caminhão Scania 01"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                placeholder="Detalhes adicionais..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Status Operacional</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">URL do Traccar (Opcional)</label>
              <input
                type="url"
                value={formData.traccarUrl}
                onChange={(e) => setFormData({ ...formData, traccarUrl: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                placeholder="Ex: http://acesso.ljlrastreadores.com.br:5055"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Se não informado, as posições não serão enviadas para o Traccar</p>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" variant="strong" className="flex-1">Salvar</Button>
          </div>
        </form>
      </Modal>

      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={loadTags}
      />
    </div>
  );
}
