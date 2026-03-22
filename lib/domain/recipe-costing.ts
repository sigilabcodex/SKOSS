import type { Product, Recipe, RecipeLine, SupplierPriceEntry } from '@/lib/domain/types';

export type RecipeCostLineStatus = 'costed' | 'missing_price' | 'missing_package' | 'unit_mismatch';
export type CostingSnapshotStatus = 'fully_costed' | 'partially_costed' | 'missing_cost_evidence' | 'no_recipe';

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

export interface CostingSnapshotItem {
  id: string;
  type: 'recipe' | 'product';
  label: string;
  productLabel: string;
  recipeId?: string;
  recipeTitle?: string;
  batchYieldQuantity?: number;
  batchYieldUnit?: string;
  status: CostingSnapshotStatus;
  estimatedBatchCost?: number;
  estimatedUnitCost?: number;
  lineCount: number;
  costedLineCount: number;
  incompleteLineCount: number;
  missingEvidenceCount: number;
  missingPackageCount: number;
  unitMismatchCount: number;
  hasRecipe: boolean;
  recipeCost?: RecipeCostEstimate;
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

function getProductLabel(product: Pick<Product, 'name'>, variant?: { name: string } | null) {
  return variant ? `${product.name} / ${variant.name}` : product.name;
}

export function getCostingSnapshotStatus(recipeCost?: RecipeCostEstimate | null): CostingSnapshotStatus {
  if (!recipeCost) {
    return 'no_recipe';
  }

  if (recipeCost.complete) {
    return 'fully_costed';
  }

  if (recipeCost.costedLineCount > 0) {
    return 'partially_costed';
  }

  return 'missing_cost_evidence';
}

export function buildCostingSnapshotItems(
  products: Product[],
  recipes: Recipe[],
  recipeCostById: Map<string, RecipeCostEstimate>,
): CostingSnapshotItem[] {
  const items: CostingSnapshotItem[] = [];
  const coveredTargets = new Set<string>();

  for (const recipe of recipes) {
    const product = products.find((entry) => entry.id === recipe.productId);
    const variant = recipe.productVariantId
      ? product?.variants.find((entry) => entry.id === recipe.productVariantId) ?? null
      : null;
    const productLabel = product ? getProductLabel(product, variant) : recipe.title;
    const targetKey = recipe.productVariantId ?? recipe.productId;
    const recipeCost = recipeCostById.get(recipe.id);
    const status = getCostingSnapshotStatus(recipeCost);

    coveredTargets.add(targetKey);

    items.push({
      id: `recipe:${recipe.id}`,
      type: 'recipe',
      label: recipe.title,
      productLabel,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      batchYieldQuantity: recipe.batchYieldQuantity,
      batchYieldUnit: recipe.batchYieldUnit,
      status,
      estimatedBatchCost: recipeCost?.lineCount ? recipeCost.totalEstimatedCost : undefined,
      estimatedUnitCost:
        recipeCost?.lineCount && recipe.batchYieldQuantity && recipe.batchYieldQuantity > 0
          ? recipeCost.totalEstimatedCost / recipe.batchYieldQuantity
          : undefined,
      lineCount: recipeCost?.lineCount ?? recipe.lines.length,
      costedLineCount: recipeCost?.costedLineCount ?? 0,
      incompleteLineCount: recipeCost?.incompleteLineCount ?? recipe.lines.length,
      missingEvidenceCount: recipeCost?.lines.filter((line) => line.status === 'missing_price').length ?? 0,
      missingPackageCount: recipeCost?.lines.filter((line) => line.status === 'missing_package').length ?? 0,
      unitMismatchCount: recipeCost?.lines.filter((line) => line.status === 'unit_mismatch').length ?? 0,
      hasRecipe: true,
      recipeCost,
    });
  }

  for (const product of products) {
    if (product.variants.length > 0) {
      for (const variant of product.variants) {
        if (coveredTargets.has(variant.id)) {
          continue;
        }

        items.push({
          id: `product:${variant.id}`,
          type: 'product',
          label: getProductLabel(product, variant),
          productLabel: getProductLabel(product, variant),
          status: 'no_recipe',
          lineCount: 0,
          costedLineCount: 0,
          incompleteLineCount: 0,
          missingEvidenceCount: 0,
          missingPackageCount: 0,
          unitMismatchCount: 0,
          hasRecipe: false,
        });
      }

      if (!coveredTargets.has(product.id)) {
        items.push({
          id: `product:${product.id}`,
          type: 'product',
          label: product.name,
          productLabel: product.name,
          status: 'no_recipe',
          lineCount: 0,
          costedLineCount: 0,
          incompleteLineCount: 0,
          missingEvidenceCount: 0,
          missingPackageCount: 0,
          unitMismatchCount: 0,
          hasRecipe: false,
        });
      }

      continue;
    }

    if (coveredTargets.has(product.id)) {
      continue;
    }

    items.push({
      id: `product:${product.id}`,
      type: 'product',
      label: product.name,
      productLabel: product.name,
      status: 'no_recipe',
      lineCount: 0,
      costedLineCount: 0,
      incompleteLineCount: 0,
      missingEvidenceCount: 0,
      missingPackageCount: 0,
      unitMismatchCount: 0,
      hasRecipe: false,
    });
  }

  return items.sort((left, right) => left.productLabel.localeCompare(right.productLabel));
}
