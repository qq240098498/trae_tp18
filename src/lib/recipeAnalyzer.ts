import type { RecipeAnalysis, SpecialTechnique, ToolRequirement, AnalysisResult, RecipeValidationResult, SimplifiedRecipe } from '@/types/recipe';

const SPECIAL_TECHNIQUES: { name: string; keywords: string[] }[] = [
  { name: '颠勺', keywords: ['颠勺', '颠锅', '翻炒均匀', '大火快炒', '抛炒'] },
  { name: '打发', keywords: ['打发', '打至硬性发泡', '打至湿性发泡', '搅拌至发白', '高速打发'] },
  { name: '揉面', keywords: ['揉面', '揉至光滑', '揉出膜', '揉至扩展阶段', '揉至完全阶段'] },
  { name: '发酵', keywords: ['发酵', '醒发', '基础发酵', '二次发酵', '发酵至两倍大'] },
  { name: '焯水', keywords: ['焯水', '汆烫', '汆水', '飞水', '过凉水'] },
  { name: '挂糊', keywords: ['挂糊', '上浆', '裹粉', '拍粉', '拖蛋液'] },
  { name: '勾芡', keywords: ['勾芡', '水淀粉', '淋入水淀粉', '收汁', '浓稠'] },
  { name: '雕花/摆盘', keywords: ['雕花', '摆盘', '造型', '切花刀', '刻花'] },
];

const TOOLS: { name: string; icon: string; keywords: string[] }[] = [
  { name: '烤箱', icon: 'Oven', keywords: ['烤箱', '上下火', '预热', '烘烤', '烤制', '烘焙'] },
  { name: '料理机', icon: 'Blender', keywords: ['料理机', '破壁机', '搅拌机', '打成泥', '搅打', '打碎'] },
  { name: '空气炸锅', icon: 'AirVent', keywords: ['空气炸锅', '气炸', '炸锅'] },
  { name: '蒸锅', icon: 'Pot', keywords: ['蒸锅', '蒸制', '上汽', '隔水蒸', '蒸笼'] },
  { name: '炒锅', icon: 'ChefHat', keywords: ['炒锅', '煎炒', '油炸', '煎至', '炒至'] },
  { name: '打蛋器', icon: 'Whisk', keywords: ['打蛋器', '手动打蛋器', '电动打蛋器'] },
  { name: '量秤', icon: 'Scale', keywords: ['电子秤', '量秤', '称重', '克', '称量'] },
  { name: '温度计', icon: 'Thermometer', keywords: ['温度计', '油温', '水温', '温度达到'] },
];

const COMPLEX_INGREDIENTS = [
  '酵母', '泡打粉', '小苏打', '明胶', '吉利丁', '琼脂',
  '高汤', '自制酱料', '卤水', '香料包', '五香粉',
  '面包糠', '酥皮', '千层皮', '面团',
];

// const SIMPLE_INGREDIENTS = [
//   '盐', '糖', '酱油', '醋', '油', '料酒', '葱', '姜', '蒜',
//   '鸡蛋', '鸡精', '味精', '生抽', '老抽', '蚝油',
// ];

const RECIPE_KEYWORDS = [
  '食材', '材料', '原料', '配料', '用料', '主料', '辅料',
  '做法', '步骤', '制法', '制作方法', '烹饪方法', '操作步骤',
  '准备', '调料', '调味料',
];

const COOKING_VERBS = [
  '炒', '煎', '蒸', '煮', '炸', '烤', '炖', '焖', '煲', '烧',
  '卤', '酱', '腌', '拌', '炝', '烘', '焙', '煸', '汆', '烫',
  '切', '剁', '拍', '砍', '剥', '刮', '洗', '泡', '焯', '汆',
  '翻炒', '煸炒', '炖煮', '烘烤', '油炸', '清蒸', '红烧', '白切',
];

export function validateRecipeContent(text: string): RecipeValidationResult {
  const issues: string[] = [];
  let score = 0;

  const hasIngredientKeyword = RECIPE_KEYWORDS.slice(0, 7).some(kw => text.includes(kw));
  const hasMethodKeyword = RECIPE_KEYWORDS.slice(7).some(kw => text.includes(kw));
  const hasNumberedSteps = /^\s*[\d]+[.、\s]/m.test(text);
  const hasBulletSteps = /^\s*[•·\-●○◆★]/m.test(text);
  const hasCookingVerb = COOKING_VERBS.some(verb => text.includes(verb));
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasIngredientList = /[，,、;；].*[，,、;；]/.test(text);

  if (hasIngredientKeyword) score += 25;
  if (hasMethodKeyword) score += 25;
  if (hasNumberedSteps) score += 20;
  if (hasBulletSteps) score += 10;
  if (hasCookingVerb) score += 15;
  if (hasIngredientList) score += 10;

  const lineCount = text.split('\n').filter(l => l.trim().length > 0).length;
  if (lineCount >= 3) score += 5;
  if (lineCount >= 6) score += 5;

  if (text.trim().length < 20) {
    issues.push('内容太短，请输入完整的菜谱内容');
    score = Math.max(0, score - 50);
  }

  if (!hasChineseChars) {
    issues.push('未检测到中文字符，请输入中文菜谱');
    score = Math.max(0, score - 30);
  }

  if (!hasIngredientKeyword && !hasMethodKeyword) {
    issues.push('未检测到「食材」「做法」「步骤」等菜谱关键词');
  }

  if (!hasNumberedSteps && !hasBulletSteps && !hasMethodKeyword) {
    issues.push('未检测到编号步骤或做法说明');
  }

  if (!hasCookingVerb) {
    issues.push('未检测到常见烹饪动作（如炒、煎、蒸、煮等）');
  }

  const isValid = score >= 30;

  return {
    isValid,
    confidence: Math.min(100, Math.max(0, score)),
    issues,
  };
}

function detectSpecialTechniques(text: string): SpecialTechnique[] {
  return SPECIAL_TECHNIQUES.map(({ name, keywords }) => ({
    name,
    detected: keywords.some(kw => text.includes(kw)),
  }));
}

function detectTools(text: string): ToolRequirement[] {
  return TOOLS.map(({ name, icon, keywords }) => ({
    name,
    icon,
    detected: keywords.some(kw => text.includes(kw)),
  }));
}

function countSteps(text: string): number {
  const numberedSteps = text.match(/^\s*[\d]+[.、\s]/gm) || [];
  const bulletSteps = text.match(/^\s*[•·\-●○◆★]/gm) || [];
  const explicitSteps = text.match(/(步骤|第[一二三四五六七八九十百千]+步|STEP|Step)\s*\d*/g) || [];
  
  const lineBreaks = text.split(/\n\s*\n/).filter(para => para.trim().length > 20).length;
  
  return Math.max(numberedSteps.length, bulletSteps.length, explicitSteps.length, Math.floor(lineBreaks / 2), 1);
}

function estimateIngredientCount(text: string): { count: number; complexity: 'simple' | 'moderate' | 'complex' } {
  const ingredientSection = text.match(/(食材|原料|材料|配料|用料|INGREDIENTS)[\s\S]{0,500}/i);
  const targetText = ingredientSection ? ingredientSection[0] : text;
  
  const commaSeparated = targetText.split(/[，,、;；\n]+/).filter(s => {
    const trimmed = s.trim();
    return trimmed.length > 0 && trimmed.length < 15 && !/^\d/.test(trimmed);
  });
  
  const ingredientLines = targetText.split(/\n+/).filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && trimmed.length < 30 && /[\u4e00-\u9fa5]/.test(trimmed) && !/步骤|做法|方法|贴士|提示/.test(trimmed);
  });
  
  let count = Math.max(commaSeparated.length, ingredientLines.length, 3);
  count = Math.min(count, 30);
  
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  const complexCount = COMPLEX_INGREDIENTS.filter(ing => text.includes(ing)).length;
  const uniqueIngredients = new Set(
    text.split(/[，,、;；\n\s]+/).filter(s => s.length > 1 && /[\u4e00-\u9fa5]/.test(s))
  ).size;
  
  if (complexCount >= 3 || uniqueIngredients > 15 || count > 12) {
    complexity = 'complex';
  } else if (complexCount >= 1 || uniqueIngredients > 8 || count > 7) {
    complexity = 'moderate';
  }
  
  return { count, complexity };
}

function determineStepComplexity(stepCount: number, techniques: SpecialTechnique[]): 'simple' | 'moderate' | 'complex' {
  const detectedTechniques = techniques.filter(t => t.detected).length;
  
  if (stepCount > 10 || detectedTechniques >= 4) return 'complex';
  if (stepCount > 6 || detectedTechniques >= 2) return 'moderate';
  return 'simple';
}

function calculateDifficulty(analysis: Omit<RecipeAnalysis, 'difficultyScore' | 'difficultyStars' | 'difficultyLabel' | 'suitableFor' | 'shouldSimplify' | 'simplifiedRecipe'>): {
  score: number;
  stars: 1 | 2 | 3 | 4 | 5;
  label: string;
} {
  let score = 0;
  
  if (analysis.stepCount <= 3) score += 1;
  else if (analysis.stepCount <= 6) score += 2;
  else if (analysis.stepCount <= 10) score += 3;
  else score += 4;
  
  const techCount = analysis.specialTechniques.filter(t => t.detected).length;
  score += techCount * 0.8;
  
  if (analysis.ingredientComplexity === 'simple') score += 0.5;
  else if (analysis.ingredientComplexity === 'moderate') score += 1.5;
  else score += 2.5;
  
  const toolCount = analysis.tools.filter(t => t.detected).length;
  score += toolCount * 0.4;
  
  if (analysis.stepComplexity === 'simple') score += 0;
  else if (analysis.stepComplexity === 'moderate') score += 1;
  else score += 2;
  
  const hasOven = analysis.tools.find(t => t.name === '烤箱' || t.name === '空气炸锅')?.detected;
  const hasBlender = analysis.tools.find(t => t.name === '料理机')?.detected;
  if (hasOven) score += 0.5;
  if (hasBlender) score += 0.3;
  
  const normalizedScore = Math.min(score / 12, 1);
  const stars = Math.max(1, Math.min(5, Math.ceil(normalizedScore * 5))) as 1 | 2 | 3 | 4 | 5;
  
  const labels: Record<number, string> = {
    1: '入门级',
    2: '简单',
    3: '中等难度',
    4: '进阶',
    5: '大师级',
  };
  
  return {
    score: Math.round(normalizedScore * 100) / 100,
    stars,
    label: labels[stars],
  };
}

function generateSuitableFor(analysis: RecipeAnalysis): string {
  const { difficultyStars, specialTechniques, ingredientComplexity, tools } = analysis;
  const detectedTechs = specialTechniques.filter(t => t.detected).map(t => t.name);
  const detectedTools = tools.filter(t => t.detected).map(t => t.name);
  
  if (difficultyStars === 1) {
    return '零基础新手友好，无需烹饪经验，适合厨房小白入门。';
  }
  
  if (difficultyStars === 2) {
    if (ingredientComplexity === 'simple') {
      return '适合初学者，步骤简单，只需掌握基本烹饪技巧即可完成。';
    }
    return '适合有过几次下厨经验的新手，食材处理稍有讲究。';
  }
  
  if (difficultyStars === 3) {
    const tips: string[] = [];
    if (detectedTechs.length > 0) {
      tips.push(`需掌握${detectedTechs.slice(0, 2).join('、')}等技巧`);
    }
    if (detectedTools.length > 2) {
      tips.push(`需准备${detectedTools.slice(0, 2).join('、')}等工具`);
    }
    if (tips.length > 0) {
      return `适合有半年以上烹饪经验的爱好者，${tips.join('，')}。`;
    }
    return '适合有一定烹饪基础的爱好者，需要按步骤耐心操作。';
  }
  
  if (difficultyStars === 4) {
    return `适合有经验的烹饪达人，${detectedTechs.length > 0 ? `涉及${detectedTechs.slice(0, 3).join('、')}等专业技巧` : '多步骤操作需精准把控'}，对火候和时间有一定要求。`;
  }
  
  return `专业级挑战！${detectedTechs.length > 0 ? `需精通${detectedTechs.slice(0, 3).join('、')}等高阶技能` : '工艺复杂'}，适合资深厨艺爱好者或专业厨师尝试。`;
}

export function analyzeRecipe(input: string): AnalysisResult {
  const text = input.trim();
  
  const validation = validateRecipeContent(text);
  
  if (!validation.isValid) {
    const errorMessage = validation.issues.length > 0 
      ? `无法识别为有效菜谱：${validation.issues[0]}`
      : '无法识别为有效菜谱，请输入完整的菜谱内容（包括食材和做法步骤）';
    
    return {
      success: false,
      error: errorMessage,
      validation,
    };
  }
  
  const specialTechniques = detectSpecialTechniques(text);
  const tools = detectTools(text);
  const stepCount = countSteps(text);
  const { count: ingredientCount, complexity: ingredientComplexity } = estimateIngredientCount(text);
  const stepComplexity = determineStepComplexity(stepCount, specialTechniques);
  
  const baseAnalysis: Omit<RecipeAnalysis, 'difficultyScore' | 'difficultyStars' | 'difficultyLabel' | 'suitableFor' | 'shouldSimplify' | 'simplifiedRecipe'> = {
    stepCount,
    stepComplexity,
    specialTechniques,
    ingredientComplexity,
    ingredientCount,
    tools,
  };
  
  const { score, stars, label } = calculateDifficulty(baseAnalysis);
  
  const shouldSimplify = stars >= 4 || (stars === 3 && (
    specialTechniques.filter(t => t.detected).length >= 2 ||
    tools.filter(t => t.detected).length >= 4
  ));

  const analysis: RecipeAnalysis = {
    ...baseAnalysis,
    difficultyScore: score,
    difficultyStars: stars,
    difficultyLabel: label,
    suitableFor: '',
    shouldSimplify,
    simplifiedRecipe: undefined,
  };
  
  analysis.suitableFor = generateSuitableFor(analysis);
  
  if (shouldSimplify) {
    analysis.simplifiedRecipe = generateSimplifiedRecipe(text, analysis);
  }
  
  return {
    success: true,
    data: analysis,
  };
}

export function extractDomainFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export async function fetchRecipeFromUrl(url: string): Promise<{ success: boolean; content: string; error?: string }> {
  try {
    extractDomainFromUrl(url);
    
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const selectors = [
      'article',
      '.recipe-content',
      '.recipe-body',
      '[class*="recipe"]',
      '[class*="步骤"]',
      '[class*="做法"]',
      '[class*="method"]',
      '[class*="instruction"]',
      'main',
    ];
    
    let content = '';
    
    for (const selector of selectors) {
      const elements = tempDiv.querySelectorAll(selector);
      if (elements.length > 0) {
        const texts: string[] = [];
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          const text = htmlEl.innerText || htmlEl.textContent || '';
          if (text.trim().length > 50) {
            texts.push(text.trim());
          }
        });
        if (texts.length > 0) {
          content = texts.join('\n\n');
          break;
        }
      }
    }
    
    if (!content) {
      content = tempDiv.innerText || tempDiv.textContent || '';
    }
    
    content = content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    if (content.length < 50) {
      return {
        success: false,
        content: '',
        error: '未能从该链接提取到有效的菜谱内容。请尝试复制粘贴菜谱文字。'
      };
    }
    
    return {
      success: true,
      content: content.slice(0, 10000),
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      success: false,
      content: '',
      error: '无法获取该链接内容。由于跨域限制，部分网站可能无法直接抓取，请尝试复制粘贴菜谱文字。'
    };
  }
}

function extractRecipeName(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const firstLine = lines[0] || '';
  const nameMatch = firstLine.match(/^[【[]?(菜名|名称|菜谱)?[】\]]?\s*([^【[]+)/);
  if (nameMatch && nameMatch[2]) {
    return nameMatch[2].trim().slice(0, 20);
  }
  const ingredientSection = text.match(/(食材|原料|材料)[\s\S]{0,200}/);
  if (ingredientSection) {
    const beforeIngredient = text.slice(0, ingredientSection.index || 0).trim();
    const titleLine = beforeIngredient.split('\n').find(l => l.trim().length > 0 && l.trim().length < 20);
    if (titleLine) return titleLine.trim();
  }
  return '家常菜谱';
}

function extractIngredients(text: string): string[] {
  const ingredientSection = text.match(/(食材|原料|材料|配料|用料)[\s\S]{0,800}/i);
  const targetText = ingredientSection ? ingredientSection[0] : text;
  const lines = targetText.split(/[，,、;；\n]+/).map(s => s.trim()).filter(s => {
    return s.length > 0 && s.length < 25 && /[\u4e00-\u9fa5]/.test(s) && 
      !/食材|原料|材料|配料|用料|做法|步骤|方法|贴士|提示|调料|调味料/.test(s);
  });
  return lines.slice(0, 15);
}

function extractSteps(text: string): string[] {
  const methodSection = text.match(/(做法|步骤|制法|制作方法|烹饪方法|操作步骤)[\s\S]{0,3000}/i);
  const targetText = methodSection ? methodSection[0] : text;
  const numberedSteps = targetText.match(/^\s*[\d]+[.、\s].+$/gm) || [];
  if (numberedSteps.length > 0) {
    return numberedSteps.map(s => s.replace(/^\s*[\d]+[.、\s]/, '').trim()).filter(s => s.length > 5);
  }
  const paragraphs = targetText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 15 && p.length < 200);
  return paragraphs.slice(0, 10);
}

const SIMPLIFICATION_STRATEGIES: Record<string, { name: string; description: string }> = {
  riceCooker: { name: '电饭煲版', description: '改用电饭煲一键完成，减少火候控制' },
  onePot: { name: '一锅炖', description: '所有食材一锅煮，减少分步操作' },
  noMarinate: { name: '简化腌制', description: '跳过或简化腌制步骤，直接烹饪' },
  simpleCut: { name: '简化刀工', description: '改为大块切配，减少精细处理' },
  preMade: { name: '现成调料', description: '使用复合调味包代替调配酱汁' },
  noFry: { name: '免油炸', description: '改用煎、煮、蒸等更简单的烹饪方式' },
};

function determineSimplificationStrategies(analysis: RecipeAnalysis): string[] {
  const strategies: string[] = [];
  const detectedTools = analysis.tools.filter(t => t.detected).map(t => t.name);
  const detectedTechs = analysis.specialTechniques.filter(t => t.detected).map(t => t.name);

  if (detectedTools.includes('炒锅') || detectedTechs.includes('颠勺') || analysis.stepCount > 5) {
    strategies.push('riceCooker');
  }
  if (analysis.stepCount > 6) {
    strategies.push('onePot');
  }
  if (detectedTechs.includes('挂糊') || detectedTechs.includes('焯水')) {
    strategies.push('noMarinate');
  }
  if (detectedTechs.includes('雕花/摆盘')) {
    strategies.push('simpleCut');
  }
  if (analysis.ingredientComplexity === 'complex' || analysis.ingredientCount > 10) {
    strategies.push('preMade');
  }
  if (detectedTechs.includes('挂糊') || detectedTools.includes('炒锅')) {
    strategies.push('noFry');
  }

  return strategies.length > 0 ? strategies : ['riceCooker', 'simpleCut'];
}

function generateSimplifiedName(originalName: string, strategies: string[]): string {
  const strategyLabels = strategies.map(s => SIMPLIFICATION_STRATEGIES[s]?.name || '简化版');
  const label = strategyLabels[0] || '简化版';
  if (originalName.includes(label)) return originalName;
  return `${label}${originalName}`;
}

function simplifyIngredients(ingredients: string[], strategies: string[]): string[] {
  const skipKeywords = /(香料|卤水|高汤|吉利丁|明胶|琼脂|面包糠|酥皮|千层皮|酵母|泡打粉)/;
  let simplified = ingredients.filter(ing => !skipKeywords.test(ing));
  
  if (strategies.includes('preMade')) {
    const sauceIngredients = simplified.filter(ing => 
      /(生抽|老抽|蚝油|料酒|香醋|白糖|冰糖|淀粉|鸡精|味精)/.test(ing)
    );
    if (sauceIngredients.length >= 3) {
      simplified = simplified.filter(ing => 
        !/(生抽|老抽|蚝油|料酒|香醋|白糖|冰糖|淀粉|鸡精|味精)/.test(ing)
      );
      simplified.push('现成调味包1袋');
    }
  }
  
  if (simplified.length > 8) {
    const coreKeywords = /(肉|鸡|鱼|蛋|虾|牛|猪|羊|豆|菜|菇|面|米|饭|葱|姜|蒜|盐|油|酱油)/;
    const core = simplified.filter(ing => coreKeywords.test(ing));
    const others = simplified.filter(ing => !coreKeywords.test(ing));
    simplified = [...core, ...others].slice(0, 8);
  }
  
  return simplified.length > 0 ? simplified : ingredients.slice(0, 6);
}

function simplifySteps(steps: string[], strategies: string[], removedTechs: string[]): string[] {
  let simplified = [...steps];
  
  const skipStepPatterns: RegExp[] = [];
  if (removedTechs.includes('焯水')) {
    skipStepPatterns.push(/焯水|汆烫|汆水|飞水|过凉水/);
  }
  if (removedTechs.includes('挂糊')) {
    skipStepPatterns.push(/挂糊|上浆|裹粉|拍粉|拖蛋液/);
  }
  if (strategies.includes('noMarinate')) {
    skipStepPatterns.push(/腌制|腌渍|静置|放.*分钟|冷藏/);
  }
  if (strategies.includes('simpleCut')) {
    skipStepPatterns.push(/切花刀|雕花|摆盘|造型/);
  }
  
  if (skipStepPatterns.length > 0) {
    simplified = simplified.filter(step => 
      !skipStepPatterns.some(pattern => pattern.test(step))
    );
  }
  
  if (strategies.includes('riceCooker') && simplified.length > 0) {
    simplified = [
      '将所有食材洗净切大块备用',
      `将食材全部放入电饭煲内胆，加入适量清水和调味料`,
      '按下电饭煲煮饭键或煲汤键，等待自动完成',
      '开盖拌匀，盛入碗中即可享用'
    ];
  } else if (strategies.includes('onePot') && simplified.length > 3) {
    simplified = [
      '所有食材洗净处理好备用',
      '锅中加少许油，放入主料翻炒至变色',
      '加入其余食材和适量清水，大火煮开',
      '转小火炖煮15-20分钟，开盖调味即可'
    ];
  } else if (simplified.length > 5) {
    const merged: string[] = [];
    for (let i = 0; i < simplified.length; i += 2) {
      if (i + 1 < simplified.length) {
        merged.push(`${simplified[i].replace(/。$/, '')}，同时${simplified[i + 1]}`);
      } else {
        merged.push(simplified[i]);
      }
    }
    simplified = merged;
  }
  
  return simplified.slice(0, 6);
}

function generateFlavorPreservation(originalName: string, strategies: string[]): string {
  const reasons: string[] = [];
  if (strategies.includes('riceCooker')) {
    reasons.push('电饭煲焖煮保留食材原汁');
  }
  if (strategies.includes('onePot')) {
    reasons.push('一锅炖煮让味道充分融合');
  }
  if (strategies.includes('noFry')) {
    reasons.push('改用健康烹饪方式，保留核心风味');
  }
  if (strategies.includes('preMade')) {
    reasons.push('使用秘制调味包，还原餐厅味道');
  }
  if (reasons.length === 0) {
    reasons.push('保留主要调味比例，风味接近原版');
  }
  return `${originalName}的简化版本，${reasons.join('，')}，在家轻松复刻经典味道。`;
}

export function generateSimplifiedRecipe(
  originalText: string,
  analysis: RecipeAnalysis
): SimplifiedRecipe {
  const originalName = extractRecipeName(originalText);
  const ingredients = extractIngredients(originalText);
  const steps = extractSteps(originalText);
  const strategies = determineSimplificationStrategies(analysis);
  const removedTools = analysis.tools.filter(t => t.detected).map(t => t.name).slice(0, 3);
  const removedTechniques = analysis.specialTechniques.filter(t => t.detected).map(t => t.name);
  
  const simplifiedIngredients = simplifyIngredients(ingredients, strategies);
  const simplifiedSteps = simplifySteps(steps, strategies, removedTechniques);
  
  const simplificationDescs = strategies.map(s => {
    const strategy = SIMPLIFICATION_STRATEGIES[s];
    return strategy ? `采用「${strategy.name}」策略：${strategy.description}` : '简化操作';
  });
  
  if (removedTools.length > 0) {
    simplificationDescs.push(`无需使用${removedTools.join('、')}等工具，普通厨具即可完成`);
  }
  if (removedTechniques.length > 0) {
    simplificationDescs.push(`跳过${removedTechniques.slice(0, 3).join('、')}等专业技巧`);
  }
  
  return {
    id: `simplified-${Date.now()}`,
    originalName,
    simplifiedName: generateSimplifiedName(originalName, strategies),
    simplifiedIngredients,
    simplifiedSteps,
    simplifications: simplificationDescs,
    removedTools,
    removedTechniques,
    flavorPreservation: generateFlavorPreservation(originalName, strategies),
    generatedAt: Date.now(),
  };
}

const RATING_STORAGE_KEY = 'simplified_recipe_ratings';

export function saveSimplificationRating(recipeId: string, rating: number, comment?: string): void {
  try {
    const existing = localStorage.getItem(RATING_STORAGE_KEY);
    const ratings = existing ? JSON.parse(existing) : [];
    ratings.push({
      recipeId,
      rating,
      comment,
      createdAt: Date.now(),
    });
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.error('Failed to save rating:', e);
  }
}

export function getSimplificationRatings(): { recipeId: string; rating: number; comment?: string; createdAt: number }[] {
  try {
    const existing = localStorage.getItem(RATING_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

export const SAMPLE_RECIPES = [
  {
    name: '番茄炒蛋（简单）',
    content: `【食材】
番茄2个、鸡蛋3个、盐适量、糖少许、葱花适量

【做法】
1. 番茄切块，鸡蛋打散加少许盐。
2. 热锅冷油，倒入蛋液，炒至凝固盛出。
3. 锅中再加少许油，放入番茄块翻炒出汁。
4. 加盐和少许糖调味，倒入炒好的鸡蛋翻炒均匀。
5. 撒上葱花即可出锅。`,
  },
  {
    name: '戚风蛋糕（进阶）',
    content: `【材料】
鸡蛋5个、低筋面粉85g、细砂糖60g（蛋白用）、细砂糖30g（蛋黄用）、牛奶50g、玉米油50g、柠檬汁几滴

【步骤】
1. 分离蛋清和蛋黄，蛋清放入无油无水的盆中冷藏备用。
2. 蛋黄加入30g细砂糖搅拌均匀，加入玉米油和牛奶，充分乳化。
3. 筛入低筋面粉，用刮刀翻拌均匀至无颗粒。
4. 蛋白从冰箱取出，滴入柠檬汁，分三次加入60g细砂糖，用电动打蛋器打至硬性发泡（提起打蛋头有小尖角）。
5. 取三分之一蛋白霜放入蛋黄糊，翻拌均匀后倒回剩余蛋白霜中，继续翻拌均匀。
6. 烤箱预热至150度上下火。
7. 将蛋糕糊倒入6寸模具，震出大气泡，放入烤箱中下层，烘烤50-55分钟。
8. 出炉后立即倒扣晾凉，完全冷却后脱模即可。`,
  },
  {
    name: '宫保鸡丁（中等）',
    content: `【食材】
鸡胸肉300g、花生米50g、干辣椒10个、花椒1勺、大葱1根、蒜3瓣、姜1小块
生抽2勺、老抽半勺、香醋1勺、白糖1勺、淀粉1勺、盐适量、料酒1勺

【做法】
1. 鸡胸肉切丁，加料酒、生抽1勺、淀粉、少许盐抓匀腌制15分钟。
2. 调碗汁：生抽1勺、老抽半勺、香醋、白糖、淀粉、少许清水搅匀备用。
3. 干辣椒切段去籽，大葱切段，姜蒜切片。
4. 花生米提前炸熟或烤箱烤熟备用。
5. 热锅冷油，油比平时炒菜多一些，放入鸡丁滑炒至变色盛出。
6. 锅中留底油，放入花椒、干辣椒段小火煸出香味，加入姜蒜片炒香。
7. 倒入滑好的鸡丁翻炒均匀，淋入调好的碗汁，大火翻炒收汁。
8. 最后加入葱段和花生米，颠勺翻炒均匀即可出锅。`,
  },
];
