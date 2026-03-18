import { create } from 'zustand';

export interface Position {
  id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  course: number | null;
  direction: number | null;
  timestamp: string;
  rawData: Record<string, unknown> | null;
  syncedToTraccar: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  brgpsId: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastSpeed: number | null;
  lastDirection: number | null;
  lastPositionAt: string | null;
  lastSyncAt: string | null;
}

interface MapState {
  selectedDeviceId: string | null;
  selectedPosition: Position | null;
  center: [number, number];
  zoom: number;
  setSelectedDevice: (id: string | null) => void;
  setSelectedPosition: (position: Position | null) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  focusOnDevice: (tag: Tag) => void;
  focusOnPosition: (position: Position) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedDeviceId: null,
  selectedPosition: null,
  center: [-23.5505, -46.6333],
  zoom: 10,
  
  setSelectedDevice: (id) => set({ selectedDeviceId: id }),
  
  setSelectedPosition: (position) => set({ selectedPosition: position }),
  
  setCenter: (center) => set({ center }),
  
  setZoom: (zoom) => set({ zoom }),
  
  focusOnDevice: (tag) => {
    if (tag.lastLatitude && tag.lastLongitude) {
      set({
        selectedDeviceId: tag.id,
        selectedPosition: null,
        center: [tag.lastLatitude, tag.lastLongitude],
        zoom: 14,
      });
    }
  },
  
  focusOnPosition: (position) => {
    set({
      selectedPosition: position,
      center: [position.latitude, position.longitude],
      zoom: 15,
    });
  },

  clearSelection: () => set({ selectedDeviceId: null, selectedPosition: null }),
}));
