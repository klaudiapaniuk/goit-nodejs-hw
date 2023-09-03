const express = require("express");
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
	updateFavorite,
} = require("../../models/contacts");
const Joi = require("joi");

const router = express.Router();

const contactSchema = Joi.object({
	name: Joi.string().required(),
	email: Joi.string().required(),
	phone: Joi.string().required(),
	favorite: Joi.boolean(),
});

router.get("/", async (req, res, next) => {
	const { User } = require("../models/user");
	const { _id } = req.user;
	const user = await User.findById(_id);
	const payload = {
		id: user.id,
		email: user.email,
	};
	if (!payload) {
		return res.status(401).json({
			status: "Unauthorized",
			code: 401,
			message: "Log in to get contacts",
		});
	}
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
		if (contactBody.error?.message) {
			res.status(400).json({ message: contactBody.error.message });
		}
		const newContact = await addContact(req.body);
		res.status(201).json({ data: { newContact } });
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
			message: "Contact deleted",
			status: 200,
		});
	} catch (error) {
		next(error);
	}
});

router.put("/:contactId", async (req, res, next) => {
	try {
		const contactBody = contactSchema.validate(req.body);
		if (contactBody.error?.message) {
			res.status(400).json({ message: contactBody.error.message });
		}
		const { contactId } = req.params;
		const updateOldContact = await updateContact(contactId, req.body);
		if (!updateOldContact) {
			res.status(404).json({ message: "Not found" });
		}
		res.status(200).json({ data: { updateOldContact } });
	} catch (error) {
		next(error);
	}
});

router.patch("/:contactId/favorite", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const { favorite } = req.body;
		const setFavorite = await updateFavorite(contactId, favorite);
		if (favorite === undefined || null) {
			res.json({ status: 400, message: "missing field favorite" });
		}
		res.json({ status: 200, data: { setFavorite } });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
