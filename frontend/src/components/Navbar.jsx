import React from 'react';

export default function Navbar({ onOpenAddModal }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <a href="/" className="logo-brand">
          <span className="logo-badge">🍳</span>
          <span className="logo-text">
            Recipe<strong>Vault</strong>
          </span>
        </a>
        <p className="header-tagline">Craft, collect & savor every culinary creation</p>
        <button className="primary-action-btn" onClick={onOpenAddModal}>
          + New Recipe
        </button>
      </div>
    </header>
  );
}
