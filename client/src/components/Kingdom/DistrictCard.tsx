
import { DistrictProgressBar } from './DistrictProgressBar';

const ICONS: Record<string, string> = {
  health: '🩺',
  learning: '📚',
  career: '🏗️',
  finance: '💰',
  social: '🤝',
  mindfulness: '🧘',
};

const labels: Record<string, string> = {
  health: 'Health',
  learning: 'Learning',
  career: 'Career',
  finance: 'Finance',
  social: 'Social',
  mindfulness: 'Mindfulness',
};

type DistrictProgressLike = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPoints: number;
  progressPercent: number;
};

export function DistrictCard({
  name,
  points,
  progress,
}: {
  name: string;
  points: number;
  progress: DistrictProgressLike | null;
}) {
  const p =
    progress ?? {
      level: 1,
      currentXP: 0,
      nextLevelXP: 100,
      totalPoints: points ?? 0,
      progressPercent: 0,
    };

  return (
    <div className="bg-gray-800 rounded-lg p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl">{ICONS[name] ?? '🏰'}</div>
          <div className="font-bold text-lg mt-1">{labels[name] ?? name}</div>
          <div className="text-sm text-gray-300 mt-1">Level {p.level}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-300">POINTS</div>
          <div className="text-xl font-bold">{p.totalPoints}</div>
        </div>
      </div>

      <DistrictProgressBar
        progressPercent={p.progressPercent}
        current={p.currentXP}
        next={p.nextLevelXP}
      />

      <div className="mt-2 text-xs text-gray-400">Progress to next level</div>
    </div>
  );
}

