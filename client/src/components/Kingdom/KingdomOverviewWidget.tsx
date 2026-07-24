
import { DistrictProgressBar } from './DistrictProgressBar';

const ICONS: Record<string, string> = {
  health: '🩺',
  learning: '📚',
  career: '🏗️',
  finance: '💰',
  social: '🤝',
  mindfulness: '🧘',
};

type DistrictProgressLevel = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPoints: number;
  progressPercent: number;
};

export function KingdomOverviewWidget({
  data,
}: {
  data: {
    districtProgress?: Partial<Record<'health' | 'learning' | 'career' | 'finance' | 'social' | 'mindfulness', DistrictProgressLevel>>;
  } | null;
}) {

  const progress = data?.districtProgress ?? null;


  const districts = ['health', 'learning', 'career', 'finance', 'social', 'mindfulness'] as const;


  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Kingdom Overview</h3>
      </div>

      <div className="space-y-4">
        {districts.map((key) => {
          const p = progress?.[key];

          const level = p?.level ?? 1;

          const points = p?.totalPoints ?? 0;
          const cur = p?.currentXP ?? 0;
          const next = p?.nextLevelXP ?? 100;
          const pct = p?.progressPercent ?? 0;

          return (
            <div key={key} className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{ICONS[key] ?? '🏰'}</div>
                  <div className="text-sm text-gray-200 font-semibold capitalize">{key}</div>
                </div>
                <div className="text-sm text-gray-300">Lvl {level}</div>
              </div>

              <DistrictProgressBar progressPercent={pct} current={cur} next={next} />
              <div className="mt-1 text-xs text-gray-500">{points} points</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

