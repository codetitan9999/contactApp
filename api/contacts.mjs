import { getContactsCollection } from "./_lib/mongodb.mjs";
import {
  errorResponse,
  isDuplicateKeyError,
  normalizePhoneValue,
  sanitizeContactInput,
  serializeContact,
  validateContact,
} from "./_lib/contacts.mjs";

const sortByUpdatedAt = { updatedAt: -1 };
const getErrorStatus = (error, fallbackStatus = 500) =>
  error?.statusCode || error?.status || fallbackStatus;

const getAllContacts = async (contactsCollection) => {
  const contactDocuments = await contactsCollection
    .find(
      {},
      {
        projection: {
          _id: 0,
          phoneNormalized: 0,
        },
      }
    )
    .sort(sortByUpdatedAt)
    .toArray();

  return contactDocuments.map((document) => serializeContact(document));
};

export async function GET() {
  try {
    const contactsCollection = await getContactsCollection();
    const contacts = await getAllContacts(contactsCollection);

    return Response.json({ contacts });
  } catch (error) {
    return errorResponse(
      getErrorStatus(error),
      error.message || "Unable to load contacts."
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const contactsCollection = await getContactsCollection();

    if (Array.isArray(body?.contacts)) {
      const existingContacts = await getAllContacts(contactsCollection);
      const existingPhoneNumbers = new Set(
        existingContacts.map((contact) => normalizePhoneValue(contact.mobile))
      );
      const contactsToInsert = [];
      let skippedCount = 0;

      body.contacts.forEach((contactPayload) => {
        const sanitizedContact = sanitizeContactInput(contactPayload);
        const validationMessage = validateContact(sanitizedContact);

        if (
          validationMessage ||
          !sanitizedContact.phoneNormalized ||
          existingPhoneNumbers.has(sanitizedContact.phoneNormalized)
        ) {
          skippedCount += 1;
          return;
        }

        existingPhoneNumbers.add(sanitizedContact.phoneNormalized);
        contactsToInsert.push(sanitizedContact);
      });

      if (contactsToInsert.length) {
        await contactsCollection.insertMany(contactsToInsert, { ordered: false });
      }

      const contacts = await getAllContacts(contactsCollection);

      return Response.json({
        contacts,
        importedCount: contactsToInsert.length,
        skippedCount,
      });
    }

    const nextContact = sanitizeContactInput(body);
    const validationMessage = validateContact(nextContact);

    if (validationMessage) {
      return errorResponse(400, validationMessage);
    }

    await contactsCollection.insertOne(nextContact);

    return Response.json(
      { contact: serializeContact(nextContact) },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return errorResponse(
        409,
        "That mobile number is already saved in your contact list."
      );
    }

    return errorResponse(
      getErrorStatus(error),
      error.message || "Unable to save the contact."
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const contactId = String(body?.id || "").trim();

    if (!contactId) {
      return errorResponse(400, "A contact id is required to update a contact.");
    }

    const contactsCollection = await getContactsCollection();
    const existingContact = await contactsCollection.findOne({ id: contactId });

    if (!existingContact) {
      return errorResponse(404, "The contact you tried to update was not found.");
    }

    const nextContact = sanitizeContactInput({ ...existingContact, ...body }, existingContact);
    const validationMessage = validateContact(nextContact);

    if (validationMessage) {
      return errorResponse(400, validationMessage);
    }

    await contactsCollection.updateOne(
      { id: contactId },
      {
        $set: nextContact,
      }
    );

    return Response.json({ contact: serializeContact(nextContact) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return errorResponse(
        409,
        "That mobile number is already saved in your contact list."
      );
    }

    return errorResponse(
      getErrorStatus(error),
      error.message || "Unable to update the contact."
    );
  }
}

export async function DELETE(request) {
  try {
    const requestUrl = new URL(request.url);
    const contactId = requestUrl.searchParams.get("id");

    if (!contactId) {
      return errorResponse(400, "A contact id is required to remove a contact.");
    }

    const contactsCollection = await getContactsCollection();
    const deleteResult = await contactsCollection.deleteOne({ id: contactId });

    if (!deleteResult.deletedCount) {
      return errorResponse(404, "The contact you tried to delete was not found.");
    }

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(
      getErrorStatus(error),
      error.message || "Unable to remove the contact."
    );
  }
}
