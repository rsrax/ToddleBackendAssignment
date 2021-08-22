const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const { createJwtToken } = require("../util/auth");

const { GraphQLString, GraphQLList } = require("graphql");

// student registration
const studentRegister = {
	type: GraphQLString,
	description: "Register a student",
	args: {
		username: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(root, { username, password }) {
		const student = new Student({
			username,
			password,
		});
		await student.save();
		const token = createJwtToken(student);
		return token;
	},
};

// student login
const studentLogin = {
	type: GraphQLString,
	description: "Login a student",
	args: {
		username: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(root, { username, password }) {
		let student = await Student.findOne({ username });
		if (!student) {
			student = new Student({
				username,
				password,
			});
			student = await student.save();
		}
		student = { ...student._doc, isStudent: true };
		const token = createJwtToken(student);
		return token;
	},
};

// tutor registration
const tutorRegister = {
	type: GraphQLString,
	description: "Register a tutor",
	args: {
		username: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(root, { username, password }) {
		const tutor = new Tutor({
			username,
			password,
		});
		await tutor.save();
		const token = createJwtToken(tutor);
		return token;
	},
};

// tutor login
const tutorLogin = {
	type: GraphQLString,
	description: "Login a tutor",
	args: {
		username: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(root, { username, password }) {
		let tutor = await Tutor.findOne({ username });
		if (!tutor) {
			tutor = new Tutor({
				username,
				password,
			});
			await tutor.save();
		}
		tutor = { ...tutor._doc, isTutor: true };
		const token = createJwtToken(tutor);
		return token;
	},
};

// assignment creation
const createAssignment = {
	type: GraphQLString,
	description: "Create an assignment",
	args: {
		description: { type: GraphQLString },
		students: { type: new GraphQLList(GraphQLString) },
		publishedAt: { type: GraphQLString },
		deadline: { type: GraphQLString },
	},
	async resolve(
		root,
		{ description, students, publishedAt, deadline },
		{ verifiedUser }
	) {
		if (!verifiedUser) {
			throw new Error("You are not logged in.");
		}
		if (!verifiedUser.isTutor) {
			throw new Error("You are not a tutor");
		}
		let status = "SCHEDULED";
		// check if publishedAt is a valid date and is it todays date or in the future
		if (publishedAt) {
			const date = new Date(publishedAt).toLocaleDateString();
			if (date.toString() === "Invalid Date") {
				throw new Error("Invalid date");
			}
			if (date < new Date().toLocaleDateString()) {
				throw new Error("Published date must be today or in the future");
			}
			if (date === new Date().toLocaleDateString()) {
				status = "ONGOING";
			}
			if (date > new Date().toLocaleDateString()) {
				status = "SCHEDULED";
			}
		}
		// check if deadline is a valid date and is it after publishedAt
		if (deadline) {
			const date = new Date(deadline).toLocaleDateString();
			if (date.toString() === "Invalid Date") {
				throw new Error("Invalid date");
			}
			if (date <= new Date().toLocaleDateString()) {
				throw new Error("Deadline must be in the future");
			}
			if (date < new Date(publishedAt).toLocaleDateString()) {
				throw new Error("Deadline must be the same as or after published date");
			}
		}
		const assignment = new Assignment({
			description,
			students: students.map((student) => {
				return { student };
			}),
			publishedAt,
			deadline,
			status,
			submissions: [],
			tutor: verifiedUser._id,
		});
		await assignment.save();
		return JSON.stringify(assignment);
	},
};

// assignment deletion
const deleteAssignment = {
	type: GraphQLString,
	description: "Delete an assignment",
	args: {
		id: { type: GraphQLString },
	},
	async resolve(root, { id }, { verifiedUser }) {
		const assignment = await Assignment.findById(id);
		if (!assignment) {
			throw new Error("Assignment not found");
		}
		if (!assignment.tutor.equals(verifiedUser._id)) {
			throw new Error("You are not the tutor of this assignment");
		}
		await assignment.remove();
		return "Assignment deleted";
	},
};

// update assignment
const updateAssignment = {
	type: GraphQLString,
	description: "Update an assignment",
	args: {
		id: { type: GraphQLString },
		description: { type: GraphQLString },
		students: { type: new GraphQLList(GraphQLString) },
		publishedAt: { type: GraphQLString },
		deadline: { type: GraphQLString },
		status: { type: GraphQLString },
	},
	async resolve(
		root,
		{ id, description, students, publishedAt, deadline, status },
		{ verifiedUser }
	) {
		const assignment = await Assignment.findById(id);
		if (!assignment) {
			throw new Error("Assignment not found");
		}
		if (!assignment.tutor.equals(verifiedUser._id)) {
			throw new Error("You are not the tutor of this assignment");
		}
		assignment.description = description ? description : assignment.description;
		assignment.students = students
			? [...assignment.students, ...students]
			: assignment.students;
		assignment.publishedAt = publishedAt ? publishedAt : assignment.publishedAt;
		assignment.deadline = deadline ? deadline : assignment.deadline;
		assignment.status = status ? status : assignment.status;
		await assignment.save();
		return JSON.stringify(assignment);
	},
};

// assignment submission
const submitAssignment = {
	type: GraphQLString,
	description: "Submit an assignment",
	args: {
		id: { type: GraphQLString },
	},
	async resolve(root, { id }, { verifiedUser }) {
		const assignment = await Assignment.findById(id);
		if (!assignment) {
			throw new Error("Assignment not found");
		}
		// assignment not assigned to this user
		if (
			!assignment.students.some((student) => {
				console.log(student);
				return student.student.equals(verifiedUser._id);
			})
		) {
			throw new Error("You are not assigned to this assignment");
		}
		// assignment already submitted
		if (
			assignment.students.some((student) => {
				return (
					student.student.equals(verifiedUser._id) &&
					student.status === "SUBMITTED"
				);
			})
		) {
			throw new Error("You have already submitted this assignment");
		}
		let submission = new Submission({
			student: verifiedUser._id,
			remark: "No remarks yet",
		});
		submission = await submission.save();
		assignment.submissions.push(submission);
		assignment.students.forEach((student) => {
			if (student.student.equals(verifiedUser._id)) {
				student.status = "SUBMITTED";
			}
		});
		await assignment.save();
		return JSON.stringify(submission);
	},
};

module.exports = {
	studentRegister,
	studentLogin,
	tutorRegister,
	tutorLogin,
	createAssignment,
	deleteAssignment,
	updateAssignment,
	submitAssignment,
};
