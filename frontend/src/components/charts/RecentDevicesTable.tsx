import { useState } from 'react';
import { ArrowUpDown, MapPin, Signal, SignalZero, Clock } from 'lucide-react';
import type { DeviceWithMetrics } from '../../types/analytics';

interface RecentDevicesTableProps {
  devices: DeviceWithMetrics[];
  limit?: number;
}

type SortField = 'name' | 'status' | 'lastSyncFormatted' | 'offlineDuration';
type SortOrder = 'asc' | 'desc';

export function RecentDevicesTable({ devices, limit = 10 }: RecentDevicesTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastSyncFormatted');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedDevices = [...devices]
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name': {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case 'status': {
          const statusA = a.status === 'ACTIVE' ? 1 : 0;
          const statusB = b.status === 'ACTIVE' ? 1 : 0;
          comparison = statusA - statusB;
          break;
        }
        case 'lastSyncFormatted': {
          const dateA = a.lastSyncAt ? new Date(a.lastSyncAt).getTime() : 0;
          const dateB = b.lastSyncAt ? new Date(b.lastSyncAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case 'offlineDuration': {
          const isOfflineA = a.status !== 'ACTIVE';
          const isOfflineB = b.status !== 'ACTIVE';
          comparison = (isOfflineB ? 1 : 0) - (isOfflineA ? 1 : 0);
          break;
        }
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    })
    .slice(0, limit);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700">
            <th 
              className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => handleSort('name')}
            >
              Dispositivo 
              <ArrowUpDown className={`w-3 h-3 ml-1 inline transition-colors ${sortField === 'name' ? 'text-blue-600' : 'text-gray-400'}`} />
            </th>
            <th 
              className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => handleSort('status')}
            >
              Status 
              <ArrowUpDown className={`w-3 h-3 ml-1 inline transition-colors ${sortField === 'status' ? 'text-blue-600' : 'text-gray-400'}`} />
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Última Posição
            </th>
            <th 
              className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => handleSort('lastSyncFormatted')}
            >
              Última Sinc. 
              <ArrowUpDown className={`w-3 h-3 ml-1 inline transition-colors ${sortField === 'lastSyncFormatted' ? 'text-blue-600' : 'text-gray-400'}`} />
            </th>
            <th 
              className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => handleSort('offlineDuration')}
            >
              Tempo Offline 
              <ArrowUpDown className={`w-3 h-3 ml-1 inline transition-colors ${sortField === 'offlineDuration' ? 'text-blue-600' : 'text-gray-400'}`} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {sortedDevices.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum dispositivo encontrado
              </td>
            </tr>
          ) : (
            sortedDevices.map((device) => (
              <tr 
                key={device.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      device.status === 'ACTIVE' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      {device.status === 'ACTIVE' ? (
                        <Signal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <SignalZero className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {device.brgpsId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    device.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      device.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    {device.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {device.lastLatitude && device.lastLongitude ? (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs">
                        {device.lastLatitude.toFixed(4)}, {device.lastLongitude.toFixed(4)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{device.lastSyncFormatted}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {device.offlineDuration ? (
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {device.offlineDuration}
                    </span>
                  ) : (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      Online
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
