// import required stuff from graphql
const { GraphQLObjectType, GraphQLSchema } = require("graphql");

// import queries
const {
	students,
	student,
	assignments,
	getTutorAssignments,
	getStudentAssignments,
	getAssignmentDetails,
} = require("./queries");

// import mutations
const {
	studentRegister,
	studentLogin,
	tutorRegister,
	tutorLogin,
	createAssignment,
	deleteAssignment,
	updateAssignment,
	submitAssignment,
} = require("./mutations");

// define Query type
const QueryType = new GraphQLObjectType({
	name: "QueryType",
	description: "Queries",
	fields: {
		students,
		student,
		assignments,
		getTutorAssignments,
		getStudentAssignments,
		getAssignmentDetails,
	},
});

// define Mutation type
const MutationType = new GraphQLObjectType({
	name: "MutationType",
	description: "Mutations",
	fields: {
		studentRegister,
		studentLogin,
		tutorRegister,
		tutorLogin,
		createAssignment,
		deleteAssignment,
		updateAssignment,
		submitAssignment,
	},
});

module.exports = new GraphQLSchema({
	query: QueryType,
	mutation: MutationType,
});
