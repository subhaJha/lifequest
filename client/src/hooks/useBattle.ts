import { useState, useCallback } from 'react';
import battleAPI from '../services/battleApi';
import { Battle, BattleStats, BattleUIState, BattleStatus } from '../game/types/battleTypes';

/**
 * useBattle Hook
 * Custom hook for managing battle state and operations
 */
export const useBattle = () => {
  const [battleState, setBattleState] = useState<BattleUIState>({
    battleId: '',
    isLoading: false,
    error: null,
    battleStatus: BattleStatus.IN_PROGRESS,
    heroHealth: 100,
    monsterHealth: 100,
    currentTurn: 'hero',
    isPlayerTurn: true,
    battleLog: [],
    battleEnded: false,
  });

  const [battleStats, setBattleStats] = useState<BattleStats | null>(null);
  const [battleHistory, setBattleHistory] = useState<Battle[]>([]);

  /**
   * Start a new battle
   */
  const startBattle = useCallback(
    async (taskId: string, taskDifficulty: string) => {
      setBattleState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await battleAPI.startBattle(taskId, taskDifficulty);

        if (response.success) {
          setBattleState((prev) => ({
            ...prev,
            battleId: response.battle._id,
            heroHealth: response.battle.heroStats.currentHealth,
            monsterHealth: response.battle.monsterStats.currentHealth,
            battleStatus: response.battle.status,
            isLoading: false,
          }));

          return response.battle;
        }
      } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to start battle';
        setBattleState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Get battle state
   */
  const getBattle = useCallback(async (battleId: string) => {
    try {
      const response = await battleAPI.getBattle(battleId);

      if (response.success) {
        setBattleState((prev) => ({
          ...prev,
          heroHealth: response.battle.heroStats.currentHealth,
          monsterHealth: response.battle.monsterStats.currentHealth,
          battleStatus: response.battle.status,
        }));

        return response.battle;
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to get battle';
      setBattleState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Perform hero attack
   */
  const heroAttack = useCallback(async (battleId: string) => {
    setBattleState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const response = await battleAPI.heroAttack(battleId);

      if (response.success) {
        setBattleState((prev) => ({
          ...prev,
          monsterHealth: response.battle.monsterStats.currentHealth,
          isLoading: false,
          currentTurn: 'monster',
          isPlayerTurn: false,
          battleStatus: response.battle.status,
        }));

        return response;
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Attack failed';
      setBattleState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Perform monster attack
   */
  const monsterAttack = useCallback(async (battleId: string) => {
    setBattleState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const response = await battleAPI.monsterAttack(battleId);

      if (response.success) {
        setBattleState((prev) => ({
          ...prev,
          heroHealth: response.battle.heroStats.currentHealth,
          isLoading: false,
          currentTurn: 'hero',
          isPlayerTurn: true,
          battleStatus: response.battle.status,
        }));

        return response;
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Monster attack failed';
      setBattleState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Complete battle
   */
  const completeBattle = useCallback(
    async (battleId: string, taskId: string) => {
      setBattleState((prev) => ({
        ...prev,
        isLoading: true,
      }));

      try {
        const response = await battleAPI.completeBattle(battleId, taskId);

        if (response.success) {
          setBattleState((prev) => ({
            ...prev,
            isLoading: false,
            battleEnded: true,
            battleStatus: BattleStatus.VICTORY,
            rewards: response.rewards,
          }));

          return response;
        }
      } catch (error) {
        const errorMessage =
          (error as Error).message || 'Failed to complete battle';
        setBattleState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Get battle history
   */
  const getBattleHistory = useCallback(async (limit: number = 10) => {
    try {
      const response = await battleAPI.getBattleHistory(limit);

      if (response.success) {
        setBattleHistory(response.battles);
        return response.battles;
      }
    } catch (error) {
      console.error('Failed to get battle history:', error);
      throw error;
    }
  }, []);

  /**
   * Get battle statistics
   */
  const getBattleStatsData = useCallback(async () => {
    try {
      const response = await battleAPI.getBattleStats();

      if (response.success) {
        setBattleStats(response.stats);
        return response.stats;
      }
    } catch (error) {
      console.error('Failed to get battle stats:', error);
      throw error;
    }
  }, []);

  /**
   * Forfeit battle
   */
  const forfeitBattle = useCallback(async (battleId: string) => {
    try {
      const response = await battleAPI.forfeitBattle(battleId);

      if (response.success) {
        setBattleState((prev) => ({
          ...prev,
          battleEnded: true,
          battleStatus: BattleStatus.DEFEAT,
        }));

        return response;
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to forfeit';
      setBattleState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Add message to battle log
   */
  const addLog = useCallback((message: string) => {
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, message],
    }));
  }, []);

  /**
   * Clear battle state
   */
  const clearBattle = useCallback(() => {
    setBattleState({
      battleId: '',
      isLoading: false,
      error: null,
      battleStatus: BattleStatus.IN_PROGRESS,
      heroHealth: 100,
      monsterHealth: 100,
      currentTurn: 'hero',
      isPlayerTurn: true,
      battleLog: [],
      battleEnded: false,
    });
  }, []);

  /**
   * Set error message
   */
  const setError = useCallback((error: string | null) => {
    setBattleState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  return {
    // State
    battleState,
    battleStats,
    battleHistory,

    // Actions
    startBattle,
    getBattle,
    heroAttack,
    monsterAttack,
    completeBattle,
    getBattleHistory,
    getBattleStatsData,
    forfeitBattle,
    addLog,
    clearBattle,
    setError,
  };
};

export default useBattle;
