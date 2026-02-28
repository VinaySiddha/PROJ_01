/**
 * @file StatsCard — admin dashboard KPI card with value, label, and trend
 * @module components/admin/StatsCard
 */
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

/** Props for StatsCard */
interface StatsCardProps {
  /** Card title / metric label */
  title: string;
  /** Primary display value */
  value: string | number;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional percentage change from previous period */
  change?: number;
  /** Description of what the change is vs */
  changeLabel?: string;
  /** Accent color for the icon background */
  iconColor?: 'gold' | 'green' | 'blue' | 'red';
}

/** Color map for icon backgrounds */
const iconColorMap: Record<NonNullable<StatsCardProps['iconColor']>, string> = {
  gold: 'bg-accent/20 text-accent',
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  red: 'bg-red-500/20 text-red-400',
};

/**
 * StatsCard — displays a single KPI metric for the admin dashboard.
 * Shows current value, optional trend indicator (up/down/flat), and icon.
 *
 * @param props - StatsCardProps
 * @returns A cinema-themed card displaying a key performance indicator
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs last period',
  iconColor = 'gold',
}: StatsCardProps) {
  const trendIcon =
    change === undefined ? null : change > 0 ? (
      <TrendingUp size={14} className="text-green-400" />
    ) : change < 0 ? (
      <TrendingDown size={14} className="text-red-400" />
    ) : (
      <Minus size={14} className="text-muted-foreground" />
    );

  const trendColor =
    change === undefined
      ? ''
      : change > 0
        ? 'text-green-400'
        : change < 0
          ? 'text-red-400'
          : 'text-muted-foreground';

  return (
    <div className="cinema-card p-5 flex items-start gap-4">
      {/* Icon */}
      <div className={`p-3 rounded-xl ${iconColorMap[iconColor]} flex-shrink-0`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1 truncate">{value}</p>

        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trendIcon}
            <span className={`text-xs ${trendColor}`}>
              {change > 0 ? '+' : ''}
              {change}% {changeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
