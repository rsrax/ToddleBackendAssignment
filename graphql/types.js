const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
} = require("graphql");

const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const TutorType = new GraphQLObjectType({
	name: "Tutor",
	description: "A tutor",
	fields: () => ({
		id: { type: GraphQLID },
		username: { type: GraphQLString },
		assignments: [ID],
	}),
});

const StudentType = new GraphQLObjectType({
	name: "Student",
	description: "A student",
	fields: () => ({
		id: { type: GraphQLID },
		username: { type: GraphQLString },
	}),
});

const StudentAssignmentType = new GraphQLObjectType({
	name: "StudentAssignment",
	description: "A student's assignment",
	fields: () => ({
		student: {
			type: StudentType,
			resolve: (studentAssignment, args, { verifiedUser }) => {
				// If the user is a tutor, return all students
				if (verifiedUser.isTutor) {
					return Student.findById(studentAssignment.student);
				}
				// Otherwise, return only the student currently logged in
				if (verifiedUser.isStudent) {
					if (verifiedUser._id == studentAssignment.student) {
						return Student.findById(studentAssignment.student);
					}
				}
			},
		},
		status: { type: GraphQLString },
	}),
});

const AssignmentType = new GraphQLObjectType({
	name: "Assignment",
	description: "An assignment",
	fields: () => ({
		id: { type: GraphQLID },
		description: { type: GraphQLString },
		students: {
			type: new GraphQLList(StudentAssignmentType),
			resolve: (assignment, args, { verifiedUser }) => {
				// If the user is a tutor, return all students
				if (verifiedUser.isTutor) {
					return assignment.students;
				}
				// Otherwise, return only the student currently logged in
				if (verifiedUser.isStudent) {
					return assignment.students.filter(
						(student) => student.student == verifiedUser._id
					);
				}
			},
		},
		publishedAt: { type: GraphQLString },
		deadline: { type: GraphQLString },
		status: { type: GraphQLString },
		submissions: {
			type: new GraphQLList(SubmissionType),
			resolve: async (assignment, args, { verifiedUser }) => {
				// If the user is a tutor, return all submissions
				if (verifiedUser.isTutor) {
					return assignment.submissions.map((submission) => {
						return Submission.findById(submission);
					});
				}
				if (verifiedUser.isStudent) {
					// If the user is a student, return only their own submissions
					const allSubmissions = await Submission.find().where({
						_id: { $in: assignment.submissions },
						student: verifiedUser._id,
					});
					return allSubmissions;
				}
			},
		},
	}),
});

// submission for an assignment
const SubmissionType = new GraphQLObjectType({
	name: "Submission",
	description: "A submission",
	fields: () => ({
		id: { type: GraphQLID },
		remark: { type: GraphQLString },
		student: {
			type: StudentType,
			resolve: (studentAssignment) => {
				return Student.findById(studentAssignment.student);
			},
		},
	}),
});

module.exports = { TutorType, StudentType, AssignmentType };
