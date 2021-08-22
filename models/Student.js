const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// There are two types of users in the system
// Tutor
// Student
// Assignments are the work assigned to students by the tutor.
// Assignment can only be created, updated and deleted by the tutor
// The assignment consists of description, list of students, published at
// and a deadline date
// Assignment published at is a date-time field at which the assignment
// needs to be published, if the assignment is scheduled for future then
// its status is SCHEDULED else ONGOING.
// A student can add only one submission for an assignment.
// A submission consists of a remark which will be a text field.
// If a student has added any submission for an assignment, then the
// status of the assignment for that student gets updated to
// SUBMITTED

const StudentSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Student", StudentSchema);
