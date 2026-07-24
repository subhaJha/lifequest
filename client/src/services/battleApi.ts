import {
  StartBattleResponse,
  GetBattleResponse,
  AttackResponse,
  CompleteBattleResponse,
  BattleHistoryResponse,
  BattleStatsResponse,
} from '../types/battleTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const battleAPI = {
  /**
   * Start a new battle
   */
  async startBattle(
    taskId: string,
    taskDifficulty: string
  ): Promise<StartBattleResponse> {
    const response = await fetch(`${API_BASE_URL}/battles/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ taskId, taskDifficulty }),
    });
    if (!response.ok) throw new Error('Failed to start battle');
    return response.json();
  },

  /**
   * Get current battle state
   */
  async getBattle(battleId: string): Promise<GetBattleResponse> {
    const response = await fetch(`${API_BASE_URL}/battles/${battleId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get battle');
    return response.json();
  },

  /**
   * Hero attacks monster
   */
  async heroAttack(battleId: string): Promise<AttackResponse> {
    const response = await fetch(
      `${API_BASE_URL}/battles/${battleId}/hero-attack`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );
    if (!response.ok) throw new Error('Failed to attack');
    return response.json();
  },

  /**
   * Monster attacks hero
   */
  async monsterAttack(battleId: string): Promise<AttackResponse> {
    const response = await fetch(
      `${API_BASE_URL}/battles/${battleId}/monster-attack`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );
    if (!response.ok) throw new Error('Monster attack failed');
    return response.json();
  },

  /**
   * Complete battle and award rewards
   */
  async completeBattle(
    battleId: string,
    taskId: string
  ): Promise<CompleteBattleResponse> {
    const response = await fetch(
      `${API_BASE_URL}/battles/${battleId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId }),
      }
    );
    if (!response.ok) throw new Error('Failed to complete battle');
    return response.json();
  },

  /**
   * Get battle history
   */
  async getBattleHistory(limit: number = 10): Promise<BattleHistoryResponse> {
    const response = await fetch(
      `${API_BASE_URL}/battles/history?limit=${limit}`,
      {
        credentials: 'include',
      }
    );
    if (!response.ok) throw new Error('Failed to get battle history');
    return response.json();
  },

  /**
   * Get battle statistics
   */
  async getBattleStats(): Promise<BattleStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/battles/stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get battle stats');
    return response.json();
  },

  /**
   * Forfeit battle
   */
  async forfeitBattle(battleId: string): Promise<GetBattleResponse> {
    const response = await fetch(
      `${API_BASE_URL}/battles/${battleId}/forfeit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );
    if (!response.ok) throw new Error('Failed to forfeit battle');
    return response.json();
  },
};

export default battleAPI;
