export interface SpecialTechnique {
  name: string;
  detected: boolean;
}

export interface ToolRequirement {
  name: string;
  icon: string;
  detected: boolean;
}

export interface SimplifiedRecipe {
  id: string;
  originalName: string;
  simplifiedName: string;
  simplifiedIngredients: string[];
  simplifiedSteps: string[];
  simplifications: string[];
  removedTools: string[];
  removedTechniques: string[];
  flavorPreservation: string;
  generatedAt: number;
}

export interface SimplificationRating {
  recipeId: string;
  rating: number;
  comment?: string;
  createdAt: number;
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
  shouldSimplify: boolean;
  simplifiedRecipe?: SimplifiedRecipe;
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
