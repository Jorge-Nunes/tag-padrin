import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { tagsApi } from '../services/api';
import { useMapStore } from '../store/mapStore';
import type { Position, Tag } from '../store/mapStore';
import { DeviceMap } from '../components/map/DeviceMap';

const ITEMS_PER_PAGE = 15;

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatSpeed(speed: number | null) {
  if (speed === null || speed === undefined) return '—';
  return `${speed.toFixed(1)} km/h`;
}

function formatDirection(direction: number | null) {
  if (direction === null || direction === undefined) return '—';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(direction / 45) % 8;
  return `${directions[index]} (${direction}°)`;
}

interface PositionResponse {
  data: Position[];
  total: number;
  page: number;
  totalPages: number;
}

export function DeviceHistory() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tagIdFromQuery = searchParams.get('tag');
  const navigate = useNavigate();
  
  const [device, setDevice] = useState<Tag | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { selectedPosition, setSelectedPosition, focusOnPosition } = useMapStore();

  const effectiveTagId = id || tagIdFromQuery;

  const loadAllTags = useCallback(async () => {
    try {
      const response = await tagsApi.getAll();
      setAllTags(response.data as Tag[]);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  }, []);

  const loadDevice = useCallback(async () => {
    if (!effectiveTagId) return;
    try {
      const response = await tagsApi.getById(effectiveTagId);
      setDevice(response.data);
    } catch (error) {
      console.error('Erro ao carregar dispositivo:', error);
    }
  }, [effectiveTagId]);

  const loadPositions = useCallback(async (page: number) => {
    if (!effectiveTagId) return;
    try {
      setPositionsLoading(true);
      const response = await tagsApi.getPositions(effectiveTagId, page, ITEMS_PER_PAGE);
      const data = response.data as PositionResponse;
      setPositions(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
    } finally {
      setPositionsLoading(false);
      setLoading(false);
    }
  }, [effectiveTagId]);

  useEffect(() => {
    if (effectiveTagId) {
      loadDevice();
      loadAllTags();
    }
  }, [effectiveTagId, loadDevice, loadAllTags]);

  useEffect(() => {
    if (effectiveTagId) {
      loadPositions(currentPage);
    }
  }, [effectiveTagId, currentPage, loadPositions]);

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    focusOnPosition(position);
  };

  const handleDeviceChange = (newTagId: string) => {
    navigate(`/tags?tag=${newTagId}`);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const filteredPositions = useMemo(() => {
    if (!searchTerm) return positions;
    const term = searchTerm.toLowerCase();
    return positions.filter(pos => 
      pos.latitude.toString().includes(term) ||
      pos.longitude.toString().includes(term) ||
      formatDate(pos.timestamp).includes(term)
    );
  }, [positions, searchTerm]);

  const getPageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/tags')}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Posições</h1>
            <select
              value={effectiveTagId || ''}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {device?.name || 'Dispositivo'} ({device?.brgpsId})
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-gray-50">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: device?.status === 'ACTIVE' ? '#10B981' : '#6B7280' }}
          />
          <span className="text-sm font-medium" style={{ color: device?.status === 'ACTIVE' ? '#10B981' : '#6B7280' }}>
            {device?.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Map and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Mapa</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div style={{ height: '300px' }}>
              <DeviceMap 
                devices={device ? [device] : []}
                historyPositions={positions}
                height="100%"
              />
            </div>
          </CardBody>
        </Card>

        {/* Positions Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">
                  Registros de Posição ({total.toLocaleString('pt-BR')})
                </h2>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar posição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
            </div>
          </CardHeader>
          
          {positionsLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Velocidade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Direção</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPositions.length > 0 ? filteredPositions.map((pos) => (
                      <tr
                        key={pos.id}
                        onClick={() => handlePositionClick(pos)}
                        className="cursor-pointer transition-colors hover:bg-blue-50"
                        style={{ 
                          backgroundColor: selectedPosition?.id === pos.id ? '#EFF6FF' : 'transparent'
                        }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{formatDate(pos.timestamp)}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatTime(pos.timestamp)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {pos.latitude.toFixed(6)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {pos.longitude.toFixed(6)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatSpeed(pos.speed)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDirection(pos.direction ?? pos.course ?? null)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ 
                                backgroundColor: pos.syncedToTraccar ? '#10B981' : '#6B7280',
                              }}
                            />
                            <span className="text-xs" style={{ color: pos.syncedToTraccar ? '#10B981' : '#6B7280' }}>
                              {pos.syncedToTraccar ? 'Sim' : 'Não'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">
                            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum registro de posição encontrado'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {getPageNumbers.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg border bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Clique em qualquer registro na tabela para visualizar a posição no mapa. 
          O marcador laranja indica a posição selecionada.
        </p>
      </div>
    </div>
  );
}
