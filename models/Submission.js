const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// A student can add only one submission for an assignment.
// A submission consists of a remark which will be a text field.
// If a student has added any submission for an assignment, then the
// status of the assignment for that student gets updated to
// SUBMITTED

const submissionSchema = new Schema({
	remark: {
		type: String,
		required: true,
		trim: true,
	},
	student: {
		type: Schema.Types.ObjectId,
		ref: "Student",
		required: true,
	},
});

module.exports = mongoose.model("Submission", submissionSchema);
