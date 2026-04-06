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
      ? "No matches yet"
      : activeFilter === "favorites"
      ? "No favorites yet"
      : categoryFilter === "all"
      ? "No contacts saved"
      : "No contacts in this view";

    const emptyStateCopy = hasActiveSearch
      ? "Try a different keyword or clear the search field to see the full list."
      : activeFilter === "favorites"
      ? "Pin a few contacts as favorites to keep your important people within quick reach."
      : categoryFilter !== "all"
      ? "Switch the category filter or add a new contact in this category."
      : "Use the form to create your first contact and start building your lightweight address book.";

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
