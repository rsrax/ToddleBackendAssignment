const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { graphqlHTTP } = require("express-graphql");
const schema = require("../graphql/schema");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
// posts object array
const posts = [
	{
		username: "bob",
		title: "First post",
	},
	{
		username: "joe",
		title: "Second post",
	},
];

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401);
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

router.get("/", (req, res) => {
	res.send("Hello World!");
});

router.get("/posts", authenticateToken, (req, res) => {
	res.json(posts.filter((post) => post.username === req.user.username));
});

// login route
router.post("/login", (req, res) => {
	// todo authenticate user
	const username = req.body.username;
	const password = req.body.password;
	const user = { username, password };
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
	res.json({ accessToken });
});

router.use(
	"/graphql",
	graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

module.exports = router;
