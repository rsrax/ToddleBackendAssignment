const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const AssignmentSchema = new Schema({
	description: {
		type: String,
		required: true,
	},
	students: [
		{
			student: {
				type: Schema.Types.ObjectId,
				ref: "Student",
			},
			status: {
				type: String,
				enum: ["SUBMITTED", "NOT_SUBMITTED"],
				default: "NOT_SUBMITTED",
			},
		},
	],
	publishedAt: {
		type: Date,
		required: true,
	},
	deadline: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ["SCHEDULED", "ONGOING"],
		default: "SCHEDULED",
	},
	submissions: [
		{
			type: Schema.Types.ObjectId,
			ref: "Submission",
		},
	],
	tutor: {
		type: Schema.Types.ObjectId,
		ref: "Tutor",
	},
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
