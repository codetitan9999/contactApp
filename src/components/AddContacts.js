import React, { useEffect, useRef, useState } from "react";

const createInitialFormState = () => ({
  id: "",
  name: "",
  mobile: "",
  email: "",
  category: "Personal",
  notes: "",
  favorite: false,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]{7,20}$/;

const mapContactToFormState = (contact) => ({
  id: contact.id,
  name: contact.name,
  mobile: contact.mobile,
  email: contact.email,
  category: contact.category,
  notes: contact.notes,
  favorite: contact.favorite,
});

function AddContacts({
  addContactHandler,
  editingContact,
  onCancelEdit,
  contactCategories,
}) {
  const [formData, setFormData] = useState(createInitialFormState);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const previousEditingId = useRef("");

  useEffect(() => {
    if (editingContact) {
      setFormData(mapContactToFormState(editingContact));
      setFeedbackMessage(`Updating details for ${editingContact.name}.`);
      previousEditingId.current = editingContact.id;
      return;
    }

    if (previousEditingId.current) {
      setFormData(createInitialFormState());
      previousEditingId.current = "";
    }
  }, [editingContact]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedForm = {
      ...formData,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      notes: formData.notes.trim(),
    };

    if (!normalizedForm.name || !normalizedForm.mobile) {
      setFeedbackMessage("Name and mobile number are required.");
      return;
    }

    if (!phonePattern.test(normalizedForm.mobile)) {
      setFeedbackMessage("Use a valid mobile number with digits and separators.");
      return;
    }

    if (
      normalizedForm.email &&
      !emailPattern.test(normalizedForm.email.toLowerCase())
    ) {
      setFeedbackMessage("Add a valid email address or leave that field empty.");
      return;
    }

    const result = addContactHandler(normalizedForm);

    if (!result.ok) {
      setFeedbackMessage(result.message);
      return;
    }

    setFormData(createInitialFormState());
    setFeedbackMessage(
      result.mode === "edit"
        ? "Changes saved successfully."
        : "Contact saved successfully."
    );
  };

  const handleCancel = () => {
    setFormData(createInitialFormState());
    setFeedbackMessage("Edit canceled.");
    onCancelEdit();
  };

  return (
    <section className="panel">
      <div className="panel-header compact">
        <div>
          <p className="panel-kicker">
            {editingContact ? "Edit Contact" : "New Contact"}
          </p>
          <h2>
            {editingContact
              ? "Update contact details"
              : "Add a contact"}
          </h2>
          <p className="panel-copy">
            Save the details you need for day-to-day communication, follow-up,
            and quick reference.
          </p>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor="contactName">
          <span>Full name</span>
          <input
            id="contactName"
            name="name"
            type="text"
            placeholder="Priya Nair"
            value={formData.name}
            onChange={handleChange}
          />
        </label>

        <label className="field" htmlFor="contactMobile">
          <span>Mobile number</span>
          <input
            id="contactMobile"
            name="mobile"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.mobile}
            onChange={handleChange}
          />
        </label>

        <label className="field" htmlFor="contactEmail">
          <span>Email address</span>
          <input
            id="contactEmail"
            name="email"
            type="email"
            placeholder="priya@company.com"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label className="field" htmlFor="contactCategory">
          <span>Contact category</span>
          <select
            id="contactCategory"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {contactCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor="contactNotes">
          <span>Notes</span>
          <textarea
            id="contactNotes"
            name="notes"
            rows="4"
            placeholder="Add role, company, preferred contact time, follow-up notes, or other context"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>

        <label className="checkbox-field" htmlFor="favoriteContact">
          <input
            id="favoriteContact"
            name="favorite"
            type="checkbox"
            checked={formData.favorite}
            onChange={handleChange}
          />
          <span>Add this contact to favorites</span>
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            {editingContact ? "Save changes" : "Save contact"}
          </button>

          {editingContact ? (
            <button
              className="secondary-button"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          ) : null}
        </div>

        <p className="form-note">
          Your contacts stay in this browser unless you export a backup file.
        </p>

        {feedbackMessage ? (
          <p className="form-feedback" role="status">
            {feedbackMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default AddContacts;
