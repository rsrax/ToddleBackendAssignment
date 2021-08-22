const jwt = require("jsonwebtoken");

const createJwtToken = (user) => {
	return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = { createJwtToken };
