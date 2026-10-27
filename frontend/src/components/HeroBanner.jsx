import React from 'react';

export default function HeroBanner({ onOpenAddModal }) {
  return (
    <section className="culinary-hero">
      <div className="hero-text-content">
        <span className="hero-kicker">PERSONAL RECIPE REPOSITORY</span>
        <h1 className="hero-heading">
          Every Great Dish <br />
          <em>Begins With a Story.</em>
        </h1>
        <p className="hero-description">
          Keep your secret seasonings, morning breakfasts, and family favorites neatly cataloged
          with instant MongoDB Atlas synchronization.
        </p>
        <div className="hero-button-group">
          <button className="hero-cta-btn" onClick={onOpenAddModal}>
            ✨ Add Your Favorite Recipe
          </button>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="culinary-card-showcase">
          <div className="showcase-icon">🥗</div>
          <div className="showcase-meta">
            <strong>Fresh & Fast</strong>
            <span>MERN Stack Powered</span>
          </div>
        </div>
      </div>
    </section>
  );
}
