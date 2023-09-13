const express = require("express");
const { User } = require("../../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const router = express.Router();
const { auth } = require("../../middleware/auth");
const gravatar = require("gravatar");
const { upload } = require("../../middleware/upload");
const fs = require("fs/promises");
const jimp = require("jimp");

const userSchema = Joi.object({
	password: Joi.string().required(),
	email: Joi.string().required(),
	subscription: Joi.string(),
	token: Joi.string(),
	avatarURL: Joi.string(),
});

router.post("/signup", async (req, res, next) => {
	const validators = userSchema.validate(req.body);
	if (validators.error?.message) {
		return res.status(400).json({ message: validators.error.message });
	}
	const { email, password, subscription } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		return res.status(409).json({
			message: "Email in use",
		});
	}
	const avatarURL = gravatar.url(email);
	try {
		const hashPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			email,
			subscription,
			password: hashPassword,
			avatarURL,
		});
		res.status(201).json({
			message: "Registration successful",
			user: {
				email: newUser.email,
				subscription: newUser.subscription,
				avatarURL,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post("/login", async (req, res, next) => {
	const validators = userSchema.validate(req.body);
	if (validators.error?.message) {
		return res.status(400).json({ message: validators.error.message });
	}
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	const passwordCompare = bcrypt.compare(password, user.password);

	if (!user || !passwordCompare) {
		return res.status(401).json({
			message: "Email or password is wrong",
		});
	}
	try {
		const payload = {
			id: user.id,
			email: user.email,
		};

		const token = jwt.sign(payload, secret, { expiresIn: "1h" });
		await User.findByIdAndUpdate(user._id, { token });
		res.status(200).json({
			token,
			user: {
				email: user.email,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.get("/logout", auth, async (req, res, next) => {
	const { _id } = req.user;
	const user = await User.findByIdAndUpdate(_id, { token: null });
	if (!user) {
		return res.status(401).json({
			status: "Unauthorized",
			code: 401,
			message: "Not authorized",
		});
	}

	res.status(204).json({
		status: "No content",
		code: 204,
		message: "Logged out",
	});
});

router.get("/current", auth, async (req, res, next) => {
	const { email, subscription, _id } = req.user;
	const user = await User.findById(_id);
	if (!user) {
		return res.status(401).json({
			status: "Unauthorized",
			code: 401,
			message: "Not authorized",
		});
	}
	res.status(200).json({
		status: "OK",
		code: 200,
		ResponseBody: {
			email: email,
			id: _id,
			subscription: subscription,
		},
	});
});

router.patch("/:id", async (req, res, next) => {
	const { id } = req.params;
	const { subscription } = req.body;
	try {
		const user = await User.findByIdAndUpdate(
			id,
			{ subscription },
			{ new: true }
		);
		res.json(user);
	} catch (error) {
		next(error);
	}
});

router.patch(
	"/avatars",
	auth,
	upload.single("avatar"),
	async (req, res, next) => {
		const { _id } = req.user;
		const { path: temporaryName, originalName } = req.file;
		try {
			const image = await jimp.read(temporaryName);
			image.cover(250, 250);
			const newName = originalName;
			await fs.rename(temporaryName, `public/avatars/${newName}.jpg`);
			await User.findByIdAndUpdate(_id, {
				avatarURL: `/avatars/${temporaryName}_${newName}.jpg`,
			});
			res.status(200).json({
				message: "Avatar uploaded",
				status: 200,
				data: {
					user: {
						avatarURL: `/avatars/${newName}.jpg`,
					},
				},
			});
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
