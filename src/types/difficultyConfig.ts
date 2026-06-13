export interface DifficultyLevelConfig {
  stars: 1 | 2 | 3 | 4 | 5;
  label: string;
  starColor: string;
  bgColor: string;
  textColor: string;
  suitableForSimple: string;
  suitableForDefault: string;
}

export interface StepScoringConfig {
  simpleMax: number;
  moderateMax: number;
  complexMax: number;
  simpleScore: number;
  moderateScore: number;
  complexScore: number;
  veryComplexScore: number;
}

export interface StepComplexityThresholdConfig {
  complexStepThreshold: number;
  complexTechThreshold: number;
  moderateStepThreshold: number;
  moderateTechThreshold: number;
}

export interface IngredientComplexityThresholdConfig {
  complexIngredientCount: number;
  complexUniqueIngredientCount: number;
  complexTotalCount: number;
  moderateIngredientCount: number;
  moderateUniqueIngredientCount: number;
  moderateTotalCount: number;
}

export interface ScoringWeightConfig {
  techniqueWeight: number;
  ingredientSimpleScore: number;
  ingredientModerateScore: number;
  ingredientComplexScore: number;
  toolWeight: number;
  stepComplexitySimpleScore: number;
  stepComplexityModerateScore: number;
  stepComplexityComplexScore: number;
  ovenBonus: number;
  blenderBonus: number;
  normalizationDivisor: number;
}

export interface SimplificationThresholdConfig {
  starThreshold: number;
  moderateStarThreshold: number;
  moderateTechCount: number;
  moderateToolCount: number;
}

export interface ComplexityLabelConfig {
  simple: { text: string; color: string };
  moderate: { text: string; color: string };
  complex: { text: string; color: string };
}

export interface DifficultyConfig {
  levels: DifficultyLevelConfig[];
  stepScoring: StepScoringConfig;
  stepComplexityThresholds: StepComplexityThresholdConfig;
  ingredientComplexityThresholds: IngredientComplexityThresholdConfig;
  scoringWeights: ScoringWeightConfig;
  simplificationThresholds: SimplificationThresholdConfig;
  complexityLabels: ComplexityLabelConfig;
}

export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  levels: [
    {
      stars: 1,
      label: '入门级',
      starColor: 'text-emerald-400',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      suitableForSimple: '零基础新手友好，无需烹饪经验，适合厨房小白入门。',
      suitableForDefault: '零基础新手友好，无需烹饪经验，适合厨房小白入门。',
    },
    {
      stars: 2,
      label: '简单',
      starColor: 'text-green-400',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      suitableForSimple: '适合初学者，步骤简单，只需掌握基本烹饪技巧即可完成。',
      suitableForDefault: '适合有过几次下厨经验的新手，食材处理稍有讲究。',
    },
    {
      stars: 3,
      label: '中等难度',
      starColor: 'text-yellow-400',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      suitableForSimple: '适合有半年以上烹饪经验的爱好者，需要按步骤耐心操作。',
      suitableForDefault: '适合有半年以上烹饪经验的爱好者，需要按步骤耐心操作。',
    },
    {
      stars: 4,
      label: '进阶',
      starColor: 'text-orange-400',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      suitableForSimple: '适合有经验的烹饪达人，多步骤操作需精准把控，对火候和时间有一定要求。',
      suitableForDefault: '适合有经验的烹饪达人，多步骤操作需精准把控，对火候和时间有一定要求。',
    },
    {
      stars: 5,
      label: '大师级',
      starColor: 'text-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      suitableForSimple: '专业级挑战！工艺复杂，适合资深厨艺爱好者或专业厨师尝试。',
      suitableForDefault: '专业级挑战！工艺复杂，适合资深厨艺爱好者或专业厨师尝试。',
    },
  ],
  stepScoring: {
    simpleMax: 3,
    moderateMax: 6,
    complexMax: 10,
    simpleScore: 1,
    moderateScore: 2,
    complexScore: 3,
    veryComplexScore: 4,
  },
  stepComplexityThresholds: {
    complexStepThreshold: 10,
    complexTechThreshold: 4,
    moderateStepThreshold: 6,
    moderateTechThreshold: 2,
  },
  ingredientComplexityThresholds: {
    complexIngredientCount: 3,
    complexUniqueIngredientCount: 15,
    complexTotalCount: 12,
    moderateIngredientCount: 1,
    moderateUniqueIngredientCount: 8,
    moderateTotalCount: 7,
  },
  scoringWeights: {
    techniqueWeight: 0.8,
    ingredientSimpleScore: 0.5,
    ingredientModerateScore: 1.5,
    ingredientComplexScore: 2.5,
    toolWeight: 0.4,
    stepComplexitySimpleScore: 0,
    stepComplexityModerateScore: 1,
    stepComplexityComplexScore: 2,
    ovenBonus: 0.5,
    blenderBonus: 0.3,
    normalizationDivisor: 12,
  },
  simplificationThresholds: {
    starThreshold: 4,
    moderateStarThreshold: 3,
    moderateTechCount: 2,
    moderateToolCount: 4,
  },
  complexityLabels: {
    simple: { text: '简单', color: 'text-emerald-600 bg-emerald-50' },
    moderate: { text: '中等', color: 'text-yellow-600 bg-yellow-50' },
    complex: { text: '复杂', color: 'text-red-600 bg-red-50' },
  },
};
