import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDifficultyConfigStore } from '@/store/difficultyConfig';
import { DEFAULT_DIFFICULTY_CONFIG } from '@/types/difficultyConfig';
import type { DifficultyConfig, DifficultyLevelConfig } from '@/types/difficultyConfig';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Settings,
  Star,
  Layers,
  Scale,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SectionCard({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function FieldRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <div className="w-32">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
  );
}

function LevelConfigEditor({
  level,
  onChange,
}: {
  level: DifficultyLevelConfig;
  onChange: (updated: DifficultyLevelConfig) => void;
}) {
  const starEmojis = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{starEmojis[level.stars]}</span>
        <span className="font-semibold text-gray-700">
          {level.stars} 星等级
        </span>
      </div>
      <FieldRow label="等级名称" description="显示在星标下方的文字">
        <TextInput
          value={level.label}
          onChange={(v) => onChange({ ...level, label: v })}
          placeholder="等级名称"
        />
      </FieldRow>
      <FieldRow label="星标颜色" description="Tailwind CSS 类名">
        <TextInput
          value={level.starColor}
          onChange={(v) => onChange({ ...level, starColor: v })}
          placeholder="text-xxx-400"
        />
      </FieldRow>
      <FieldRow label="背景颜色" description="Tailwind CSS 类名">
        <TextInput
          value={level.bgColor}
          onChange={(v) => onChange({ ...level, bgColor: v })}
          placeholder="bg-xxx-50"
        />
      </FieldRow>
      <FieldRow label="文字颜色" description="Tailwind CSS 类名">
        <TextInput
          value={level.textColor}
          onChange={(v) => onChange({ ...level, textColor: v })}
          placeholder="text-xxx-600"
        />
      </FieldRow>
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">适合人群描述（简单食材）</div>
        <textarea
          value={level.suitableForSimple}
          onChange={(e) => onChange({ ...level, suitableForSimple: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">适合人群描述（默认）</div>
        <textarea
          value={level.suitableForDefault}
          onChange={(e) => onChange({ ...level, suitableForDefault: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { config, setConfig } = useDifficultyConfigStore();
  const [saved, setSaved] = useState(false);
  const [localConfig, setLocalConfig] = useState<DifficultyConfig>(() => ({
    ...config,
    levels: config.levels.map((l) => ({ ...l })),
  }));

  const handleSave = () => {
    setConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const deep = JSON.parse(JSON.stringify(DEFAULT_DIFFICULTY_CONFIG)) as DifficultyConfig;
    setLocalConfig(deep);
    setConfig(deep);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateLevel = (index: number, updated: DifficultyLevelConfig) => {
    const newLevels = [...localConfig.levels];
    newLevels[index] = updated;
    setLocalConfig({ ...localConfig, levels: newLevels });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-6 h-6 text-orange-500" />
                难度等级配置
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                自定义难度评级参数，所有修改实时生效并自动保存到本地
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              恢复默认
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'px-6 py-2.5 rounded-xl font-semibold text-white transition-all flex items-center gap-2 shadow-lg',
                saved
                  ? 'bg-green-500 shadow-green-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600'
              )}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存配置
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard title="难度等级标签" icon={Star}>
            <p className="text-sm text-gray-500">
              配置每个星级对应的标签名称、颜色和适合人群描述。颜色使用 Tailwind CSS 类名。
            </p>
            <div className="space-y-4">
              {localConfig.levels.map((level, idx) => (
                <LevelConfigEditor
                  key={level.stars}
                  level={level}
                  onChange={(updated) => updateLevel(idx, updated)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="步骤评分规则" icon={Layers}>
            <p className="text-sm text-gray-500">
              根据菜谱步骤数量分配不同基础分数，步骤越多分数越高。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <FieldRow label="简单阈值（≤）" description="步骤数低于此值视为简单">
                <NumberInput
                  value={localConfig.stepScoring.simpleMax}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, simpleMax: v },
                    })
                  }
                  min={1}
                  max={20}
                />
              </FieldRow>
              <FieldRow label="中等阈值（≤）" description="步骤数低于此值视为中等">
                <NumberInput
                  value={localConfig.stepScoring.moderateMax}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, moderateMax: v },
                    })
                  }
                  min={1}
                  max={20}
                />
              </FieldRow>
              <FieldRow label="复杂阈值（≤）" description="步骤数低于此值视为复杂">
                <NumberInput
                  value={localConfig.stepScoring.complexMax}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, complexMax: v },
                    })
                  }
                  min={1}
                  max={20}
                />
              </FieldRow>
              <div className="border-t border-gray-200 pt-3 mt-3" />
              <FieldRow label="简单得分" description="步骤数≤简单阈值时">
                <NumberInput
                  value={localConfig.stepScoring.simpleScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, simpleScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="中等得分" description="步骤数在简单~中等之间">
                <NumberInput
                  value={localConfig.stepScoring.moderateScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, moderateScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="复杂得分" description="步骤数在中等~复杂之间">
                <NumberInput
                  value={localConfig.stepScoring.complexScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, complexScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="超复杂得分" description="步骤数>复杂阈值时">
                <NumberInput
                  value={localConfig.stepScoring.veryComplexScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepScoring: { ...localConfig.stepScoring, veryComplexScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="评分权重" icon={Scale}>
            <p className="text-sm text-gray-500">
              调整各维度在难度评分中的权重，数值越大该维度的影响越强。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <FieldRow label="技巧权重" description="每个检测到的技巧对评分的影响">
                <NumberInput
                  value={localConfig.scoringWeights.techniqueWeight}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, techniqueWeight: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="食材简单得分" description="食材复杂度为简单时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.ingredientSimpleScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, ingredientSimpleScore: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="食材中等得分" description="食材复杂度为中等时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.ingredientModerateScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, ingredientModerateScore: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="食材复杂得分" description="食材复杂度为复杂时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.ingredientComplexScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, ingredientComplexScore: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="工具权重" description="每个检测到的工具对评分的影响">
                <NumberInput
                  value={localConfig.scoringWeights.toolWeight}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, toolWeight: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="步骤简单得分" description="步骤复杂度为简单时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.stepComplexitySimpleScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, stepComplexitySimpleScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="步骤中等得分" description="步骤复杂度为中等时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.stepComplexityModerateScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, stepComplexityModerateScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="步骤复杂得分" description="步骤复杂度为复杂时的加分">
                <NumberInput
                  value={localConfig.scoringWeights.stepComplexityComplexScore}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, stepComplexityComplexScore: v },
                    })
                  }
                  step={0.5}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="烤箱加分" description="检测到烤箱/空气炸锅时额外加分">
                <NumberInput
                  value={localConfig.scoringWeights.ovenBonus}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, ovenBonus: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <FieldRow label="料理机加分" description="检测到料理机时额外加分">
                <NumberInput
                  value={localConfig.scoringWeights.blenderBonus}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, blenderBonus: v },
                    })
                  }
                  step={0.1}
                  min={0}
                />
              </FieldRow>
              <div className="border-t border-gray-200 pt-3 mt-3" />
              <FieldRow label="归一化除数" description="最终评分 = 总分 ÷ 归一化除数，越小越敏感">
                <NumberInput
                  value={localConfig.scoringWeights.normalizationDivisor}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      scoringWeights: { ...localConfig.scoringWeights, normalizationDivisor: v },
                    })
                  }
                  step={1}
                  min={1}
                />
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="步骤复杂度阈值" icon={Sliders} defaultOpen={false}>
            <p className="text-sm text-gray-500">
              根据步骤数和检测到的技巧数量判定步骤复杂度等级。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <FieldRow label="复杂步骤阈值" description="步骤数>此值视为复杂">
                <NumberInput
                  value={localConfig.stepComplexityThresholds.complexStepThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepComplexityThresholds: { ...localConfig.stepComplexityThresholds, complexStepThreshold: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="复杂技巧阈值" description="检测到≥此数量技巧视为复杂">
                <NumberInput
                  value={localConfig.stepComplexityThresholds.complexTechThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepComplexityThresholds: { ...localConfig.stepComplexityThresholds, complexTechThreshold: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="中等步骤阈值" description="步骤数>此值视为中等">
                <NumberInput
                  value={localConfig.stepComplexityThresholds.moderateStepThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepComplexityThresholds: { ...localConfig.stepComplexityThresholds, moderateStepThreshold: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="中等技巧阈值" description="检测到≥此数量技巧视为中等">
                <NumberInput
                  value={localConfig.stepComplexityThresholds.moderateTechThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      stepComplexityThresholds: { ...localConfig.stepComplexityThresholds, moderateTechThreshold: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="食材复杂度阈值" icon={Scale} defaultOpen={false}>
            <p className="text-sm text-gray-500">
              根据复杂食材种类数、独立食材数、食材总数判定食材复杂度等级。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">复杂等级</div>
              <FieldRow label="复杂食材种类≥" description="检测到的复杂食材种类数">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.complexIngredientCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, complexIngredientCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="独立食材数>" description="独立食材种类数">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.complexUniqueIngredientCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, complexUniqueIngredientCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="食材总数>" description="食材总数量">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.complexTotalCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, complexTotalCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <div className="text-sm font-semibold text-gray-600 mb-2 mt-3">中等等级</div>
              <FieldRow label="复杂食材种类≥" description="检测到的复杂食材种类数">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.moderateIngredientCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, moderateIngredientCount: v },
                    })
                  }
                  min={0}
                />
              </FieldRow>
              <FieldRow label="独立食材数>" description="独立食材种类数">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.moderateUniqueIngredientCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, moderateUniqueIngredientCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="食材总数>" description="食材总数量">
                <NumberInput
                  value={localConfig.ingredientComplexityThresholds.moderateTotalCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      ingredientComplexityThresholds: { ...localConfig.ingredientComplexityThresholds, moderateTotalCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="简化版触发阈值" icon={AlertTriangle} defaultOpen={false}>
            <p className="text-sm text-gray-500">
              当菜谱难度达到指定条件时，自动触发简化版生成。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <FieldRow label="星级阈值" description="难度≥此星级直接触发简化">
                <NumberInput
                  value={localConfig.simplificationThresholds.starThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      simplificationThresholds: { ...localConfig.simplificationThresholds, starThreshold: v },
                    })
                  }
                  min={1}
                  max={5}
                />
              </FieldRow>
              <FieldRow label="中等星级阈值" description="此星级下需满足额外条件">
                <NumberInput
                  value={localConfig.simplificationThresholds.moderateStarThreshold}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      simplificationThresholds: { ...localConfig.simplificationThresholds, moderateStarThreshold: v },
                    })
                  }
                  min={1}
                  max={5}
                />
              </FieldRow>
              <FieldRow label="技巧数阈值" description="中等星级下，技巧数≥此值触发">
                <NumberInput
                  value={localConfig.simplificationThresholds.moderateTechCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      simplificationThresholds: { ...localConfig.simplificationThresholds, moderateTechCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
              <FieldRow label="工具数阈值" description="中等星级下，工具数≥此值触发">
                <NumberInput
                  value={localConfig.simplificationThresholds.moderateToolCount}
                  onChange={(v) =>
                    setLocalConfig({
                      ...localConfig,
                      simplificationThresholds: { ...localConfig.simplificationThresholds, moderateToolCount: v },
                    })
                  }
                  min={1}
                />
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="复杂度标签" icon={Sliders} defaultOpen={false}>
            <p className="text-sm text-gray-500">
              配置步骤/食材复杂度显示的标签文字和颜色。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
              {(['simple', 'moderate', 'complex'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    {key === 'simple' ? '简单' : key === 'moderate' ? '中等' : '复杂'}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">标签文字</div>
                      <TextInput
                        value={localConfig.complexityLabels[key].text}
                        onChange={(v) =>
                          setLocalConfig({
                            ...localConfig,
                            complexityLabels: {
                              ...localConfig.complexityLabels,
                              [key]: { ...localConfig.complexityLabels[key], text: v },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">颜色样式</div>
                      <TextInput
                        value={localConfig.complexityLabels[key].color}
                        onChange={(v) =>
                          setLocalConfig({
                            ...localConfig,
                            complexityLabels: {
                              ...localConfig.complexityLabels,
                              [key]: { ...localConfig.complexityLabels[key], color: v },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <footer className="mt-8 text-center text-gray-400 text-xs">
          <p>配置修改后请点击「保存配置」· 点击「恢复默认」可还原所有配置为初始值</p>
        </footer>
      </div>
    </div>
  );
}
