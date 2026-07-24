import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ResourceBar from './ResourceBar';
import BuildingInfoPanel from './BuildingInfoPanel';
import UpgradeButton from './UpgradeButton';
import { type Building, type KingdomResources, type KingdomStats } from '../../game/types/buildingTypes';
import buildingAPI from '../../services/buildingApi';
import '../../styles/BuildingSystem.css';

export const BuildingSystem: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [resources, setResources] = useState<KingdomResources | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [stats, setStats] = useState<KingdomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [harvestInterval, setHarvestInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize kingdom and load data
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setLoading(true);

        // Try to initialize kingdom
        try {
          await buildingAPI.initializeKingdom();
        } catch (err) {
          // Might already be initialized, continue
        }

        // Load data
        await loadKingdomData();

        // Set up auto-harvest interval (every 5 seconds)
        const interval = setInterval(() => {
          loadKingdomData();
        }, 5000);
        setHarvestInterval(interval);

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load kingdom';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();

    return () => {
      if (harvestInterval) {
        clearInterval(harvestInterval);
      }
    };
  }, []);

  const loadKingdomData = async () => {
    try {
      const [buildingsRes, resourcesRes, statsRes] = await Promise.all([
        buildingAPI.getBuildings(),
        buildingAPI.getResources(),
        buildingAPI.getKingdomStats(),
      ]);

      if (buildingsRes.success) setBuildings(buildingsRes.buildings);
      if (resourcesRes.success) setResources(resourcesRes.resources);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load kingdom data:', err);
    }
  };

  const handleHarvest = async () => {
    try {
      const result = await buildingAPI.harvestResources();
      if (result.success && result.harvested) {
        const { gold, wood, stone } = result.harvested;
        const amounts = [];
        if (gold > 0) amounts.push(`${gold} Gold`);
        if (wood > 0) amounts.push(`${wood} Wood`);
        if (stone > 0) amounts.push(`${stone} Stone`);

        if (amounts.length > 0) {
          toast.success(`Harvested: ${amounts.join(', ')}`);
        }
      }
      await loadKingdomData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to harvest resources';
      toast.error(message);
    }
  };

  const handleUpgradeStart = async () => {
    toast.success('Upgrade started!');
    await loadKingdomData();
  };

  const handleUpgradeError = (error: string) => {
    toast.error(error);
  };

  if (loading) {
    return (
      <div className="building-system loading">
        <div className="loading-spinner" />
        <p>Initializing your kingdom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="building-system error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="building-system">
      {/* Header */}
      <div className="building-system-header">
        <h1>⚔️ Kingdom Management</h1>
        <div className="header-stats">
          {stats && (
            <>
              <span>🏰 {stats.unlockedBuildings}/{stats.buildings} Buildings</span>
              <span>❤️ {stats.totalHealth} Health</span>
              <span>⚙️ {stats.activeUpgrades} Upgrades</span>
            </>
          )}
        </div>
      </div>

      {/* Resource Bar */}
      {resources && <ResourceBar resources={resources} loading={false} />}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="harvest-button"
          onClick={handleHarvest}
          disabled={!resources}
          title="Harvest resources from buildings"
        >
          🌾 Harvest Resources
        </button>
        <button
          className="refresh-button"
          onClick={loadKingdomData}
          title="Refresh data"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Buildings List */}
      <div className="buildings-list">
        <h2>Buildings</h2>
        <div className="buildings-grid">
          {buildings.map((building) => (
            <div
              key={building._id}
              className={`building-card ${
                selectedBuilding?._id === building._id ? 'selected' : ''
              } ${!building.isUnlocked ? 'locked' : ''}`}
              onClick={() =>
                building.isUnlocked && setSelectedBuilding(building)
              }
            >
              <div className="building-header">
                <h3>{building.buildingType.toUpperCase()}</h3>
                <span className="building-level">Lvl {building.level}</span>
              </div>

              {building.isUnlocked ? (
                <>
                  <div className="building-health">
                    <div className="health-bar">
                      <div
                        className="health-fill"
                        style={{
                          width: `${(building.health / building.maxHealth) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{building.health}/{building.maxHealth}</span>
                  </div>

                  <div className="building-production">
                    {building.resources.goldProduction > 0 && (
                      <span>💰 {building.resources.goldProduction}/level</span>
                    )}
                    {building.resources.woodProduction > 0 && (
                      <span>🪵 {building.resources.woodProduction}/level</span>
                    )}
                    {building.resources.stoneProduction > 0 && (
                      <span>⛏️ {building.resources.stoneProduction}/level</span>
                    )}
                  </div>

                  <div className="building-status">
                    {building.upgradingUntil && new Date(building.upgradingUntil) > new Date() ? (
                      <span className="upgrading">⚙️ Upgrading...</span>
                    ) : building.level >= 10 ? (
                      <span className="maxed">⭐ Max Level</span>
                    ) : (
                      <span className="idle">✓ Idle</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="building-locked">🔒 Locked</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Building Info Panel */}
      {selectedBuilding && selectedBuilding.isUnlocked && resources && (
        <div className="panel-container">
          <BuildingInfoPanel
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
          />
          <UpgradeButton
            building={selectedBuilding}
            resources={resources}
            onUpgradeStart={handleUpgradeStart}
            onUpgradeError={handleUpgradeError}
          />
        </div>
      )}
    </div>
  );
};

export default BuildingSystem;
