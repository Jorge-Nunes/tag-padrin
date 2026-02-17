import { useMemo } from 'react';
import type { Tag, AnalyticsData, ActivityPoint, StatusDistribution, DeviceWithMetrics } from '../types/analytics';

export function useAnalytics(tags: Tag[]): AnalyticsData {
  return useMemo(() => {
    const total = tags.length;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Helper function to check if a device is truly active (synced recently)
    const isDeviceActive = (t: Tag): boolean => {
      // Must have status ACTIVE and isActive flag
      if (t.status !== 'ACTIVE' || !t.isActive) return false;
      // Must have synced at least once
      if (!t.lastSyncAt) return false;
      // Must have synced within the last hour
      return new Date(t.lastSyncAt) >= oneHourAgo;
    };
    
    const active = tags.filter(isDeviceActive).length;
    const inactive = total - active;
    const uptime = total > 0 ? Math.round((active / total) * 100) : 0;

    // Calculate average offline time
    const offlineTags = tags.filter((t) => !isDeviceActive(t));
    let totalOfflineHours = 0;
    let offlineCount = 0;

    offlineTags.forEach((tag) => {
      if (tag.lastSyncAt) {
        const lastSync = new Date(tag.lastSyncAt);
        const hoursOffline = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        if (hoursOffline > 0) {
          totalOfflineHours += hoursOffline;
          offlineCount++;
        }
      }
    });

    const averageOfflineHours = offlineCount > 0 ? totalOfflineHours / offlineCount : 0;
    const averageOfflineTime = formatDuration(averageOfflineHours);

    // New tags this week/month
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const newThisWeek = tags.filter((t) => new Date(t.createdAt) >= oneWeekAgo).length;
    const newThisMonth = tags.filter((t) => new Date(t.createdAt) >= oneMonthAgo).length;

    // Tags needing attention (not active = never synced or offline > 1 hour)
    const tagsNeedingAttention = tags
      .filter((t) => !isDeviceActive(t))
      .sort((a, b) => {
        const dateA = a.lastSyncAt ? new Date(a.lastSyncAt) : new Date(0);
        const dateB = b.lastSyncAt ? new Date(b.lastSyncAt) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

    // Generate activity data for the last 7 days
    const recentActivity: ActivityPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      // Count tags that synced on this date
      const syncs = tags.filter((t) => {
        if (!t.lastSyncAt) return false;
        const syncDate = new Date(t.lastSyncAt).toISOString().split('T')[0];
        return syncDate === dateStr;
      }).length;

      recentActivity.push({ date: dateStr, syncs, label });
    }

    return {
      total,
      active,
      inactive,
      uptime,
      averageOfflineTime,
      newThisWeek,
      newThisMonth,
      tagsNeedingAttention,
      recentActivity,
    };
  }, [tags]);
}

export function useStatusDistribution(tags: Tag[]): StatusDistribution[] {
  return useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Helper function to check if a device is truly active (synced recently)
    const isDeviceActive = (t: Tag): boolean => {
      if (t.status !== 'ACTIVE' || !t.isActive) return false;
      if (!t.lastSyncAt) return false;
      return new Date(t.lastSyncAt) >= oneHourAgo;
    };
    
    const active = tags.filter(isDeviceActive).length;
    const inactive = tags.length - active;

    return [
      { name: 'Ativas', value: active, color: '#10B981' },
      { name: 'Inativas', value: inactive, color: '#F59E0B' },
    ];
  }, [tags]);
}

export function useDevicesWithMetrics(tags: Tag[]): DeviceWithMetrics[] {
  return useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Helper function to check if a device is truly active (synced recently)
    const isDeviceActive = (t: Tag): boolean => {
      if (t.status !== 'ACTIVE' || !t.isActive) return false;
      if (!t.lastSyncAt) return false;
      return new Date(t.lastSyncAt) >= oneHourAgo;
    };
    
    return tags
      .map((tag) => {
        let offlineDuration: string | undefined;
        let lastSyncFormatted: string | undefined;
        const isActive = isDeviceActive(tag);

        if (tag.lastSyncAt) {
          const lastSync = new Date(tag.lastSyncAt);
          const diffMs = now.getTime() - lastSync.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          // Show offline duration for inactive devices
          if (!isActive) {
            offlineDuration = formatDuration(diffHours);
          }

          // Format last sync relative time
          if (diffHours < 1) {
            const minutes = Math.round(diffMs / (1000 * 60));
            lastSyncFormatted = `${minutes} min atrás`;
          } else if (diffHours < 24) {
            lastSyncFormatted = `${Math.round(diffHours)}h atrás`;
          } else {
            const days = Math.round(diffHours / 24);
            lastSyncFormatted = `${days}d atrás`;
          }
        } else {
          offlineDuration = 'Nunca sincronizou';
          lastSyncFormatted = 'Nunca';
        }

        return {
          ...tag,
          offlineDuration,
          lastSyncFormatted,
        };
      })
      .sort((a, b) => {
        // Sort by last sync date (most recent first)
        const dateA = a.lastSyncAt ? new Date(a.lastSyncAt).getTime() : 0;
        const dateB = b.lastSyncAt ? new Date(b.lastSyncAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [tags]);
}

function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) {
      return `${days}d`;
    }
    return `${days}d ${remainingHours}h`;
  }
}
