export const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

/**
 * Validates recipe payload before creation or update.
 * @param {Record<string, unknown>} payload
 * @returns {{ errors: string[], data: Record<string, unknown> }}
 */
export function validateRecipe(payload) {
  const validationErrors = [];
  const sanitizedData = {};

  const textLimits = {
    name: 120,
    ingredients: 10000,
    steps: 20000
  };

  for (const [field, maxLen] of Object.entries(textLimits)) {
    const rawVal = payload?.[field];
    if (typeof rawVal !== 'string' || rawVal.trim().length === 0) {
      validationErrors.push(`${field} must contain at least 1 character.`);
    } else if (rawVal.trim().length > maxLen) {
      validationErrors.push(`${field} cannot exceed ${maxLen} characters.`);
    } else {
      sanitizedData[field] = rawVal.trim();
    }
  }

  const selectedCategory = payload?.category;
  if (!categories.includes(selectedCategory)) {
    validationErrors.push('Please select a valid recipe category.');
  } else {
    sanitizedData.category = selectedCategory;
  }

  const timeVal = payload?.cookingTime;
  if (
    typeof timeVal !== 'number' ||
    !Number.isInteger(timeVal) ||
    timeVal < 0 ||
    timeVal > 10080
  ) {
    validationErrors.push('Cooking time must be a positive whole number up to 10080 minutes.');
  } else {
    sanitizedData.cookingTime = timeVal;
  }

  return {
    errors: validationErrors,
    data: sanitizedData
  };
}
