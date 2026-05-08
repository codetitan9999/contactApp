import { MongoClient } from "mongodb";

const globalClient = globalThis;
const connectionUri = process.env.MONGODB_URI;
const configuredDatabaseName = process.env.MONGODB_DB_NAME;
const configurationErrorMessage =
  "Cloud sync is not configured yet. Contacts will stay available on this device until the database is connected.";

let clientPromise;

if (connectionUri) {
  if (!globalClient.__contactManagerMongoClientPromise) {
    const mongoClient = new MongoClient(connectionUri);
    globalClient.__contactManagerMongoClientPromise = mongoClient.connect();
  }

  clientPromise = globalClient.__contactManagerMongoClientPromise;
}

export async function getContactsCollection() {
  if (!clientPromise) {
    const configurationError = new Error(configurationErrorMessage);

    configurationError.statusCode = 503;
    throw configurationError;
  }

  const client = await clientPromise;
  const database = configuredDatabaseName
    ? client.db(configuredDatabaseName)
    : client.db();
  const contactsCollection = database.collection("contacts");

  await contactsCollection.createIndex({ phoneNormalized: 1 }, { unique: true });
  await contactsCollection.createIndex({ updatedAt: -1 });

  return contactsCollection;
}
