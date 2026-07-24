import type { Building, KingdomResources, BuildingUpgrade, KingdomStats } from '../game/types/buildingTypes';
import { API_BASE_URL } from '../game/api/config';

const BUILDINGS_API = `${API_BASE_URL}/buildings`;

export const buildingAPI = {
  /**
   * Initialize kingdom
   */
  async initializeKingdom(): Promise<{ success: boolean; building: Building }> {
    const response = await fetch(`${BUILDINGS_API}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to initialize kingdom');
    return response.json();
  },

  /**
   * Get all buildings
   */
  async getBuildings(): Promise<{ success: boolean; buildings: Building[] }> {
    const response = await fetch(`${BUILDINGS_API}/buildings`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch buildings');
    return response.json();
  },

  /**
   * Get single building
   */
  async getBuilding(buildingId: string): Promise<{ success: boolean; building: Building }> {
    const response = await fetch(`${BUILDINGS_API}/buildings/${buildingId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch building');
    return response.json();
  },

  /**
   * Unlock building
   */
  async unlockBuilding(
    buildingType: string,
    position: { x: number; y: number }
  ): Promise<{ success: boolean; building: Building }> {
    const response = await fetch(`${BUILDINGS_API}/buildings/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ buildingType, position }),
    });
    if (!response.ok) throw new Error('Failed to unlock building');
    return response.json();
  },

  /**
   * Start upgrade
   */
  async startUpgrade(
    buildingId: string
  ): Promise<{ success: boolean; upgrade: BuildingUpgrade; completionTime: string }> {
    const response = await fetch(`${BUILDINGS_API}/buildings/${buildingId}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to start upgrade');
    return response.json();
  },

  /**
   * Complete upgrade
   */
  async completeUpgrade(
    upgradeId: string
  ): Promise<{ success: boolean; upgrade: BuildingUpgrade }> {
    const response = await fetch(
      `${BUILDINGS_API}/buildings/upgrade/${upgradeId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );
    if (!response.ok) throw new Error('Failed to complete upgrade');
    return response.json();
  },

  /**
   * Harvest resources
   */
  async harvestResources(): Promise<{
    success: boolean;
    harvested: { gold: number; wood: number; stone: number };
    resources: KingdomResources;
  }> {
    const response = await fetch(`${BUILDINGS_API}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to harvest resources');
    return response.json();
  },

  /**
   * Get resources
   */
  async getResources(): Promise<{ success: boolean; resources: KingdomResources }> {
    const response = await fetch(`${BUILDINGS_API}/resources`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
  },

  /**
   * Get kingdom stats
   */
  async getKingdomStats(): Promise<{ success: boolean; stats: KingdomStats }> {
    const response = await fetch(`${BUILDINGS_API}/stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch kingdom stats');
    return response.json();
  },

  /**
   * Award resources for task
   */
  async awardResourcesForTask(
    taskDifficulty: string
  ): Promise<{
    success: boolean;
    award: { gold: number; wood: number; stone: number };
    resources: KingdomResources;
  }> {
    const response = await fetch(`${BUILDINGS_API}/award-resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ taskDifficulty }),
    });
    if (!response.ok) throw new Error('Failed to award resources');
    return response.json();
  },
};

export default buildingAPI;
