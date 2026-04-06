import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./components/App";

beforeEach(() => {
  window.localStorage.clear();
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

  expect(screen.queryByText("Jordan Miles")).not.toBeInTheDocument();
});
