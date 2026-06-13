import { useState } from 'react';
import type { RecipeAnalysis, SimplifiedRecipe } from '@/types/recipe';
import { saveSimplificationRating } from '@/lib/recipeAnalyzer';
import DifficultyStars from './DifficultyStars';
import {
  ChefHat,
  Layers,
  Sparkles,
  Carrot,
  Wrench,
  Users,
  TrendingUp,
  Wand2,
  Star,
  MessageSquare,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  analysis: RecipeAnalysis;
  onGenerateSimplified?: (analysis: RecipeAnalysis) => SimplifiedRecipe;
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

function RatingStars({
  value,
  onChange,
  size = 'md',
  interactive = true,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={cn(
            'transition-all',
            interactive && 'cursor-pointer hover:scale-110',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClass,
              'transition-colors',
              (hover || value) >= n
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function SimplifiedRecipeSection({
  simplified,
  onBack,
}: {
  simplified: SimplifiedRecipe;
  onBack: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [showIngredients, setShowIngredients] = useState(true);

  const handleSubmitRating = () => {
    if (rating === 0) return;
    saveSimplificationRating(simplified.id, rating, comment.trim() || undefined);
    setSubmitted(true);
  };

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
      >
        <ChevronUp className="w-4 h-4 rotate-90" />
        返回评估报告
      </button>

      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="w-5 h-5" />
              <span className="text-sm font-medium text-teal-100">AI 简化版生成</span>
            </div>
            <h3 className="text-xl font-bold">{simplified.simplifiedName}</h3>
            <p className="text-sm text-teal-100 mt-1">
              原菜谱：{simplified.originalName}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
            <div className="text-2xl font-bold">
              {simplified.simplifiedSteps.length}
            </div>
            <div className="text-xs text-teal-100">简化步骤</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            {simplified.flavorPreservation}
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowIngredients(!showIngredients)}
          className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Carrot className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">
              简化食材 ({simplified.simplifiedIngredients.length} 种)
            </span>
          </div>
          {showIngredients ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {showIngredients && (
          <div className="mt-3 grid grid-cols-2 gap-2 pl-2">
            {simplified.simplifiedIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {ing}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">
              简化做法 ({simplified.simplifiedSteps.length} 步)
            </span>
          </div>
          {showSteps ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {showSteps && (
          <div className="mt-3 space-y-3 pl-2">
            {simplified.simplifiedSteps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                <p className="text-sm text-gray-700 pt-1 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Minus className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-800">简化说明</span>
        </div>
        <div className="space-y-2 pl-2">
          {simplified.simplifications.map((s, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm text-gray-600 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100"
            >
              <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
        {!submitted ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">简化版满意度评价</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              您的反馈将帮助 AI 优化简化策略，生成更贴心的菜谱
            </p>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-700 mb-2">
                  整体满意度 <span className="text-red-500">*</span>
                </div>
                <RatingStars value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <div className="mt-2 text-sm text-indigo-600 font-medium">
                    {rating === 1 && '很不满意'}
                    {rating === 2 && '不太满意'}
                    {rating === 3 && '一般般'}
                    {rating === 4 && '比较满意'}
                    {rating === 5 && '非常满意'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  补充意见（可选）
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="比如：希望减少某食材、步骤可以更简单...
"
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-white transition-all',
                  rating > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                提交评价
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-1">感谢您的反馈！</h4>
            <p className="text-sm text-gray-600">
              您的 {rating} 星评价已记录，AI 将根据您的意见持续优化简化策略
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisCard({
  analysis,
  onGenerateSimplified,
}: AnalysisCardProps) {
  const detectedTechniques = analysis.specialTechniques.filter((t) => t.detected);
  const detectedTools = analysis.tools.filter((t) => t.detected);
  const [showSimplified, setShowSimplified] = useState(!!analysis.simplifiedRecipe);
  const [simplified, setSimplified] = useState<SimplifiedRecipe | null>(analysis.simplifiedRecipe || null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSimplified = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (onGenerateSimplified) {
      const result = onGenerateSimplified(analysis);
      setSimplified(result);
      setShowSimplified(true);
    }
    setIsGenerating(false);
  };

  const handleBackToAnalysis = () => {
    setShowSimplified(false);
  };

  if (showSimplified && simplified) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <SimplifiedRecipeSection
            simplified={simplified}
            onBack={handleBackToAnalysis}
          />
        </div>
      </div>
    );
  }

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
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                complexityLabels[analysis.stepComplexity].color
              )}
            >
              {complexityLabels[analysis.stepComplexity].text}
            </span>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Carrot className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">食材数量</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {analysis.ingredientCount} 种
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">食材复杂度</span>
            </div>
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                complexityLabels[analysis.ingredientComplexity].color
              )}
            >
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

        {analysis.shouldSimplify && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-5 border-2 border-dashed border-rose-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1">菜谱难度偏高，试试简化版？</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  AI 检测到该菜谱步骤较多或需要专业技巧，可自动生成一个保留核心风味的简化版本，
                  比如「红烧肉 → 电饭煲版红烧肉」
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-rose-600">↓{Math.max(2, analysis.stepCount - 4)}</div>
                <div className="text-xs text-gray-500">步骤减少</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-rose-600">
                  ⚡{detectedTools.length > 0 ? '免工具' : '简化'}
                </div>
                <div className="text-xs text-gray-500">工具要求</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-rose-600">🍖</div>
                <div className="text-xs text-gray-500">保留风味</div>
              </div>
            </div>
            <button
              onClick={handleGenerateSimplified}
              disabled={isGenerating}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-white transition-all',
                'bg-gradient-to-r from-rose-500 to-pink-500',
                'hover:from-rose-600 hover:to-pink-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2',
                'shadow-lg shadow-rose-500/30'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI 正在生成简化版...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  一键生成简化版
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
