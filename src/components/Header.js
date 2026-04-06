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
        <h1>Keep every important contact in one place.</h1>
        <p className="hero-description">
          Organize phone numbers, email addresses, notes, and priority contacts
          in a clean directory built for everyday use.
        </p>
      </div>

      <div className="hero-metrics">
        <div className="metric-card">
          <span>All contacts</span>
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
          <span>Showing</span>
          <strong>{visibleContacts}</strong>
        </div>
      </div>
    </header>
  );
}

export default Header;
