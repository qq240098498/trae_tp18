import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDifficultyConfigStore } from '@/store/difficultyConfig';

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
  const config = useDifficultyConfigStore((s) => s.config);
  const levelConfig = config.levels.find((l) => l.stars === stars);

  const starColor = levelConfig?.starColor || 'text-gray-300';
  const bgColor = levelConfig?.bgColor || 'bg-gray-100';
  const textColor = levelConfig?.textColor || 'text-gray-600';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('flex gap-1 p-2 rounded-xl', bgColor)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i <= stars ? starColor : 'text-gray-200',
              i <= stars ? 'fill-current' : ''
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn('text-sm font-semibold', textColor)}>
          {label}
        </span>
      )}
    </div>
  );
}
