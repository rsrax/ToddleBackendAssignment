const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// There are two types of users in the system
// Tutor
// Student
// Assignments are the work assigned to students by the tutor.
// Assignment can only be created, updated and deleted by the tutor

const TutorSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	},
});

module.exports = mongoose.model("Tutor", TutorSchema);
