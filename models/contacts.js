const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");

const contactsPath = path.resolve(__dirname, "./contacts.json");

const listContacts = async () => {
	try {
		const data = await fs.readFile(contactsPath);
		const contacts = JSON.parse(data);
		return contacts;
	} catch (error) {
		console.log("Error reading file:", error);
		return [];
	}
};

const getContactById = async (contactId) => {
	try {
		const contacts = await listContacts();
		const contact = contacts.find((contact) => (contact.id = contactId));
		return contact;
	} catch (error) {
		console.log(`Could not find a contact with id ${contactId}`);
	}
};

const removeContact = async (contactId) => {
	try {
		const contacts = await listContacts();
		const findContact = contacts.find((contact) => (contact.id = contactId));
		if (!findContact) {
			return null;
		} else {
			const contactIndex = contacts.filter(
				(contact) => contact.id !== contactId
			);
			await fs.writeFile(contactsPath, JSON.stringify(contactIndex));
			return contactIndex;
		}
	} catch (error) {
		console.log(`Could not delete the contact with ID:${contactId}`, error);
	}
};

const addContact = async (body) => {
	try {
		const contacts = await listContacts();
		const newContact = { ...body, id: nanoid() };
		contacts.push(newContact);
		await fs.writeFile(contactsPath, JSON.stringify(contacts));
		return newContact;
	} catch (error) {
		console.log("Error adding contact:", error);
	}
};

const updateContact = async (contactId, body) => {
	try {
		const contacts = await listContacts();
		const updatedContacts = contacts.map((contact) => {
			if (contact.id === contactId) {
				return { ...contact, ...body };
			}
			return contact;
		});

		const updatedContact = updatedContacts.find(({ id }) => id === contactId);

		if (!updatedContact) {
			return null;
		}

		await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
		return updatedContact;
	} catch (error) {
		console.log(`Error updating the contact with ID:${contactId}`, error);
	}
};

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
