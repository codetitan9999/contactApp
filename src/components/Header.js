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
        <p className="hero-kicker">Contact Manager</p>
        <h1>A simple place to keep your contacts.</h1>
        <p className="hero-description">
          Add people, search quickly, and update details when things change.
        </p>
      </div>

      <div className="hero-metrics">
        <div className="metric-card">
          <span>Total</span>
          <strong>{totalContacts}</strong>
        </div>
        <div className="metric-card">
          <span>Showing</span>
          <strong>{visibleContacts}</strong>
        </div>
        <div className="metric-card">
          <span>Favorites</span>
          <strong>{favoritesCount}</strong>
        </div>
        <div className="metric-card">
          <span>With email</span>
          <strong>{emailCount}</strong>
        </div>
      </div>
    </header>
  );
}

export default Header;
