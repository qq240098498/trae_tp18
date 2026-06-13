export interface SpecialTechnique {
  name: string;
  detected: boolean;
}

export interface ToolRequirement {
  name: string;
  icon: string;
  detected: boolean;
}

export interface RecipeAnalysis {
  stepCount: number;
  stepComplexity: 'simple' | 'moderate' | 'complex';
  specialTechniques: SpecialTechnique[];
  ingredientComplexity: 'simple' | 'moderate' | 'complex';
  ingredientCount: number;
  tools: ToolRequirement[];
  difficultyScore: number;
  difficultyStars: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: string;
  suitableFor: string;
}

export type InputMode = 'text' | 'url';

export interface RecipeValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
}

export type AnalysisResult = 
  | { success: true; data: RecipeAnalysis }
  | { success: false; error: string; validation: RecipeValidationResult };
