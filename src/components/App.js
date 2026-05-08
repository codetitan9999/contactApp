import React, { useEffect, useState } from "react";
import "./App.css";
import Header from "./Header";
import AddContacts from "./AddContacts";
import ContactList from "./ContactList";
import DirectoryToolbar from "./DirectoryToolbar";
import {
  canFallbackToLocalStorage,
  createContact as createContactInApi,
  deleteContact as deleteContactInApi,
  fetchContacts as fetchContactsFromApi,
  importContactsBatch,
  updateContact as updateContactInApi,
} from "../services/contactsApi";

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
  { value: "with-email", label: "Has email" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently updated" },
  { value: "name", label: "Name (A-Z)" },
  { value: "favorites-first", label: "Favorites first" },
];

const createContactId = () =>
  `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isLegacyDemoContact = (contactId = "") =>
  String(contactId).startsWith("starter-");

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
    return [];
  }

  try {
    const parsedContacts = JSON.parse(storedValue);

    if (!Array.isArray(parsedContacts)) {
      return [];
    }

    return parsedContacts
      .map((contact) => normalizeContact(contact))
      .filter(
        (contact) =>
          contact.name &&
          contact.mobile &&
          !isLegacyDemoContact(contact.id)
      );
  } catch {
    return [];
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

const getLocalModeMessage = (error, hasCachedContacts) => {
  const isSetupInProgress = error?.status === 503;

  if (isSetupInProgress) {
    return hasCachedContacts
      ? "Cloud sync is being set up. Showing the contacts saved on this device."
      : "Cloud sync is being set up. You can still use the app on this device.";
  }

  return hasCachedContacts
    ? "Cloud sync is temporarily unavailable. Showing the contacts saved on this device."
    : "Cloud sync is temporarily unavailable. You can still save contacts on this device.";
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
  const [storageMode, setStorageMode] = useState("local");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, [contacts]);

  useEffect(() => {
    let isCancelled = false;

    const loadContacts = async () => {
      setIsLoadingContacts(true);

      try {
        const remoteContacts = await fetchContactsFromApi();

        if (isCancelled) {
          return;
        }

        setContacts(remoteContacts.map((contact) => normalizeContact(contact)));
        setStorageMode("cloud");
        setDirectoryFeedback("");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const cachedContacts = readStoredContacts();

        setContacts(cachedContacts);
        setStorageMode("local");
        setDirectoryFeedback(getLocalModeMessage(error, Boolean(cachedContacts.length)));
      } finally {
        if (!isCancelled) {
          setIsLoadingContacts(false);
        }
      }
    };

    loadContacts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const editingContact =
    contacts.find((contact) => contact.id === editingContactId) || null;

  const saveContactHandler = async (contact) => {
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

    const applyLocalSave = () => {
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
      setStorageMode("local");
      setDirectoryFeedback(
        existingContact
          ? `Saved changes to ${nextContact.name} on this device.`
          : `${nextContact.name} has been added on this device.`
      );

      return { ok: true, mode: existingContact ? "edit" : "create" };
    };

    try {
      const savedContact = existingContact
        ? await updateContactInApi(normalizedContact)
        : await createContactInApi(normalizedContact);
      const nextContact = normalizeContact(savedContact);

      setContacts((currentContacts) => {
        if (existingContact) {
          return currentContacts.map((currentContact) =>
            currentContact.id === nextContact.id ? nextContact : currentContact
          );
        }

        return [nextContact, ...currentContacts];
      });

      setEditingContactId("");
      setStorageMode("cloud");
      setDirectoryFeedback(
        existingContact
          ? `Saved changes to ${nextContact.name}.`
          : `${nextContact.name} has been added to your contacts.`
      );

      return { ok: true, mode: existingContact ? "edit" : "create" };
    } catch (error) {
      if (!canFallbackToLocalStorage(error)) {
        return {
          ok: false,
          message: error.message || "Unable to save the contact.",
        };
      }

      return applyLocalSave();
    }
  };

  const editContactHandler = (contactId) => {
    const contactToEdit = contacts.find((contact) => contact.id === contactId);

    if (!contactToEdit) {
      return;
    }

    setEditingContactId(contactId);
    setDirectoryFeedback(`Editing details for ${contactToEdit.name}.`);
  };

  const cancelEditHandler = () => {
    setEditingContactId("");
    setDirectoryFeedback("Edit canceled. No changes were saved.");
  };

  const deleteContactHandler = async (contactId) => {
    const contactToDelete = contacts.find((contact) => contact.id === contactId);

    if (!contactToDelete) {
      return;
    }

    try {
      await deleteContactInApi(contactId);
      setStorageMode("cloud");
      setDirectoryFeedback(`${contactToDelete.name} has been removed.`);
    } catch (error) {
      if (!canFallbackToLocalStorage(error)) {
        setDirectoryFeedback(
          error.message || "Unable to remove this contact right now."
        );
        return;
      }

      setStorageMode("local");
      setDirectoryFeedback(`${contactToDelete.name} has been removed on this device.`);
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId)
    );

    if (editingContactId === contactId) {
      setEditingContactId("");
    }
  };

  const toggleFavoriteHandler = async (contactId) => {
    const contactToToggle = contacts.find((contact) => contact.id === contactId);

    if (!contactToToggle) {
      return;
    }

    const nextFavoriteState = !contactToToggle.favorite;

    try {
      const savedContact = await updateContactInApi({
        ...contactToToggle,
        favorite: nextFavoriteState,
      });

      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === contactId ? normalizeContact(savedContact) : contact
        )
      );
      setStorageMode("cloud");
      setDirectoryFeedback(
        nextFavoriteState
          ? `${contactToToggle.name} has been added to favorites.`
          : `${contactToToggle.name} has been removed from favorites.`
      );
    } catch (error) {
      if (!canFallbackToLocalStorage(error)) {
        setDirectoryFeedback(
          error.message || "Unable to update favorites right now."
        );
        return;
      }

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
      setStorageMode("local");
      setDirectoryFeedback(
        nextFavoriteState
          ? `${contactToToggle.name} has been added to favorites on this device.`
          : `${contactToToggle.name} has been removed from favorites on this device.`
      );
    }
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

    setDirectoryFeedback(
      `Backup downloaded for ${contacts.length} contact${
        contacts.length === 1 ? "" : "s"
      }.`
    );
  };

  const importContactsHandler = async (file) => {
    if (!file) {
      return;
    }

    try {
      const parsedPayload = JSON.parse(await file.text());
      const importedContacts = extractImportedContacts(parsedPayload);

      if (!importedContacts) {
        setDirectoryFeedback(
          "That file could not be imported. Please use a backup exported from this app."
        );
        return;
      }

      const normalizedImportedContacts = importedContacts
        .map((contact) => normalizeContact(contact))
        .filter((contact) => contact.name && contact.mobile);

      if (!normalizedImportedContacts.length) {
        setDirectoryFeedback("No valid contacts were found in that backup.");
        return;
      }

      try {
        const result = await importContactsBatch(normalizedImportedContacts);

        setContacts(result.contacts.map((contact) => normalizeContact(contact)));
        setStorageMode("cloud");
        setDirectoryFeedback(
          result.importedCount
            ? `Imported ${result.importedCount} contact${
                result.importedCount === 1 ? "" : "s"
              }${
                result.skippedCount
                  ? ` and skipped ${result.skippedCount} duplicate${
                      result.skippedCount === 1 ? "" : "s"
                    }.`
                  : "."
              }`
            : "No new contacts were imported from that file."
        );
      } catch (error) {
        if (!canFallbackToLocalStorage(error)) {
          setDirectoryFeedback(
            error.message || "Unable to import contacts right now."
          );
          return;
        }

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
        setStorageMode("local");
        setDirectoryFeedback(
          importedCount
            ? `Imported ${importedCount} contact${
                importedCount === 1 ? "" : "s"
              } on this device${
                skippedCount
                  ? ` and skipped ${skippedCount} duplicate${
                      skippedCount === 1 ? "" : "s"
                    }.`
                  : "."
              }`
            : "No new contacts were imported from that file."
        );
      }
    } catch {
      setDirectoryFeedback(
        "The selected file could not be read. Please choose a valid JSON backup."
      );
    }
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
  const storageLabel =
    storageMode === "cloud" ? "Cloud sync on" : "This device only";
  return (
    <div className="page-shell">
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
            storageMode={storageMode}
          />

          <section className="panel panel-wide">
            <div className="panel-header compact">
              <div>
                <p className="panel-kicker">Directory</p>
                <h2>Your contact directory</h2>
                <p className="panel-copy">
                  Search, update, or back up the contacts you have saved.
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
              storageLabel={storageLabel}
            />

            <ContactList
              contacts={filteredContacts}
              onDeleteContact={deleteContactHandler}
              onEditContact={editContactHandler}
              onToggleFavorite={toggleFavoriteHandler}
              hasActiveSearch={Boolean(normalizedQuery)}
              activeFilter={activeFilter}
              categoryFilter={categoryFilter}
              isLoading={isLoadingContacts}
            />
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
