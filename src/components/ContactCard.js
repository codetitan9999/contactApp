import React from "react";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatDateLabel = (dateValue) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));

function ContactCard({
  contact,
  onDeleteContact,
  onEditContact,
  onToggleFavorite,
}) {
  const { id, name, mobile, email, category, favorite, notes, updatedAt } =
    contact;

  return (
    <article className="contact-card">
      <div className="contact-avatar" aria-hidden="true">
        {getInitials(name)}
      </div>

      <div className="contact-content">
        <div className="contact-row">
          <div>
            <div className="contact-title-row">
              <h3>{name}</h3>
              <button
                className={`favorite-button${favorite ? " is-active" : ""}`}
                type="button"
                onClick={() => onToggleFavorite(id)}
                aria-label={`${favorite ? "Unfavorite" : "Favorite"} ${name}`}
              >
                {favorite ? "★" : "☆"}
              </button>
            </div>

            <div className="contact-meta">
              <span className="contact-pill">{category}</span>
              {favorite ? (
                <span className="contact-pill contact-pill-highlight">
                  Favorite
                </span>
              ) : null}
              <span className="contact-updated">
                Updated {formatDateLabel(updatedAt)}
              </span>
            </div>
          </div>

          <div className="contact-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => onEditContact(id)}
              aria-label={`Edit ${name}`}
            >
              Edit
            </button>

            <button
              className="ghost-button danger-button"
              type="button"
              onClick={() => onDeleteContact(id)}
              aria-label={`Delete ${name}`}
            >
              Remove
            </button>
          </div>
        </div>

        <div className="contact-details">
          <a href={`tel:${mobile.replace(/[^\d+]/g, "")}`}>{mobile}</a>
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <span className="contact-muted">Email not added yet</span>
          )}
        </div>

        {notes ? <p className="contact-note">{notes}</p> : null}
      </div>
    </article>
  );
}

export default ContactCard;
