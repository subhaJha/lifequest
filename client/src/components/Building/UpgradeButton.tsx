import React, { useState, useEffect } from 'react';
import { type Building, BUILDING_CONFIG, RESOURCE_ICONS } from '../../game/types/buildingTypes';
import { type KingdomResources } from '../../game/types/buildingTypes';
import buildingAPI from '../../services/buildingApi';
import '../../styles/UpgradeButton.css';

interface UpgradeButtonProps {
  building: Building;
  resources: KingdomResources | null;
  onUpgradeStart: () => void;
  onUpgradeError: (error: string) => void;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  building,
  resources,
  onUpgradeStart,
  onUpgradeError,
}) => {
  const [loading, setLoading] = useState(false);
  const config = BUILDING_CONFIG[building.buildingType];

  // Calculate upgrade cost
  const calculateUpgradeCost = (currentLevel: number) => {
    const baseCost = config.upgradeBaseCost;
    const multiplier = 1.5 ** (currentLevel - 1);
    return {
      gold: Math.floor(baseCost.gold * multiplier),
      wood: Math.floor(baseCost.wood * multiplier),
      stone: Math.floor(baseCost.stone * multiplier),
    };
  };

  const upgradeCost = calculateUpgradeCost(building.level);
  const isUpgrading =
    building.upgradingUntil && new Date(building.upgradingUntil) > new Date();
  const isMaxLevel = building.level >= 10;
  const canAfford =
    resources &&
    resources.gold >= upgradeCost.gold &&
    resources.wood >= upgradeCost.wood &&
    resources.stone >= upgradeCost.stone;

  const isDisabled = isUpgrading || isMaxLevel || !canAfford || loading;

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      await buildingAPI.startUpgrade(building._id);
      onUpgradeStart();
    } catch (error) {
      onUpgradeError(
        error instanceof Error ? error.message : 'Failed to start upgrade'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isMaxLevel) {
    return (
      <button className="upgrade-button max-level" disabled>
        Max Level Reached
      </button>
    );
  }

  if (isUpgrading) {
    return (
      <button className="upgrade-button upgrading" disabled>
        Upgrading...
      </button>
    );
  }

  return (
    <div className="upgrade-section">
      <button
        className={`upgrade-button ${canAfford ? 'ready' : 'insufficient'}`}
        onClick={handleUpgrade}
        disabled={isDisabled}
        title={
          !canAfford
            ? 'Insufficient resources'
            : `Upgrade to Level ${building.level + 1}`
        }
      >
        {loading ? 'Starting...' : `Upgrade to Level ${building.level + 1}`}
      </button>

      <div className="upgrade-cost">
        <h4>Upgrade Cost:</h4>
        <div className="cost-items">
          <div className={`cost-item ${upgradeCost.gold > 0 ? (canAfford ? 'can-afford' : 'insufficient') : 'none'}`}>
            <span>{RESOURCE_ICONS.gold}</span>
            <span>{upgradeCost.gold}</span>
          </div>
          <div className={`cost-item ${upgradeCost.wood > 0 ? (canAfford ? 'can-afford' : 'insufficient') : 'none'}`}>
            <span>{RESOURCE_ICONS.wood}</span>
            <span>{upgradeCost.wood}</span>
          </div>
          <div className={`cost-item ${upgradeCost.stone > 0 ? (canAfford ? 'can-afford' : 'insufficient') : 'none'}`}>
            <span>{RESOURCE_ICONS.stone}</span>
            <span>{upgradeCost.stone}</span>
          </div>
        </div>
        <p className="upgrade-time">
          ⏱️ Takes {config.upgradeDurationSeconds} seconds
        </p>
      </div>
    </div>
  );
};

export default UpgradeButton;
