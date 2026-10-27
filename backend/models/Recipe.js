import mongoose from 'mongoose';

export const RECIPE_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      maxlength: [120, 'Recipe name cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: RECIPE_CATEGORIES,
        message: 'Invalid recipe category'
      }
    },
    ingredients: {
      type: String,
      required: [true, 'Ingredients are required'],
      trim: true,
      maxlength: [10000, 'Ingredients list cannot exceed 10000 characters']
    },
    steps: {
      type: String,
      required: [true, 'Preparation steps are required'],
      trim: true,
      maxlength: [20000, 'Preparation steps cannot exceed 20000 characters']
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time is required'],
      min: [0, 'Cooking time must be at least 0 minutes'],
      max: [10080, 'Cooking time cannot exceed 10080 minutes'],
      validate: {
        validator: Number.isInteger,
        message: 'Cooking time must be an integer'
      }
    }
  },
  {
    timestamps: true
  }
);

export const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
