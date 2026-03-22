import type { Recipe, RecipeLine, SupplierPriceEntry } from '@/lib/domain/types';

export type RecipeCostLineStatus = 'costed' | 'missing_price' | 'missing_package' | 'unit_mismatch';

export interface RecipeCostLineEstimate {
  line: RecipeLine;
  status: RecipeCostLineStatus;
  estimatedCost?: number;
  unitRate?: number;
  latestPriceEntry?: SupplierPriceEntry;
}

export interface RecipeCostEstimate {
  recipeId: string;
  totalEstimatedCost: number;
  lineCount: number;
  costedLineCount: number;
  incompleteLineCount: number;
  complete: boolean;
  lines: RecipeCostLineEstimate[];
}

type UnitDefinition = {
  family: 'mass' | 'volume' | 'count';
  factor: number;
};

const unitMap: Record<string, UnitDefinition> = {
  g: { family: 'mass', factor: 1 },
  gram: { family: 'mass', factor: 1 },
  grams: { family: 'mass', factor: 1 },
  kg: { family: 'mass', factor: 1000 },
  kilogram: { family: 'mass', factor: 1000 },
  kilograms: { family: 'mass', factor: 1000 },
  ml: { family: 'volume', factor: 1 },
  milliliter: { family: 'volume', factor: 1 },
  milliliters: { family: 'volume', factor: 1 },
  litre: { family: 'volume', factor: 1000 },
  litres: { family: 'volume', factor: 1000 },
  liter: { family: 'volume', factor: 1000 },
  liters: { family: 'volume', factor: 1000 },
  l: { family: 'volume', factor: 1000 },
  unit: { family: 'count', factor: 1 },
  units: { family: 'count', factor: 1 },
  piece: { family: 'count', factor: 1 },
  pieces: { family: 'count', factor: 1 },
  egg: { family: 'count', factor: 1 },
  eggs: { family: 'count', factor: 1 },
  dozen: { family: 'count', factor: 12 },
};

function normalizeUnit(unit?: string) {
  return unit?.trim().toLowerCase();
}

function toBaseQuantity(quantity: number, unit?: string) {
  const normalizedUnit = normalizeUnit(unit);
  if (!normalizedUnit) {
    return null;
  }

  const definition = unitMap[normalizedUnit];
  if (!definition || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return {
    family: definition.family,
    quantity: quantity * definition.factor,
  };
}

function estimateRecipeLineCost(
  line: RecipeLine,
  latestPriceEntry?: SupplierPriceEntry,
): RecipeCostLineEstimate {
  if (!latestPriceEntry) {
    return {
      line,
      status: 'missing_price',
    };
  }

  if (!latestPriceEntry.packageQuantity || !latestPriceEntry.packageUnit) {
    return {
      line,
      status: 'missing_package',
      latestPriceEntry,
    };
  }

  const lineBaseQuantity = toBaseQuantity(line.quantity, line.unit);
  const packageBaseQuantity = toBaseQuantity(latestPriceEntry.packageQuantity, latestPriceEntry.packageUnit);

  if (!lineBaseQuantity || !packageBaseQuantity || lineBaseQuantity.family !== packageBaseQuantity.family) {
    return {
      line,
      status: 'unit_mismatch',
      latestPriceEntry,
    };
  }

  const unitRate = latestPriceEntry.price / packageBaseQuantity.quantity;
  return {
    line,
    status: 'costed',
    estimatedCost: unitRate * lineBaseQuantity.quantity,
    unitRate,
    latestPriceEntry,
  };
}

export function calculateRecipeEstimatedMaterialCost(
  recipe: Recipe,
  latestPriceByMaterial: Map<string, SupplierPriceEntry>,
): RecipeCostEstimate {
  const lines = recipe.lines.map((line) => estimateRecipeLineCost(line, latestPriceByMaterial.get(line.rawMaterialId)));
  const costedLines = lines.filter((line) => line.status === 'costed');
  const incompleteLineCount = lines.length - costedLines.length;

  return {
    recipeId: recipe.id,
    totalEstimatedCost: costedLines.reduce((total, line) => total + (line.estimatedCost ?? 0), 0),
    lineCount: lines.length,
    costedLineCount: costedLines.length,
    incompleteLineCount,
    complete: lines.length > 0 && incompleteLineCount === 0,
    lines,
  };
}
