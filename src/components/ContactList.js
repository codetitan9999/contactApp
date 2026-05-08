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
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">Loading contacts</p>
        <p className="empty-state-copy">Getting your latest saved contacts.</p>
      </div>
    );
  }

  if (!contacts.length) {
    const emptyStateTitle = hasActiveSearch
      ? "No contacts match your search"
      : activeFilter === "favorites"
      ? "No favorite contacts yet"
      : categoryFilter === "all"
      ? "No contacts yet"
      : "No contacts in this category";

    const emptyStateCopy = hasActiveSearch
      ? "Try a different search or clear a filter."
      : activeFilter === "favorites"
      ? "Mark contacts as favorites to keep them easy to find."
      : categoryFilter !== "all"
      ? "Choose another category or add a contact here."
      : "Add your first contact to get started.";

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
