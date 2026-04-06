import React from "react";

function Header({
  totalContacts,
  visibleContacts,
  favoritesCount,
  emailCount,
}) {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="hero-kicker">Contact Dashboard</p>
        <h1>Contacts, now actually useful.</h1>
        <p className="hero-description">
          This old contact app now supports editing, favorites, categories,
          notes, sorting, filters, and JSON backup import/export without losing
          the lightweight feel.
        </p>
      </div>

      <div className="hero-metrics">
        <div className="metric-card">
          <span>Total contacts</span>
          <strong>{totalContacts}</strong>
        </div>
        <div className="metric-card">
          <span>Favorites</span>
          <strong>{favoritesCount}</strong>
        </div>
        <div className="metric-card">
          <span>With email</span>
          <strong>{emailCount}</strong>
        </div>
        <div className="metric-card">
          <span>Visible now</span>
          <strong>{visibleContacts}</strong>
        </div>
      </div>
    </header>
  );
}

export default Header;
