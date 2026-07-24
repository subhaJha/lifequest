import React, { useEffect, useState } from 'react';
import { type Building, BUILDING_CONFIG, RESOURCE_ICONS } from '../../game/types/buildingTypes';
import '../../styles/BuildingInfoPanel.css';

interface BuildingInfoPanelProps {
  building: Building | null;
  onClose: () => void;
}

export const BuildingInfoPanel: React.FC<BuildingInfoPanelProps> = ({
  building,
  onClose,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!building?.upgradingUntil) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const completion = new Date(building.upgradingUntil!).getTime();
      const remaining = completion - now;

      if (remaining <= 0) {
        setTimeRemaining('Complete!');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [building?.upgradingUntil]);

  if (!building) {
    return null;
  }

  const config = BUILDING_CONFIG[building.buildingType];
  const healthPercentage = (building.health / building.maxHealth) * 100;
  const isUpgrading = building.upgradingUntil && new Date(building.upgradingUntil) > new Date();

  return (
    <div className="building-info-panel">
      <div className="panel-header">
        <h2>{config.name}</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="panel-content">
        <p className="description">{config.description}</p>

        {/* Level */}
        <div className="info-row">
          <span className="label">Level:</span>
          <span className="value">
            {building.level} {building.level >= 10 ? '(MAX)' : ''}
          </span>
        </div>

        {/* Health */}
        <div className="info-row">
          <span className="label">Health:</span>
          <div className="health-bar-container">
            <div
              className="health-bar-fill"
              style={{ width: `${healthPercentage}%` }}
            />
            <span className="health-text">
              {building.health}/{building.maxHealth}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="info-row">
          <span className="label">Status:</span>
          <span className={`status ${isUpgrading ? 'upgrading' : 'idle'}`}>
            {isUpgrading ? `Upgrading (${timeRemaining})` : 'Idle'}
          </span>
        </div>

        {/* Production */}
        <div className="production-section">
          <h3>Production</h3>
          <div className="production-items">
            {building.resources.goldProduction > 0 && (
              <div className="production-item">
                <span>{RESOURCE_ICONS.gold} {building.resources.goldProduction}/level</span>
              </div>
            )}
            {building.resources.woodProduction > 0 && (
              <div className="production-item">
                <span>{RESOURCE_ICONS.wood} {building.resources.woodProduction}/level</span>
              </div>
            )}
            {building.resources.stoneProduction > 0 && (
              <div className="production-item">
                <span>{RESOURCE_ICONS.stone} {building.resources.stoneProduction}/level</span>
              </div>
            )}
            {building.resources.goldProduction === 0 &&
              building.resources.woodProduction === 0 &&
              building.resources.stoneProduction === 0 && (
                <span className="no-production">No production</span>
              )}
          </div>
        </div>

        {/* Position */}
        <div className="info-row">
          <span className="label">Position:</span>
          <span className="value">
            ({building.position.x}, {building.position.y})
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuildingInfoPanel;
