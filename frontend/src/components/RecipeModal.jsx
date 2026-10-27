import React, { useEffect, useRef } from 'react';

export const RECIPE_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export default function RecipeModal({
  modalState,
  formData,
  formError,
  isSubmitting,
  onClose,
  onChangeField,
  onSubmitForm,
  onConfirmDelete,
  onSwitchToEdit
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement && !dialogElement.open) {
      dialogElement.showModal();
    }
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current && !isSubmitting) {
      onClose();
    }
  };

  const getModalTitle = () => {
    if (modalState.type === 'form') {
      return modalState.recipe ? 'Update Recipe' : 'Add New Recipe';
    }
    if (modalState.type === 'delete') {
      return 'Confirm Recipe Deletion';
    }
    return modalState.recipe.name;
  };

  return (
    <dialog
      ref={dialogRef}
      className="custom-dialog-modal"
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        if (!isSubmitting) onClose();
      }}
    >
      <div className="dialog-inner-wrapper">
        <header className="dialog-header-bar">
          <h2 className="dialog-title-text">{getModalTitle()}</h2>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        {/* 1. FORM MODE (ADD / EDIT) */}
        {modalState.type === 'form' && (
          <form onSubmit={onSubmitForm} className="modal-recipe-form">
            <p className="form-subheading">
              Fill in the recipe specifics below. All fields are mandatory.
            </p>

            <div className="form-field-group">
              <label htmlFor="name-input">Recipe Name</label>
              <input
                id="name-input"
                name="name"
                type="text"
                required
                maxLength={120}
                placeholder="e.g., Creamy Garlic Butter Shrimp"
                value={formData.name}
                onChange={onChangeField}
                autoFocus
              />
            </div>

            <div className="form-two-column-row">
              <div className="form-field-group">
                <label htmlFor="category-select">Category</label>
                <select
                  id="category-select"
                  name="category"
                  value={formData.category}
                  onChange={onChangeField}
                >
                  {RECIPE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label htmlFor="time-input">Cooking Time (minutes)</label>
                <input
                  id="time-input"
                  name="cookingTime"
                  type="number"
                  required
                  min="0"
                  max="10080"
                  step="1"
                  placeholder="25"
                  value={formData.cookingTime}
                  onChange={onChangeField}
                />
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="ingredients-textarea">Ingredients (one per line)</label>
              <textarea
                id="ingredients-textarea"
                name="ingredients"
                required
                maxLength={10000}
                rows={4}
                placeholder="2 cups rice&#10;1 tsp salt&#10;2 tbsp olive oil"
                value={formData.ingredients}
                onChange={onChangeField}
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="steps-textarea">Preparation Steps (step by step)</label>
              <textarea
                id="steps-textarea"
                name="steps"
                required
                maxLength={20000}
                rows={5}
                placeholder="1. Rinse the rice under cold water.&#10;2. Bring water to a boil in a medium saucepan.&#10;3. Simmer on low heat for 15 minutes."
                value={formData.steps}
                onChange={onChangeField}
              />
            </div>

            {formError && (
              <div className="form-error-callout" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div className="dialog-button-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-modal-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving to Database...' : 'Save Recipe'}
              </button>
            </div>
          </form>
        )}

        {/* 2. DELETE CONFIRMATION MODE */}
        {modalState.type === 'delete' && (
          <div className="delete-confirm-container">
            <p className="delete-warning-message">
              Are you sure you want to delete <strong>{modalState.recipe.name}</strong>?
              This will permanently delete the recipe from your MongoDB Atlas database.
            </p>

            {formError && (
              <div className="form-error-callout" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div className="dialog-button-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Keep Recipe
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={onConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* 3. DETAILS VIEW MODE */}
        {modalState.type === 'details' && (
          <div className="recipe-details-view">
            <div className="details-badge-row">
              <span className="details-category-pill">{modalState.recipe.category}</span>
              <span className="details-duration-pill">⏱️ {modalState.recipe.cookingTime} minutes</span>
            </div>

            <section className="details-section">
              <h4>📝 Ingredients</h4>
              <ul className="details-bullet-list">
                {modalState.recipe.ingredients
                  .split('\n')
                  .filter((item) => item.trim().length > 0)
                  .map((ingredientLine, index) => (
                    <li key={index}>{ingredientLine}</li>
                  ))}
              </ul>
            </section>

            <section className="details-section">
              <h4>👨‍🍳 Preparation Steps</h4>
              <ol className="details-numbered-list">
                {modalState.recipe.steps
                  .split('\n')
                  .filter((step) => step.trim().length > 0)
                  .map((stepLine, index) => (
                    <li key={index}>{stepLine}</li>
                  ))}
              </ol>
            </section>

            <div className="dialog-button-actions">
              <button type="button" className="btn-modal-secondary" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => onSwitchToEdit(modalState.recipe)}
              >
                ✏️ Edit This Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
