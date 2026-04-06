import React, { useEffect, useState } from "react";
import "./App.css";
import Header from "./Header";
import AddContacts from "./AddContacts";
import ContactList from "./ContactList";
import DirectoryToolbar from "./DirectoryToolbar";

const LOCAL_STORAGE_KEY = "contact-dashboard.contacts";
const LEGACY_STORAGE_KEYS = ["contacts"];

const CONTACT_CATEGORIES = [
  "Personal",
  "Work",
  "Family",
  "Client",
  "Emergency",
];

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "favorites", label: "Favorites" },
  { value: "with-email", label: "With Email" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Updated" },
  { value: "name", label: "Name A-Z" },
  { value: "favorites-first", label: "Favorites First" },
];

const starterContacts = [
  {
    id: "starter-ava",
    name: "Ava Patel",
    mobile: "+91 98765 43210",
    email: "ava@northstar.dev",
    category: "Work",
    notes: "Product lead. Prefers morning calls on weekdays.",
    favorite: true,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-03T11:30:00.000Z",
  },
  {
    id: "starter-luca",
    name: "Luca Rivera",
    mobile: "+1 (415) 555-0132",
    email: "luca@atelier.one",
    category: "Client",
    notes: "Send polished visual references before the next review.",
    favorite: false,
    createdAt: "2026-03-28T15:15:00.000Z",
    updatedAt: "2026-03-31T08:10:00.000Z",
  },
  {
    id: "starter-mei",
    name: "Mei Tan",
    mobile: "+65 8123 4567",
    email: "mei@harbor.studio",
    category: "Personal",
    notes: "Usually replies fastest on WhatsApp.",
    favorite: true,
    createdAt: "2026-03-20T13:45:00.000Z",
    updatedAt: "2026-04-02T18:40:00.000Z",
  },
];

const createContactId = () =>
  `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizePhoneValue = (phoneNumber = "") =>
  String(phoneNumber).replace(/[^\d+]/g, "");

const normalizeCategory = (category = "") =>
  CONTACT_CATEGORIES.includes(category) ? category : CONTACT_CATEGORIES[0];

const normalizeTimestamp = (value, fallbackValue) => {
  const dateValue = value ? new Date(value) : new Date(fallbackValue);

  if (Number.isNaN(dateValue.getTime())) {
    return new Date().toISOString();
  }

  return dateValue.toISOString();
};

const normalizeContact = (contact = {}) => {
  const createdAt = normalizeTimestamp(contact.createdAt, new Date().toISOString());

  return {
    id: contact.id || createContactId(),
    name: String(contact.name || "").trim(),
    mobile: String(contact.mobile || contact.phone || "").trim(),
    email: String(contact.email || "").trim(),
    category: normalizeCategory(contact.category),
    notes: String(contact.notes || "").trim(),
    favorite: Boolean(contact.favorite),
    createdAt,
    updatedAt: normalizeTimestamp(contact.updatedAt, createdAt),
  };
};

const readStoredContacts = () => {
  const storedValue = [LOCAL_STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
    .map((key) => localStorage.getItem(key))
    .find(Boolean);

  if (!storedValue) {
    return starterContacts.map((contact) => normalizeContact(contact));
  }

  try {
    const parsedContacts = JSON.parse(storedValue);

    if (!Array.isArray(parsedContacts)) {
      return starterContacts.map((contact) => normalizeContact(contact));
    }

    return parsedContacts
      .map((contact) => normalizeContact(contact))
      .filter((contact) => contact.name && contact.mobile);
  } catch {
    return starterContacts.map((contact) => normalizeContact(contact));
  }
};

const extractImportedContacts = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.contacts)) {
    return payload.contacts;
  }

  return null;
};

const createExportFilename = () => {
  const dateLabel = new Date().toISOString().slice(0, 10);
  return `contact-dashboard-backup-${dateLabel}.json`;
};

function App() {
  const [contacts, setContacts] = useState(() => readStoredContacts());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS[0].value);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [editingContactId, setEditingContactId] = useState("");
  const [directoryFeedback, setDirectoryFeedback] = useState("");

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, [contacts]);

  const editingContact =
    contacts.find((contact) => contact.id === editingContactId) || null;

  const saveContactHandler = (contact) => {
    const normalizedContact = normalizeContact(contact);
    const normalizedPhone = normalizePhoneValue(normalizedContact.mobile);
    const existingContact = contacts.find(
      (currentContact) => currentContact.id === normalizedContact.id
    );

    const hasDuplicate = contacts.some(
      (currentContact) =>
        currentContact.id !== normalizedContact.id &&
        normalizePhoneValue(currentContact.mobile) === normalizedPhone
    );

    if (hasDuplicate) {
      return {
        ok: false,
        message: "That mobile number is already saved in your contact list.",
      };
    }

    const timestamp = new Date().toISOString();
    const nextContact = {
      ...normalizedContact,
      createdAt: existingContact
        ? existingContact.createdAt
        : normalizedContact.createdAt,
      updatedAt: timestamp,
    };

    setContacts((currentContacts) => {
      if (existingContact) {
        return currentContacts.map((currentContact) =>
          currentContact.id === nextContact.id ? nextContact : currentContact
        );
      }

      return [nextContact, ...currentContacts];
    });

    setEditingContactId("");
    setDirectoryFeedback(
      existingContact
        ? `Updated ${nextContact.name}.`
        : `Added ${nextContact.name}.`
    );

    return { ok: true, mode: existingContact ? "edit" : "create" };
  };

  const editContactHandler = (contactId) => {
    const contactToEdit = contacts.find((contact) => contact.id === contactId);

    if (!contactToEdit) {
      return;
    }

    setEditingContactId(contactId);
    setDirectoryFeedback(`Editing ${contactToEdit.name}.`);
  };

  const cancelEditHandler = () => {
    setEditingContactId("");
    setDirectoryFeedback("Edit canceled.");
  };

  const deleteContactHandler = (contactId) => {
    const contactToDelete = contacts.find((contact) => contact.id === contactId);

    if (!contactToDelete) {
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId)
    );

    if (editingContactId === contactId) {
      setEditingContactId("");
    }

    setDirectoryFeedback(`Removed ${contactToDelete.name}.`);
  };

  const toggleFavoriteHandler = (contactId) => {
    const contactToToggle = contacts.find((contact) => contact.id === contactId);

    if (!contactToToggle) {
      return;
    }

    const nextFavoriteState = !contactToToggle.favorite;

    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              favorite: nextFavoriteState,
              updatedAt: new Date().toISOString(),
            }
          : contact
      )
    );

    setDirectoryFeedback(
      nextFavoriteState
        ? `${contactToToggle.name} is now pinned as a favorite.`
        : `${contactToToggle.name} is no longer pinned.`
    );
  };

  const exportContactsHandler = () => {
    const exportPayload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      contacts,
    };

    const fileBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(fileBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download = createExportFilename();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(objectUrl);

    setDirectoryFeedback(`Exported ${contacts.length} contacts to a JSON backup.`);
  };

  const importContactsHandler = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedPayload = JSON.parse(String(reader.result || ""));
        const importedContacts = extractImportedContacts(parsedPayload);

        if (!importedContacts) {
          setDirectoryFeedback(
            "That file doesn’t look like a contact export from this app."
          );
          return;
        }

        const normalizedImportedContacts = importedContacts
          .map((contact) => normalizeContact(contact))
          .filter((contact) => contact.name && contact.mobile);

        const existingPhoneNumbers = new Set(
          contacts.map((contact) => normalizePhoneValue(contact.mobile))
        );
        const nextContacts = [...contacts];
        let importedCount = 0;
        let skippedCount = 0;

        normalizedImportedContacts.forEach((contact) => {
          const normalizedPhone = normalizePhoneValue(contact.mobile);

          if (!normalizedPhone || existingPhoneNumbers.has(normalizedPhone)) {
            skippedCount += 1;
            return;
          }

          existingPhoneNumbers.add(normalizedPhone);
          nextContacts.unshift(contact);
          importedCount += 1;
        });

        setContacts(nextContacts);
        setDirectoryFeedback(
          importedCount
            ? `Imported ${importedCount} contacts${
                skippedCount ? ` and skipped ${skippedCount} duplicates.` : "."
              }`
            : "No new contacts were imported from that file."
        );
      } catch {
        setDirectoryFeedback(
          "Couldn’t read that file. Try a JSON backup exported from this app."
        );
      }
    };

    reader.readAsText(file);
  };

  const normalizedQuery = searchTerm.trim().toLowerCase();

  const filteredContacts = [...contacts]
    .filter((contact) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        contact.name,
        contact.mobile,
        contact.email,
        contact.category,
        contact.notes,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .filter((contact) => {
      if (activeFilter === "favorites") {
        return contact.favorite;
      }

      if (activeFilter === "with-email") {
        return Boolean(contact.email);
      }

      return true;
    })
    .filter((contact) => {
      if (categoryFilter === "all") {
        return true;
      }

      return contact.category === categoryFilter;
    })
    .sort((leftContact, rightContact) => {
      if (sortBy === "name") {
        return leftContact.name.localeCompare(rightContact.name);
      }

      if (sortBy === "favorites-first") {
        if (leftContact.favorite !== rightContact.favorite) {
          return Number(rightContact.favorite) - Number(leftContact.favorite);
        }

        return leftContact.name.localeCompare(rightContact.name);
      }

      return (
        new Date(rightContact.updatedAt).getTime() -
        new Date(leftContact.updatedAt).getTime()
      );
    });

  const favoritesCount = contacts.filter((contact) => contact.favorite).length;
  const emailCount = contacts.filter((contact) => contact.email).length;
  return (
    <div className="page-shell">
      <div className="page-orb page-orb-left" />
      <div className="page-orb page-orb-right" />

      <main className="app-shell">
        <Header
          totalContacts={contacts.length}
          visibleContacts={filteredContacts.length}
          favoritesCount={favoritesCount}
          emailCount={emailCount}
        />

        <section className="dashboard-grid">
          <AddContacts
            addContactHandler={saveContactHandler}
            editingContact={editingContact}
            onCancelEdit={cancelEditHandler}
            contactCategories={CONTACT_CATEGORIES}
          />

          <section className="panel panel-wide">
            <div className="panel-header compact">
              <div>
                <p className="panel-kicker">Directory</p>
                <h2>Your saved contacts</h2>
                <p className="panel-copy">
                  Manage favorites, edit profiles, filter by category, and keep
                  a JSON backup of everything in one lightweight workspace.
                </p>
              </div>
            </div>

            <DirectoryToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onExportContacts={exportContactsHandler}
              onImportContacts={importContactsHandler}
              feedbackMessage={directoryFeedback}
              filterOptions={FILTER_OPTIONS}
              sortOptions={SORT_OPTIONS}
              contactCategories={CONTACT_CATEGORIES}
              totalContacts={contacts.length}
              visibleContacts={filteredContacts.length}
            />

            <ContactList
              contacts={filteredContacts}
              onDeleteContact={deleteContactHandler}
              onEditContact={editContactHandler}
              onToggleFavorite={toggleFavoriteHandler}
              hasActiveSearch={Boolean(normalizedQuery)}
              activeFilter={activeFilter}
              categoryFilter={categoryFilter}
            />
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
