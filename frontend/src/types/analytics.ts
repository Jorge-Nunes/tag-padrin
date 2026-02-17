export interface Tag {
  id: string;
  brgpsId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
  traccarUrl?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSpeed?: number;
  lastDirection?: number;
  lastPositionAt?: string;
  lastSyncAt?: string;
  lastTraccarSendAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  total: number;
  active: number;
  inactive: number;
  uptime: number;
  averageOfflineTime: string;
  newThisWeek: number;
  newThisMonth: number;
  tagsNeedingAttention: Tag[];
  recentActivity: ActivityPoint[];
}

export interface ActivityPoint {
  date: string;
  syncs: number;
  label: string;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DeviceWithMetrics extends Tag {
  offlineDuration?: string;
  lastSyncFormatted?: string;
}
