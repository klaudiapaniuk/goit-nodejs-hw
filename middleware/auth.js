const passport = require("passport");
const passportJWT = require("passport-jwt");
const { User } = require("../models/user");
require("dotenv").config();
const secret = process.env.SECRET;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
	secretOrKey: secret,
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
	new Strategy(params, function (payload, done) {
		User.findOne({ _id: payload.id })
			.then((user) => {
				if (!user) {
					return done(new Error("User not found"));
				}

				return done(null, user);
			})
			.catch((err) => done(err));
	})
);

const auth = (req, res, next) => {
	const authorization = req.headers.authorization;
	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (!user || err || user.token !== authorization.split(" ")[1]) {
			return res.status(401).json({
				message: "Not authorized",
			});
		}
		req.user = user;
		next();
	})(req, res, next);
};

module.exports = {
	auth,
};
