const phonePattern = /^[+\d\s()-]{7,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toTrimmedString = (value = "") => String(value || "").trim();

export const createContactId = () =>
  `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const normalizePhoneValue = (phoneNumber = "") =>
  toTrimmedString(phoneNumber).replace(/[^\d+]/g, "");

const normalizeTimestamp = (value, fallbackValue) => {
  const timestamp = value ? new Date(value) : new Date(fallbackValue);

  if (Number.isNaN(timestamp.getTime())) {
    return new Date().toISOString();
  }

  return timestamp.toISOString();
};

export const sanitizeContactInput = (payload = {}, existingContact = null) => {
  const now = new Date().toISOString();
  const createdAt = normalizeTimestamp(
    existingContact?.createdAt || payload.createdAt,
    now
  );

  return {
    id: toTrimmedString(payload.id) || existingContact?.id || createContactId(),
    name: toTrimmedString(payload.name),
    mobile: toTrimmedString(payload.mobile || payload.phone),
    email: toTrimmedString(payload.email),
    category: toTrimmedString(payload.category) || "Personal",
    notes: toTrimmedString(payload.notes),
    favorite: Boolean(payload.favorite),
    createdAt,
    updatedAt: normalizeTimestamp(now, createdAt),
    phoneNormalized: normalizePhoneValue(payload.mobile || payload.phone),
  };
};

export const validateContact = (contact) => {
  if (!contact.name || !contact.mobile) {
    return "Name and mobile number are required.";
  }

  if (!phonePattern.test(contact.mobile)) {
    return "Use a valid mobile number with digits and separators.";
  }

  if (contact.email && !emailPattern.test(contact.email.toLowerCase())) {
    return "Add a valid email address or leave that field empty.";
  }

  return null;
};

export const serializeContact = (document = {}) => ({
  id: document.id,
  name: document.name,
  mobile: document.mobile,
  email: document.email,
  category: document.category,
  notes: document.notes,
  favorite: Boolean(document.favorite),
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

export const errorResponse = (status, message) =>
  Response.json({ error: message }, { status });

export const isDuplicateKeyError = (error) =>
  error?.code === 11000 ||
  String(error?.message || "").toLowerCase().includes("duplicate");
