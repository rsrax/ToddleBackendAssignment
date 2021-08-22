require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const { connectDB } = require("./db");
const app = express();

connectDB();

const indexRouter = require("./routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
