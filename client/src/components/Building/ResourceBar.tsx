import React from 'react';
import { type KingdomResources, RESOURCE_ICONS, RESOURCE_COLORS } from '../../game/types/buildingTypes';
import '../../styles/ResourceBar.css';

interface ResourceBarProps {
  resources: KingdomResources | null;
  loading?: boolean;
}

export const ResourceBar: React.FC<ResourceBarProps> = ({ resources, loading = false }) => {
  if (loading || !resources) {
    return (
      <div className="resource-bar">
        <div className="resource-loading">Loading resources...</div>
      </div>
    );
  }

  const getPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="resource-bar">
      <div className="resources-container">
        {/* Gold */}
        <div className="resource-item">
          <div className="resource-icon">{RESOURCE_ICONS.gold}</div>
          <div className="resource-content">
            <div className="resource-name">Gold</div>
            <div className="resource-bar-container">
              <div
                className="resource-bar-fill"
                style={{
                  backgroundColor: RESOURCE_COLORS.gold,
                  width: `${getPercentage(resources.gold, resources.goldCapacity)}%`,
                }}
              />
            </div>
            <div className="resource-text">
              {resources.gold.toLocaleString()} / {resources.goldCapacity.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Wood */}
        <div className="resource-item">
          <div className="resource-icon">{RESOURCE_ICONS.wood}</div>
          <div className="resource-content">
            <div className="resource-name">Wood</div>
            <div className="resource-bar-container">
              <div
                className="resource-bar-fill"
                style={{
                  backgroundColor: RESOURCE_COLORS.wood,
                  width: `${getPercentage(resources.wood, resources.woodCapacity)}%`,
                }}
              />
            </div>
            <div className="resource-text">
              {resources.wood.toLocaleString()} / {resources.woodCapacity.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stone */}
        <div className="resource-item">
          <div className="resource-icon">{RESOURCE_ICONS.stone}</div>
          <div className="resource-content">
            <div className="resource-name">Stone</div>
            <div className="resource-bar-container">
              <div
                className="resource-bar-fill"
                style={{
                  backgroundColor: RESOURCE_COLORS.stone,
                  width: `${getPercentage(resources.stone, resources.stoneCapacity)}%`,
                }}
              />
            </div>
            <div className="resource-text">
              {resources.stone.toLocaleString()} / {resources.stoneCapacity.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Harvest Rates */}
      <div className="harvest-rates">
        <span className="rate-item" title="Gold per minute">
          {RESOURCE_ICONS.gold} +{resources.harvestRate.goldPerMinute}/min
        </span>
        <span className="rate-item" title="Wood per minute">
          {RESOURCE_ICONS.wood} +{resources.harvestRate.woodPerMinute}/min
        </span>
        <span className="rate-item" title="Stone per minute">
          {RESOURCE_ICONS.stone} +{resources.harvestRate.stonePerMinute}/min
        </span>
      </div>
    </div>
  );
};

export default ResourceBar;
