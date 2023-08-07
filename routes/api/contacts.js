const express = require("express");
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
} = require("../../models/contacts");
const Joi = require("joi");

const router = express.Router();

const contactSchema = Joi.object({
	name: Joi.string().required,
	email: Joi.string().required,
	phone: Joi.string().required,
});

router.get("/", async (req, res, next) => {
	try {
		const contacts = await listContacts();
		res.json({
			status: 200,
			data: {
				result: contacts,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.get("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const getContact = await getContactById(contactId);
		if (!getContact) {
			res.json({
				message: `Not found`,
				status: 404,
			});
		}
		res.json({
			status: 200,
			data: { getContact },
		});
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const contactBody = contactSchema.validate(req.body);
		const { name, email, phone } = contactBody.value;
		if (!name || !email || !phone) {
			res.json({ status: 400, message: "missing required name - field" });
		}
		const body = { name, email, phone };
		const newContact = await addContact(body);
		res.json({
			status: 201,
			data: { newContact },
		});
	} catch (error) {
		next(error);
	}
});

router.delete("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const deleteContact = await removeContact(contactId);
		if (!deleteContact) {
			res.json({
				message: "Not found",
				status: 404,
			});
		}
		res.json({
			message: "contact deleted",
			status: 200,
		});
	} catch (error) {
		next(error);
	}
});

router.put("/:contactId", async (req, res, next) => {
	try {
		const contactBody = contactSchema.validate(req.body);
		const { name, email, phone } = contactBody.value;
		if (!name || !email || !phone) {
			res.json({ status: 400, message: "missing fields" });
		}
		const body = { name, email, phone };
		const { contactId } = req.params;
		const updateOldContact = await updateContact(contactId, body);
		if (!updateOldContact) {
			res.json({ status: 404, message: "Not found" });
		}
		res.json({ status: 200, data: { updateOldContact } });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
