
import { DistrictCard } from './DistrictCard';

type DistrictItem = {
  key: string;
  name: string;
  points: number;
progress: { level: number; currentXP: number; nextLevelXP: number; totalPoints: number; progressPercent: number } | null;

};


export function KingdomOverview({ districts }: { districts: DistrictItem[] }) {

  if (!districts || districts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white text-sm text-gray-300">
        No district data.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {districts.map((d) => (
        <DistrictCard key={d.key} name={d.name} points={d.points} progress={d.progress} />

      ))}

    </div>

  );
}

