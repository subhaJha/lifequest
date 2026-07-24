import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { kingdomAPI, type KingdomOverviewResponse } from '../services/kingdomApi';
import { KingdomOverview } from '../components/Kingdom/KingdomOverview';
import { BuildingSystem } from '../components/Building/BuildingSystem';



export const Kingdom: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KingdomOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!isLoggedIn) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await kingdomAPI.getOverview();
        setData(res.data);
      } catch {
        setError('Failed to load kingdom overview.');
        toast.error('Failed to load kingdom overview.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isLoggedIn]);

  const districts = useMemo(() => {
    const points = data?.districtPoints ?? {};
    const progress = data?.districtProgress ?? undefined;


    const keys = [
      'health',
      'learning',
      'career',
      'finance',
      'social',
      'mindfulness',
    ] as const;

  return keys.map((key) => ({
      key,
      name: key,
      points: points[key] ?? 0,
      progress: progress?.[key] ?? null,
    }));
  }, [data]);


  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">Loading kingdom...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <div className="font-bold mb-2">Unable to load kingdom</div>
        <div className="text-sm text-gray-300">{error ?? 'Unknown error'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Kingdom</h2>
        <p className="text-sm text-gray-300 mt-1">Your district progression and points.</p>
      </div>

      <KingdomOverview districts={districts} />

      <hr className="border-gray-700 my-8" />

      <BuildingSystem />
    </div>
  );

};

