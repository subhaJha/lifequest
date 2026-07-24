

export function DistrictProgressBar({ progressPercent, current, next }: { progressPercent: number; current: number; next: number }) {
  const width = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-300">
        <span>{current}</span>
        <span>{next}</span>
      </div>
      <div className="mt-2 bg-gray-700 rounded-full h-2">
        <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

