import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, MapPin, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { tagsApi } from '../services/api';
import { useModalStore } from '../store/modalStore';
import { BulkImportModal } from '../components/BulkImportModal';

interface Tag {
  id: string;
  brgpsId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLatitude?: number;
  lastLongitude?: number;
  lastSyncAt?: string;
}

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Filtros e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    brgpsId: '',
    name: '',
    description: '',
    status: 'ACTIVE',
  });
  const { showAlert, showConfirm } = useModalStore();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtro e Pesquisa
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

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTags.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTags, currentPage]);

  // Resetar página ao filtrar
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
      setFormData({ brgpsId: '', name: '', description: '', status: 'ACTIVE' });
      loadTags();
    } catch (error: any) {
      console.error('Erro ao salvar tag:', error);
      showAlert({ title: 'Erro', message: error.response?.data?.message || 'Falha ao salvar.', type: 'danger' });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      brgpsId: tag.brgpsId,
      name: tag.name,
      description: tag.description || '',
      status: tag.status,
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
        } catch (error) {
          showAlert({ title: 'Erro', message: 'Falha ao excluir.', type: 'danger' });
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
    <div className="p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Dispositivos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciando <span className="text-blue-600 font-bold">{tags.length}</span> rastreadores cadastrados.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowBulkModal(true)} variant="secondary" size="md">
            <Search className="w-5 h-5 mr-2" />
            Importar
          </Button>
          <Button onClick={() => { setEditingTag(null); setFormData({ brgpsId: '', name: '', description: '', status: 'ACTIVE' }); setShowModal(true); }} variant="strong" size="md">
            <Plus className="w-5 h-5 mr-2" />
            Novo Dispositivo
          </Button>
        </div>
      </div>

      {/* Barra de Ferramentas - Filtros e Pesquisa */}
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
                        onClick={() => tag.lastLatitude && tag.lastLongitude && window.open(`https://www.google.com/maps/search/?api=1&query=${tag.lastLatitude},${tag.lastLongitude}`, '_blank')}
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
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${tag.lastLatitude},${tag.lastLongitude}`, '_blank')}
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
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sem sinal GPS</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                        title="Editar Detalhes"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                        title="Remover Dispositivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-full">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium italic">Nenhum dispositivo encontrado com os filtros atuais.</p>
                      <Button variant="secondary" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>Limpar Filtros</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé - Paginação */}
        {filteredTags.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Mostrando <span className="text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTags.length)}</span> de <span className="text-gray-900 dark:text-white">{filteredTags.length}</span> registros
            </p>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-750 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i + 1;
                  // Lógica simples para mostrar páginas ao redor da atual se houver muitas
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                  }
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-750'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-750 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
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
