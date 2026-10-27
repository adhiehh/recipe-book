import React from 'react';

const CATEGORY_ICONS = {
  Breakfast: '☀️',
  Lunch: '🥪',
  Dinner: '🍲',
  Snack: '🍿',
  Dessert: '🍰'
};

export default function RecipeCard({ recipe, onViewDetails, onEdit, onDelete, isBusy }) {
  const categoryIcon = CATEGORY_ICONS[recipe.category] || '🍽️';

  return (
    <article className={`recipe-card-box category-${recipe.category.toLowerCase()}`}>
      <button
        type="button"
        className="card-clickable-area"
        onClick={() => onViewDetails(recipe)}
        disabled={isBusy}
        aria-label={`View full details of ${recipe.name}`}
      >
        <div className="card-media-banner">
          <span className="card-media-icon">{categoryIcon}</span>
          <span className="card-badge-category">{recipe.category}</span>
        </div>

        <div className="card-info-content">
          <h3 className="recipe-title">{recipe.name}</h3>
          <div className="recipe-meta-row">
            <span className="meta-time">⏱️ {recipe.cookingTime} mins</span>
            <span className="meta-click-hint">View details ➔</span>
          </div>
        </div>
      </button>

      <div className="card-footer-controls">
        <button
          type="button"
          className="btn-card-edit"
          onClick={() => onEdit(recipe)}
          disabled={isBusy}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className="btn-card-delete"
          onClick={() => onDelete(recipe)}
          disabled={isBusy}
        >
          🗑️ Delete
        </button>
      </div>
    </article>
  );
}
