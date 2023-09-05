const mongoose = require("mongoose");
const { Schema } = mongoose;

const user = new Schema({
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
	},
	subscription: {
		type: String,
		enum: ["starter", "pro", "business"],
		default: "starter",
	},
	token: {
		type: String,
		default: null,
	},
	avatarURL: {
		type: String,
	},
});

const User = mongoose.model("user", user);

const register = async (credentials) => {
	return User.create(credentials);
};

const login = async (user) => {
	return User.find(user);
};

const logout = async (id, token) => {
	return User.findByIdAndUpdate(id, { token });
};

module.exports = {
	User,
	register,
	login,
	logout,
};
