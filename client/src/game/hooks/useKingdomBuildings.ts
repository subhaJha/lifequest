import { useState, useCallback, useEffect } from 'react';
import { Building, KingdomResources, BuildingUpgrade, KingdomStats } from '../types/buildingTypes';
import buildingAPI from '../../services/buildingApi';

interface UseKingdomBuildingsState {
  buildings: Building[];
  resources: KingdomResources | null;
  stats: KingdomStats | null;
  loading: boolean;
  error: string | null;
}

interface UseKingdomBuildingsActions {
  loadBuildings: () => Promise<void>;
  loadResources: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadAll: () => Promise<void>;
  harvestResources: () => Promise<{ gold: number; wood: number; stone: number } | null>;
  startUpgrade: (buildingId: string) => Promise<BuildingUpgrade | null>;
  completeUpgrade: (upgradeId: string) => Promise<BuildingUpgrade | null>;
  unlockBuilding: (buildingType: string, position: { x: number; y: number }) => Promise<Building | null>;
  refresh: () => Promise<void>;
}

export const useKingdomBuildings = (autoRefresh = true): UseKingdomBuildingsState & UseKingdomBuildingsActions => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [resources, setResources] = useState<KingdomResources | null>(null);
  const [stats, setStats] = useState<KingdomStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all buildings
   */
  const loadBuildings = useCallback(async () => {
    try {
      const result = await buildingAPI.getBuildings();
      if (result.success) {
        setBuildings(result.buildings);
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load buildings';
      setError(message);
      console.error(message);
    }
  }, []);

  /**
   * Load resources
   */
  const loadResources = useCallback(async () => {
    try {
      const result = await buildingAPI.getResources();
      if (result.success) {
        setResources(result.resources);
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load resources';
      setError(message);
      console.error(message);
    }
  }, []);

  /**
   * Load stats
   */
  const loadStats = useCallback(async () => {
    try {
      const result = await buildingAPI.getKingdomStats();
      if (result.success) {
        setStats(result.stats);
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
      console.error(message);
    }
  }, []);

  /**
   * Load all data at once
   */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadBuildings(), loadResources(), loadStats()]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load kingdom data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadBuildings, loadResources, loadStats]);

  /**
   * Harvest resources
   */
  const harvestResources = useCallback(async () => {
    try {
      const result = await buildingAPI.harvestResources();
      if (result.success) {
        setResources(result.resources);
        setError(null);
        return result.harvested;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to harvest resources';
      setError(message);
      console.error(message);
    }
    return null;
  }, []);

  /**
   * Start upgrade
   */
  const startUpgrade = useCallback(async (buildingId: string) => {
    try {
      const result = await buildingAPI.startUpgrade(buildingId);
      if (result.success) {
        setError(null);
        await loadAll();
        return result.upgrade;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start upgrade';
      setError(message);
      console.error(message);
    }
    return null;
  }, [loadAll]);

  /**
   * Complete upgrade
   */
  const completeUpgrade = useCallback(async (upgradeId: string) => {
    try {
      const result = await buildingAPI.completeUpgrade(upgradeId);
      if (result.success) {
        setError(null);
        await loadAll();
        return result.upgrade;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete upgrade';
      setError(message);
      console.error(message);
    }
    return null;
  }, [loadAll]);

  /**
   * Unlock building
   */
  const unlockBuilding = useCallback(
    async (buildingType: string, position: { x: number; y: number }) => {
      try {
        const result = await buildingAPI.unlockBuilding(buildingType, position);
        if (result.success) {
          setError(null);
          await loadAll();
          return result.building;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlock building';
        setError(message);
        console.error(message);
      }
      return null;
    },
    [loadAll]
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial load
    loadAll();

    // Refresh every 5 seconds
    const interval = setInterval(loadAll, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadAll]);

  return {
    buildings,
    resources,
    stats,
    loading,
    error,
    loadBuildings,
    loadResources,
    loadStats,
    loadAll,
    harvestResources,
    startUpgrade,
    completeUpgrade,
    unlockBuilding,
    refresh,
  };
};

export default useKingdomBuildings;
