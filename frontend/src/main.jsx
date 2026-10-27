import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import RecipeCard from './components/RecipeCard';
import RecipeModal, { RECIPE_CATEGORIES } from './components/RecipeModal';
import { recipeApi } from './services/api';
import './style.css';

const INITIAL_FORM_VALUES = {
  name: '',
  category: 'Breakfast',
  ingredients: '',
  steps: '',
  cookingTime: ''
};

function RecipeBookApplication() {
  const [recipesList, setRecipesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Modal & Form States
  const [currentModal, setCurrentModal] = useState(null); // { type: 'form' | 'details' | 'delete', recipe }
  const [recipeFormData, setRecipeFormData] = useState(INITIAL_FORM_VALUES);
  const [formValidationError, setFormValidationError] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);

  // Load recipes from MongoDB Atlas on mount
  const fetchAllRecipes = async () => {
    setIsLoading(true);
    setApiErrorMessage('');
    try {
      const data = await recipeApi.getAll();
      setRecipesList(data);
    } catch (err) {
      setApiErrorMessage(err.message || 'Unable to fetch recipes from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const handleCloseModal = () => {
    setCurrentModal(null);
    setFormValidationError('');
  };

  const handleOpenCreateModal = () => {
    setRecipeFormData(INITIAL_FORM_VALUES);
    setFormValidationError('');
    setCurrentModal({ type: 'form', recipe: null });
  };

  const handleOpenEditModal = (recipeToEdit) => {
    setRecipeFormData({
      name: recipeToEdit.name,
      category: recipeToEdit.category,
      ingredients: recipeToEdit.ingredients,
      steps: recipeToEdit.steps,
      cookingTime: recipeToEdit.cookingTime
    });
    setFormValidationError('');
    setCurrentModal({ type: 'form', recipe: recipeToEdit });
  };

  const handleOpenDetailsModal = async (recipe) => {
    setIsActionPending(true);
    setApiErrorMessage('');
    try {
      const fullRecipe = await recipeApi.getById(recipe._id);
      setCurrentModal({ type: 'details', recipe: fullRecipe });
    } catch (err) {
      setApiErrorMessage(err.message || 'Failed to load full recipe details.');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleOpenDeleteModal = (recipeToDelete) => {
    setFormValidationError('');
    setCurrentModal({ type: 'delete', recipe: recipeToDelete });
  };

  const handleFormFieldChange = (e) => {
    const { name, value } = e.target;
    setRecipeFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Handler for Add / Edit
  const handleSubmitRecipe = async (e) => {
    e.preventDefault();

    // Frontend validations
    const trimmedName = recipeFormData.name.trim();
    const trimmedIngredients = recipeFormData.ingredients.trim();
    const trimmedSteps = recipeFormData.steps.trim();
    const rawCookingTime = recipeFormData.cookingTime;
    const parsedCookingTime = Number(rawCookingTime);

    if (!trimmedName || !trimmedIngredients || !trimmedSteps || rawCookingTime === '') {
      setFormValidationError('Please complete all required fields.');
      return;
    }

    if (
      isNaN(parsedCookingTime) ||
      !Number.isInteger(parsedCookingTime) ||
      parsedCookingTime < 0
    ) {
      setFormValidationError('Cooking time must be a non-negative whole number (0 or greater).');
      return;
    }

    setIsActionPending(true);
    setFormValidationError('');

    try {
      const isEditing = Boolean(currentModal?.recipe?._id);
      const recipePayload = {
        name: trimmedName,
        category: recipeFormData.category,
        ingredients: trimmedIngredients,
        steps: trimmedSteps,
        cookingTime: parsedCookingTime
      };

      let savedRecipe;
      if (isEditing) {
        savedRecipe = await recipeApi.update(currentModal.recipe._id, recipePayload);
        setRecipesList((prevList) =>
          prevList.map((item) => (item._id === savedRecipe._id ? savedRecipe : item))
        );
        setSuccessBanner(`Recipe "${savedRecipe.name}" successfully updated!`);
      } else {
        savedRecipe = await recipeApi.create(recipePayload);
        setRecipesList((prevList) => [savedRecipe, ...prevList]);
        setSuccessBanner(`Recipe "${savedRecipe.name}" successfully added to your collection!`);
      }

      setSearchQuery('');
      setActiveCategoryFilter('All');
      handleCloseModal();
    } catch (err) {
      setFormValidationError(err.message || 'Failed to save recipe to database.');
    } finally {
      setIsActionPending(false);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!currentModal?.recipe?._id) return;

    setIsActionPending(true);
    setFormValidationError('');

    try {
      const targetId = currentModal.recipe._id;
      const targetName = currentModal.recipe.name;
      await recipeApi.remove(targetId);

      setRecipesList((prevList) => prevList.filter((item) => item._id !== targetId));
      setSuccessBanner(`Recipe "${targetName}" was successfully removed.`);
      handleCloseModal();
    } catch (err) {
      setFormValidationError(err.message || 'Failed to delete recipe from server.');
    } finally {
      setIsActionPending(false);
    }
  };

  // Filtered recipe list based on search and category
  const filteredRecipes = recipesList.filter((item) => {
    const matchesCategory =
      activeCategoryFilter === 'All' || item.category === activeCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="recipe-book-app-root">
      <Navbar onOpenAddModal={handleOpenCreateModal} />

      <main className="main-content-layout">
        <HeroBanner onOpenAddModal={handleOpenCreateModal} />

        {/* Collection Section */}
        <section className="recipes-collection-section">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">SAVED DISHES</span>
              <h2 className="section-title">
                Your Recipes Collection
                <span className="recipe-counter-badge">{recipesList.length}</span>
              </h2>
            </div>

            {/* Search Input */}
            <div className="search-bar-wrapper">
              <span className="search-icon-symbol" aria-hidden="true">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search recipe by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search recipes"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-pills" role="toolbar" aria-label="Filter recipes by category">
            {['All', ...RECIPE_CATEGORIES].map((categoryName) => {
              const isSelected = activeCategoryFilter === categoryName;
              return (
                <button
                  key={categoryName}
                  type="button"
                  className={`filter-pill-btn ${isSelected ? 'pill-active' : ''}`}
                  onClick={() => setActiveCategoryFilter(categoryName)}
                  aria-pressed={isSelected}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>

          {/* Alerts: Success and Error */}
          {successBanner && (
            <div className="alert-box alert-success" role="status">
              <span>{successBanner}</span>
              <button
                type="button"
                className="alert-dismiss-btn"
                onClick={() => setSuccessBanner('')}
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          )}

          {apiErrorMessage && (
            <div className="alert-box alert-danger" role="alert">
              <span>⚠️ {apiErrorMessage}</span>
              <button type="button" className="alert-retry-btn" onClick={fetchAllRecipes}>
                Retry
              </button>
            </div>
          )}

          {/* Recipe Grid / Loading / Empty States */}
          {isLoading ? (
            <div className="state-panel-card">
              <div className="spinner-loader"></div>
              <p>Fetching your culinary collection from MongoDB Atlas...</p>
            </div>
          ) : !apiErrorMessage && filteredRecipes.length === 0 ? (
            <div className="state-panel-card empty-results">
              <span className="empty-state-icon">📖</span>
              <h3>
                {recipesList.length > 0
                  ? 'No matching recipes found'
                  : 'Your recipe book is currently empty'}
              </h3>
              <p>
                {recipesList.length > 0
                  ? 'Try adjusting your search criteria or switching category filters.'
                  : 'Start building your personal kitchen cookbook by adding your first recipe!'}
              </p>
              <button className="primary-action-btn" onClick={handleOpenCreateModal}>
                + Add Your First Recipe
              </button>
            </div>
          ) : (
            <div className="recipe-cards-grid">
              {filteredRecipes.map((recipeItem) => (
                <RecipeCard
                  key={recipeItem._id}
                  recipe={recipeItem}
                  onViewDetails={handleOpenDetailsModal}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                  isBusy={isActionPending}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Recipe Book (MERN Stack). All recipes saved securely in MongoDB Atlas.</p>
        </footer>
      </main>

      {/* Render Active Modal (Details / Form / Delete) */}
      {currentModal && (
        <RecipeModal
          modalState={currentModal}
          formData={recipeFormData}
          formError={formValidationError}
          isSubmitting={isActionPending}
          onClose={handleCloseModal}
          onChangeField={handleFormFieldChange}
          onSubmitForm={handleSubmitRecipe}
          onConfirmDelete={handleConfirmDelete}
          onSwitchToEdit={handleOpenEditModal}
        />
      )}
    </div>
  );
}

const rootContainer = document.getElementById('root');
createRoot(rootContainer).render(<RecipeBookApplication />);
