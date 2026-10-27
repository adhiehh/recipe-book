import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { Recipe } from './models/Recipe.js';
import { validateRecipe } from './validation.js';

export { Recipe } from './models/Recipe.js';

/**
 * Express application factory for Recipe Book API.
 * Accepts an optional Model parameter for dependency injection during testing.
 */
export function createApp(RecipeModel = Recipe) {
  const app = express();

  // Basic security and parsing middlewares
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));

  // Helper for async route handlers
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    res.status(isReady ? 200 : 503).json({
      database: isReady ? 'connected' : 'disconnected'
    });
  });

  // Validate MongoDB ObjectId parameter
  app.param('id', (req, res, next, id) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID.' });
    }
    next();
  });

  // Middleware to validate recipe body before create / update
  const validateRecipePayload = (req, res, next) => {
    const { errors, data } = validateRecipe(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }
    req.recipePayload = data;
    next();
  };

  // --- API Routes ---

  // 1. Get all recipes (newest first)
  app.get('/api/recipes', asyncHandler(async (req, res) => {
    const items = await RecipeModel.find().sort({ createdAt: -1 });
    res.json(items);
  }));

  // 2. Get single recipe by ID
  app.get('/api/recipes/:id', asyncHandler(async (req, res) => {
    const item = await RecipeModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    res.json(item);
  }));

  // 3. Create a new recipe
  app.post('/api/recipes', validateRecipePayload, asyncHandler(async (req, res) => {
    const createdItem = await RecipeModel.create(req.recipePayload);
    res.status(201).json(createdItem);
  }));

  // 4. Update an existing recipe
  app.put('/api/recipes/:id', validateRecipePayload, asyncHandler(async (req, res) => {
    const updatedItem = await RecipeModel.findByIdAndUpdate(
      req.params.id,
      req.recipePayload,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    res.json(updatedItem);
  }));

  // 5. Delete a recipe
  app.delete('/api/recipes/:id', asyncHandler(async (req, res) => {
    const removedItem = await RecipeModel.findByIdAndDelete(req.params.id);
    if (!removedItem) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    res.json({ message: 'Recipe deleted.' });
  }));

  // 404 handler for unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found.' });
  });

  // Serve static client build if present in production
  const staticDistPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
  if (existsSync(staticDistPath)) {
    app.use(express.static(staticDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticDistPath, 'index.html'));
    });
  }

  // Central error handling middleware
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Malformed JSON payload.' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ message: 'Payload size exceeds limit.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message || 'Validation error.' });
    }
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ message: 'Internal server error. Please try again.' });
  });

  return app;
}
