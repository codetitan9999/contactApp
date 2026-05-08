const CONTACTS_ENDPOINT = "/api/contacts";

export class ContactsApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ContactsApiError";
    this.status = status;
  }
}

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new ContactsApiError(
      data?.error || "Unable to complete the request.",
      response.status
    );
  }

  return data;
};

export const canFallbackToLocalStorage = (error) =>
  !(error instanceof ContactsApiError) || error.status >= 500;

export const fetchContacts = async () => {
  const data = await request(CONTACTS_ENDPOINT);
  return data?.contacts || [];
};

export const createContact = async (contact) => {
  const data = await request(CONTACTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(contact),
  });

  return data?.contact;
};

export const updateContact = async (contact) => {
  const data = await request(CONTACTS_ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(contact),
  });

  return data?.contact;
};

export const deleteContact = async (contactId) =>
  request(`${CONTACTS_ENDPOINT}?id=${encodeURIComponent(contactId)}`, {
    method: "DELETE",
  });

export const importContactsBatch = async (contacts) => {
  const data = await request(CONTACTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ contacts }),
  });

  return {
    contacts: data?.contacts || [],
    importedCount: data?.importedCount || 0,
    skippedCount: data?.skippedCount || 0,
  };
};
