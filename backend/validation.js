export const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
export function validateRecipe(body) {
  const errors = [];
  const data = {};
  for (const [key, max] of Object.entries({name:120, ingredients:10000, steps:20000})) {
    if (typeof body?.[key] !== 'string' || !body[key].trim() || body[key].trim().length > max)
      errors.push(`${key} must contain 1–${max} characters.`);
    else data[key] = body[key].trim();
  }
  if (!categories.includes(body?.category)) errors.push('Select a valid category.');
  else data.category = body.category;
  if (typeof body?.cookingTime !== 'number' || !Number.isInteger(body.cookingTime) || body.cookingTime < 0 || body.cookingTime > 10080)
    errors.push('Cooking time must be a whole number from 0 to 10080 minutes.');
  else data.cookingTime = body.cookingTime;
  return {errors, data};
}
