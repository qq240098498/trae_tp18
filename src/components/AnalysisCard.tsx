import type { RecipeAnalysis } from '@/types/recipe';
import DifficultyStars from './DifficultyStars';
import {
  ChefHat,
  Layers,
  Sparkles,
  Carrot,
  Wrench,
  Users,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  analysis: RecipeAnalysis;
}

const complexityLabels = {
  simple: { text: '简单', color: 'text-emerald-600 bg-emerald-50' },
  moderate: { text: '中等', color: 'text-yellow-600 bg-yellow-50' },
  complex: { text: '复杂', color: 'text-red-600 bg-red-50' },
};

const iconMap: Record<string, React.ElementType> = {
  Oven: () => <span className="text-lg">🔥</span>,
  Blender: () => <span className="text-lg">🌀</span>,
  AirVent: () => <span className="text-lg">💨</span>,
  Pot: () => <span className="text-lg">🍲</span>,
  ChefHat: () => <span className="text-lg">👨‍🍳</span>,
  Whisk: () => <span className="text-lg">🥄</span>,
  Scale: () => <span className="text-lg">⚖️</span>,
  Thermometer: () => <span className="text-lg">🌡️</span>,
};

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  const detectedTechniques = analysis.specialTechniques.filter(t => t.detected);
  const detectedTools = analysis.tools.filter(t => t.detected);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">菜谱难度评估报告</h2>
            <p className="text-orange-100 text-sm">AI 智能分析 · 全方位评估</p>
          </div>
          <DifficultyStars
            stars={analysis.difficultyStars}
            size="lg"
            showLabel={false}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <DifficultyStars
              stars={analysis.difficultyStars}
              size="lg"
              label={analysis.difficultyLabel}
            />
            <div className="mt-2 text-sm text-gray-500">
              难度评分: {(analysis.difficultyScore * 100).toFixed(0)} 分
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">操作步骤</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{analysis.stepCount} 步</div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">步骤复杂度</span>
            </div>
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-sm font-semibold',
              complexityLabels[analysis.stepComplexity].color
            )}>
              {complexityLabels[analysis.stepComplexity].text}
            </span>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Carrot className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">食材数量</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{analysis.ingredientCount} 种</div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">食材复杂度</span>
            </div>
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-sm font-semibold',
              complexityLabels[analysis.ingredientComplexity].color
            )}>
              {complexityLabels[analysis.ingredientComplexity].text}
            </span>
          </div>
        </div>

        {detectedTechniques.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span className="font-semibold text-gray-800">需要特殊技巧</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedTechniques.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200"
                >
                  ✨ {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {detectedTools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-gray-800">需要工具</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedTools.map((tool, idx) => {
                const IconComponent = iconMap[tool.icon];
                return (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 flex items-center gap-1.5"
                  >
                    {IconComponent && <IconComponent />}
                    {tool.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-gray-800">适合人群</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.suitableFor}</p>
        </div>
      </div>
    </div>
  );
}
