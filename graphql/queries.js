const { GraphQLList, GraphQLID, GraphQLObjectType } = require("graphql");
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

const getTutorAssignments = {
	type: new GraphQLList(AssignmentType),
	description: "Returns a list of assignments for a tutor",
	resolve(parent, args, { verifiedUser }) {
		if (!verifiedUser.isTutor) {
			throw new Error("You are not a tutor");
		}
		return Assignment.find({ tutor: verifiedUser._id });
	},
};

// get student assignments
const getStudentAssignments = {
	type: new GraphQLList(AssignmentType),
	description: "Returns a list of assignments for a student",
	resolve(parent, args, { verifiedUser }) {
		if (!verifiedUser.isStudent) {
			throw new Error("You are not a student");
		}
		return Assignment.find({
			students: { $elemMatch: { student: verifiedUser._id } },
		});
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
	getTutorAssignments,
	getStudentAssignments,
	getAssignmentDetails,
};
