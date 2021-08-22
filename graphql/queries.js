const {
	GraphQLList,
	GraphQLID,
	GraphQLObjectType,
	GraphQLString,
} = require("graphql");
const { StudentType, AssignmentType } = require("./types");

const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const students = {
	type: new GraphQLList(StudentType),
	description: "Returns a list of all students",
	resolve(parent, args) {
		return Student.find();
	},
};

const student = {
	type: StudentType,
	description: "Returns a single student",
	args: { id: { type: GraphQLID } },
	resolve(parent, args) {
		return Student.findById(args.id);
	},
};

// get assignments
const assignments = {
	type: new GraphQLList(AssignmentType),
	description: "Returns a list of all assignments",
	resolve(parent, args) {
		return Assignment.find();
	},
};

const getTutorAssignmentsFeed = {
	type: new GraphQLList(AssignmentType),
	description: "Returns a list of assignments for a tutor",
	args: {
		publishedAt: { type: GraphQLString },
		status: { type: GraphQLString },
	},
	resolve(parent, args, { verifiedUser }) {
		if (!verifiedUser) {
			throw new Error("You must be logged in to view assignments");
		}
		if (!verifiedUser.isTutor) {
			throw new Error("You are not a tutor");
		}
		const assignments = Assignment.find({ tutor: verifiedUser._id });
		if (args.publishedAt) {
			assignments.where("publishedAt").equals(args.publishedAt);
		}
		if (args.status) {
			assignments.where("status").equals(args.status);
		}
		return assignments;
	},
};

// get student assignments
const getStudentAssignmentsFeed = {
	type: new GraphQLList(AssignmentType),
	description: "Returns a list of assignments for a student",
	args: {
		publishedAt: { type: GraphQLString },
		status: { type: GraphQLString },
		submissionStatus: { type: GraphQLString },
	},
	async resolve(parent, args, { verifiedUser }) {
		if (!verifiedUser) {
			throw new Error("You are not logged in");
		}
		if (!verifiedUser.isStudent) {
			throw new Error("You are not a student");
		}
		let assignments = Assignment.find({
			students: { $elemMatch: { student: verifiedUser._id } },
		});
		if (args.publishedAt) {
			const publishDate = new Date(args.publishedAt);
			assignments.where("publishedAt").equals(publishDate);
		}
		if (args.status) {
			assignments.where("status").equals(args.status);
		}
		// status(Submission status filter): Applicable for student feed
		// only which can have values
		// ALL for all submissions
		// PENDING if deadline has not passed
		// OVERDUE if deadline has passed
		// SUBMITTED if submission has been submitted
		if (args.submissionStatus) {
			if (args.submissionStatus === "ALL") {
				return assignments;
			}
			if (args.submissionStatus === "PENDING") {
				assignments.where("students.status").equals("NOT_SUBMITTED");
			}
			if (args.submissionStatus === "OVERDUE") {
				assignments.where("students.status").equals("NOT_SUBMITTED");
				const today = new Date();
				assignments.where("deadline").lt(today);
			}
			if (args.submissionStatus === "SUBMITTED") {
				assignments.where("students.status").equals("SUBMITTED");
			}
		}
		return assignments;
	},
};

const getAssignmentDetails = {
	type: AssignmentType,
	description: "Returns a single assignment",
	args: { id: { type: GraphQLID } },
	resolve(parent, args, { verifiedUser }) {
		if (!verifiedUser) {
			throw new Error("You are not logged in.");
		}
		return Assignment.findById(args.id);
	},
};

module.exports = {
	students,
	student,
	assignments,
	getTutorAssignmentsFeed,
	getStudentAssignmentsFeed,
	getAssignmentDetails,
};
