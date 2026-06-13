import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecipeAnalysis, InputMode, RecipeValidationResult, SimplifiedRecipe } from '@/types/recipe';
import { analyzeRecipe, fetchRecipeFromUrl, SAMPLE_RECIPES, generateSimplifiedRecipe } from '@/lib/recipeAnalyzer';
import { useDifficultyConfigStore } from '@/store/difficultyConfig';
import AnalysisCard from '@/components/AnalysisCard';
import {
  ChefHat,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Lightbulb,
  XCircle,
  HelpCircle,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [analysis, setAnalysis] = useState<RecipeAnalysis | null>(null);
  const [validationError, setValidationError] = useState<{ message: string; validation: RecipeValidationResult } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecipeText, setCurrentRecipeText] = useState('');
  const config = useDifficultyConfigStore((s) => s.config);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setValidationError(null);

    try {
      let content = '';

      if (inputMode === 'url') {
        if (!inputUrl.trim()) {
          setError('请输入菜谱链接');
          setIsLoading(false);
          return;
        }
        const result = await fetchRecipeFromUrl(inputUrl.trim());
        if (!result.success) {
          setError(result.error || '获取链接内容失败');
          setIsLoading(false);
          return;
        }
        content = result.content;
        setInputText(content);
      } else {
        if (!inputText.trim()) {
          setError('请输入菜谱内容');
          setIsLoading(false);
          return;
        }
        content = inputText.trim();
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      const result = analyzeRecipe(content, config);
      
      if (result.success) {
        setAnalysis(result.data);
        setCurrentRecipeText(content);
      } else {
        setValidationError({
          message: (result as { success: false; error: string; validation: RecipeValidationResult }).error,
          validation: (result as { success: false; error: string; validation: RecipeValidationResult }).validation,
        });
      }
    } catch (err) {
      setError('分析失败，请稍后重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = (sampleContent: string) => {
    setInputMode('text');
    setInputText(sampleContent);
    setAnalysis(null);
    setError(null);
    setValidationError(null);
  };

  const handleClear = () => {
    setInputText('');
    setInputUrl('');
    setAnalysis(null);
    setError(null);
    setValidationError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-100 transition-all text-sm font-medium bg-white shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              买菜商城
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              难度配置
            </button>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            菜谱难度评估工具
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            输入任意菜谱链接或粘贴菜谱文字，AI 自动分析操作步骤、特殊技巧、食材复杂度和所需工具，
            为你精准评估难度星级。
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setInputMode('text')}
                  className={cn(
                    'flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2',
                    inputMode === 'text'
                      ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <FileText className="w-5 h-5" />
                  粘贴菜谱文字
                </button>
                <button
                  onClick={() => setInputMode('url')}
                  className={cn(
                    'flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2',
                    inputMode === 'url'
                      ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <LinkIcon className="w-5 h-5" />
                  输入菜谱链接
                </button>
              </div>

              <div className="p-6">
                {inputMode === 'text' ? (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="在此粘贴菜谱内容，包括食材和做法步骤...

示例格式：
【食材】
番茄2个、鸡蛋3个、盐适量

【做法】
1. 番茄切块，鸡蛋打散。
2. 热锅冷油，倒入蛋液炒至凝固盛出。
3. 放入番茄翻炒出汁，加入鸡蛋炒匀即可。"
                    className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://example.com/recipe..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          由于跨域限制，部分网站可能无法直接抓取内容。如果链接抓取失败，
                          请切换到「粘贴菜谱文字」模式，手动复制菜谱内容进行分析。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className={cn(
                      'flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all',
                      'bg-gradient-to-r from-orange-500 to-amber-500',
                      'hover:from-orange-600 hover:to-amber-600',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'flex items-center justify-center gap-2',
                      'shadow-lg shadow-orange-500/30'
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        开始分析
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-800">快速体验</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                点击下方示例，快速体验菜谱难度评估功能
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {SAMPLE_RECIPES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(sample.content)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      'border-gray-100 bg-gray-50 hover:border-orange-300 hover:bg-orange-50',
                      'group'
                    )}
                  >
                    <div className="text-lg mb-1">
                      {idx === 0 ? '⭐' : idx === 1 ? '⭐⭐⭐⭐' : '⭐⭐⭐'}
                    </div>
                    <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                      {sample.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-8">
              {analysis ? (
                <AnalysisCard
                  analysis={analysis}
                  recipeText={currentRecipeText}
                  onGenerateSimplified={(a: RecipeAnalysis): SimplifiedRecipe => {
                    return generateSimplifiedRecipe(currentRecipeText, a);
                  }}
                />
              ) : validationError ? (
                <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8" />
                      <div>
                        <h2 className="text-xl font-bold">无法识别菜谱</h2>
                        <p className="text-red-100 text-sm">请检查输入内容</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-red-700 font-medium">{validationError.message}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">菜谱匹配度</span>
                        <span className={cn(
                          'text-sm font-bold',
                          validationError.validation.confidence < 30 ? 'text-red-600' : 
                          validationError.validation.confidence < 50 ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {validationError.validation.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full transition-all',
                            validationError.validation.confidence < 30 ? 'bg-red-500' : 
                            validationError.validation.confidence < 50 ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${validationError.validation.confidence}%` }}
                        />
                      </div>
                    </div>

                    {validationError.validation.issues.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <HelpCircle className="w-4 h-4" />
                          检测到的问题
                        </div>
                        <ul className="space-y-1.5">
                          {validationError.validation.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-red-500 mt-0.5">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">请确保输入包含：</p>
                          <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                            <li>「食材」「材料」或「用料」等关键词</li>
                            <li>「做法」「步骤」或「制作方法」等说明</li>
                            <li>编号的操作步骤（1. 2. 3. ...）</li>
                            <li>常见烹饪动作（炒、煎、蒸、煮等）</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    等待分析
                  </h3>
                  <p className="text-gray-500">
                    在左侧输入菜谱内容或链接，点击「开始分析」即可获得难度评估报告
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            评估维度说明
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">操作步骤数</h4>
              <p className="text-sm text-gray-500">
                自动识别并统计菜谱中的步骤数量，步骤越多难度越高
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✨</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">特殊技巧</h4>
              <p className="text-sm text-gray-500">
                检测是否需要颠勺、打发、揉面等专业烹饪技巧
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥬</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">食材复杂度</h4>
              <p className="text-sm text-gray-500">
                分析食材种类数量和处理难度，包括是否需要特殊食材
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">所需工具</h4>
              <p className="text-sm text-gray-500">
                识别是否需要烤箱、料理机等特殊厨房设备
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>AI 智能分析 · 仅供参考 · 实际难度可能因个人经验有所不同</p>
        </footer>
      </div>
    </div>
  );
}
