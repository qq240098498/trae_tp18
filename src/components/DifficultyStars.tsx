import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifficultyStarsProps {
  stars: 1 | 2 | 3 | 4 | 5;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function DifficultyStars({ stars, size = 'md', showLabel = true, label }: DifficultyStarsProps) {
  const starColors = [
    'text-gray-300',
    'text-emerald-400',
    'text-green-400',
    'text-yellow-400',
    'text-orange-400',
    'text-red-400',
  ];

  const bgColors = [
    'bg-gray-100',
    'bg-emerald-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-orange-50',
    'bg-red-50',
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('flex gap-1 p-2 rounded-xl', bgColors[stars])}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i <= stars ? starColors[stars] : 'text-gray-200',
              i <= stars ? 'fill-current' : ''
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn(
          'text-sm font-semibold',
          stars === 1 && 'text-emerald-600',
          stars === 2 && 'text-green-600',
          stars === 3 && 'text-yellow-600',
          stars === 4 && 'text-orange-600',
          stars === 5 && 'text-red-600',
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
