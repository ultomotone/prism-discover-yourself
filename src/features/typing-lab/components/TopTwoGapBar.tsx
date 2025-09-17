interface TopTwoGapBarProps {
  gap: number;
}

export const TopTwoGapBar = ({ gap }: TopTwoGapBarProps) => {
  const percentage = Math.max(0, Math.min(1, gap));
  const display = Math.round(percentage * 100);
  return (
    <div className="space-y-1" aria-label="Top two gap indicator">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Top-2 gap</span>
        <span>{display}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${display}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
