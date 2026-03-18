import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '../../store/mapStore';
import type { Tag, Position } from '../../store/mapStore';
import { Clock, Zap } from 'lucide-react';

const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #2563EB;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const inactiveIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #6B7280;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const selectedIcon = L.divIcon({
  className: 'custom-marker selected',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: #F97316;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(249,115,22,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s ease-in-out infinite;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface MapControlsProps {
  center: [number, number];
  zoom: number;
}

function MapControls({ center, zoom }: MapControlsProps) {
  const map = useMap();
  
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);
  
  return null;
}

interface DeviceMapProps {
  devices: Tag[];
  onDeviceClick?: (device: Tag) => void;
  onViewHistory?: (device: Tag) => void;
  historyPositions?: Position[];
  height?: string;
}

export function DeviceMap({ 
  devices, 
  onDeviceClick, 
  onViewHistory, 
  historyPositions,
  height = '100%' 
}: DeviceMapProps) {
  const { center, zoom, selectedDeviceId, selectedPosition } = useMapStore();

  const activeDevices = devices.filter(d => d.lastLatitude && d.lastLongitude);

  return (
    <MapContainer
      center={center[0] === 0 && center[1] === 0 ? [-23.5505, -46.6333] : center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapControls center={center} zoom={zoom} />
      
      {activeDevices.map((device) => {
        const isSelected = selectedDeviceId === device.id;
        const hasPosition = device.lastLatitude && device.lastLongitude;
        
        if (!hasPosition) return null;
        
        return (
          <Marker
            key={device.id}
            position={[device.lastLatitude!, device.lastLongitude!]}
            icon={isSelected ? selectedIcon : (device.status === 'ACTIVE' ? defaultIcon : inactiveIcon)}
            eventHandlers={{
              click: () => onDeviceClick?.(device),
            }}
          >
            <Popup>
              <div style={{ 
                minWidth: '180px', 
                fontFamily: 'system-ui, sans-serif',
                padding: '4px'
              }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  color: '#1F2937',
                  marginBottom: '4px'
                }}>
                  {device.name}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6B7280',
                  marginBottom: '8px',
                  fontFamily: 'monospace'
                }}>
                  {device.brgpsId}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontSize: '11px',
                  color: device.status === 'ACTIVE' ? '#059669' : '#6B7280',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: device.status === 'ACTIVE' ? '#059669' : '#6B7280'
                  }} />
                  {device.status === 'ACTIVE' ? 'Online' : 'Offline'}
                </div>
                {device.lastSpeed !== null && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '11px', 
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}>
                    <Zap size={10} />
                    {device.lastSpeed.toFixed(1)} km/h
                  </div>
                )}
                {device.lastPositionAt && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '10px', 
                    color: '#9CA3AF',
                    marginBottom: '8px'
                  }}>
                    <Clock size={10} />
                    {new Date(device.lastPositionAt).toLocaleString('pt-BR')}
                  </div>
                )}
                {onViewHistory && (
                  <button
                    onClick={() => onViewHistory(device)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={12} />
                    Ver Histórico
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {historyPositions?.map((pos) => (
        <CircleMarker
          key={pos.id}
          center={[pos.latitude, pos.longitude]}
          radius={4}
          pathOptions={{
            fillColor: selectedPosition?.id === pos.id ? '#F97316' : '#3B82F6',
            fillOpacity: selectedPosition?.id === pos.id ? 1 : 0.6,
            color: selectedPosition?.id === pos.id ? '#F97316' : '#3B82F6',
            weight: selectedPosition?.id === pos.id ? 2 : 1,
          }}
        />
      ))}
      
      {selectedPosition && (
        <CircleMarker
          center={[selectedPosition.latitude, selectedPosition.longitude]}
          radius={8}
          pathOptions={{
            fillColor: '#F97316',
            fillOpacity: 0.8,
            color: '#F97316',
            weight: 2,
          }}
        />
      )}
    </MapContainer>
  );
}

export function MapLoading() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px'
        }} />
        <p style={{ color: '#6B7280', fontSize: '12px' }}>Carregando mapa...</p>
      </div>
    </div>
  );
}
