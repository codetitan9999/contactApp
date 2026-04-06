import React from "react";
import ContactCard from "./ContactCard";

function ContactList({
  contacts,
  onDeleteContact,
  onEditContact,
  onToggleFavorite,
  hasActiveSearch,
  activeFilter,
  categoryFilter,
}) {
  if (!contacts.length) {
    const emptyStateTitle = hasActiveSearch
      ? "No contacts match your search"
      : activeFilter === "favorites"
      ? "No favorite contacts yet"
      : categoryFilter === "all"
      ? "No contacts yet"
      : "No contacts in this category";

    const emptyStateCopy = hasActiveSearch
      ? "Try a different search term or clear one of the active filters."
      : activeFilter === "favorites"
      ? "Mark important people as favorites to keep them easy to find."
      : categoryFilter !== "all"
      ? "Choose a different category or add a contact to this group."
      : "Add your first contact to start building your directory.";

    return (
      <div className="empty-state">
        <p className="empty-state-title">{emptyStateTitle}</p>
        <p className="empty-state-copy">{emptyStateCopy}</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onDeleteContact={onDeleteContact}
          onEditContact={onEditContact}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default ContactList;
