import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./components/App";

const createJsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

const createFetchMock = () => {
  let contacts = [];

  return jest.fn(async (input, init = {}) => {
    const requestUrl =
      typeof input === "string" ? input : input.url || "/api/contacts";
    const method = (init.method || "GET").toUpperCase();
    const parsedUrl = new URL(requestUrl, "http://localhost");
    const requestBody = init.body ? JSON.parse(init.body) : {};

    if (parsedUrl.pathname !== "/api/contacts") {
      throw new Error(`Unexpected request: ${requestUrl}`);
    }

    if (method === "GET") {
      return createJsonResponse({ contacts });
    }

    if (method === "POST" && Array.isArray(requestBody.contacts)) {
      const existingPhoneNumbers = new Set(
        contacts.map((contact) => contact.mobile.replace(/[^\d+]/g, ""))
      );
      let importedCount = 0;
      let skippedCount = 0;

      requestBody.contacts.forEach((contact) => {
        const normalizedPhone = contact.mobile.replace(/[^\d+]/g, "");

        if (!normalizedPhone || existingPhoneNumbers.has(normalizedPhone)) {
          skippedCount += 1;
          return;
        }

        existingPhoneNumbers.add(normalizedPhone);
        contacts = [contact, ...contacts];
        importedCount += 1;
      });

      return createJsonResponse({ contacts, importedCount, skippedCount });
    }

    if (method === "POST") {
      const nextContact = {
        ...requestBody,
        id: requestBody.id || `contact-${contacts.length + 1}`,
        createdAt: requestBody.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      contacts = [nextContact, ...contacts];
      return createJsonResponse({ contact: nextContact }, 201);
    }

    if (method === "PUT") {
      const updatedContact = {
        ...requestBody,
        updatedAt: new Date().toISOString(),
      };

      contacts = contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      );

      return createJsonResponse({ contact: updatedContact });
    }

    if (method === "DELETE") {
      const contactId = parsedUrl.searchParams.get("id");
      contacts = contacts.filter((contact) => contact.id !== contactId);
      return createJsonResponse({ success: true });
    }

    throw new Error(`Unexpected request method: ${method}`);
  });
};

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = createFetchMock();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("adds, edits, filters, favorites, and deletes contacts", async () => {
  render(<App />);

  expect(await screen.findByText("No contacts yet")).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText(/full name/i), "Jordan Lee");
  await userEvent.type(
    screen.getByLabelText(/mobile number/i),
    "+1 202 555 0123"
  );
  await userEvent.type(
    screen.getByLabelText(/email address/i),
    "jordan@studio.dev"
  );
  await userEvent.selectOptions(
    screen.getByLabelText(/contact category/i),
    "Work"
  );
  await userEvent.type(
    screen.getByLabelText(/notes/i),
    "Prefers project updates by email."
  );
  await userEvent.click(screen.getByLabelText(/add this contact to favorites/i));
  await userEvent.click(screen.getByRole("button", { name: /save contact/i }));

  expect(await screen.findByText("Jordan Lee")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /edit jordan lee/i }));

  const fullNameInput = screen.getByLabelText(/full name/i);
  await userEvent.clear(fullNameInput);
  await userEvent.type(fullNameInput, "Jordan Miles");
  await userEvent.click(
    screen.getByRole("button", { name: /save changes/i })
  );

  expect(await screen.findByText("Jordan Miles")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /^favorites$/i }));

  expect(screen.getByText("Jordan Miles")).toBeInTheDocument();
  expect(screen.queryByText("Luca Rivera")).not.toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: /delete jordan miles/i })
  );

  await waitFor(() => {
    expect(screen.queryByText("Jordan Miles")).not.toBeInTheDocument();
  });
});

test("falls back to browser storage when the api is unavailable", async () => {
  window.localStorage.setItem(
    "contact-dashboard.contacts",
    JSON.stringify([
      {
        id: "local-1",
        name: "Offline Contact",
        mobile: "+91 90000 00000",
        email: "offline@example.com",
        category: "Personal",
        notes: "Stored locally",
        favorite: false,
        createdAt: "2026-04-06T00:00:00.000Z",
        updatedAt: "2026-04-06T00:00:00.000Z",
      },
    ])
  );
  global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

  render(<App />);

  expect(await screen.findByText("Offline Contact")).toBeInTheDocument();
  expect(
    screen.getByText(/Cloud sync is temporarily unavailable/i)
  ).toBeInTheDocument();
});
