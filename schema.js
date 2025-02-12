const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLList, GraphQLFloat } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Employee = require('./models/Employee');

// User Type Definition
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString }
    })
});

// Employee Type Definition
const EmployeeType = new GraphQLObjectType({
    name: 'Employee',
    fields: () => ({
        id: { type: GraphQLID },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLFloat },
        date_of_joining: { type: GraphQLString },
        department: { type: GraphQLString },
        employee_photo: { type: GraphQLString }
    })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        login: {
            type: GraphQLString,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(_, { email, password }) {
                const user = await User.findOne({ email });
                if (!user) throw new Error('User not found');

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) throw new Error('Incorrect password');

                const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", { expiresIn: '1h' });
                return token;
            }
        },
        employees: {
            type: new GraphQLList(EmployeeType),
            async resolve() {
                return await Employee.find();
            }
        },
        employeeById: {
            type: EmployeeType,
            args: { id: { type: GraphQLID } },
            async resolve(_, { id }) {
                return await Employee.findById(id);
            }
        },

        // New Search Employee Query
        searchEmployeeByDesignationOrDepartment: {
            type: new GraphQLList(EmployeeType),
            args: {
                designation: { type: GraphQLString },
                department: { type: GraphQLString }
            },
            async resolve(_, { designation, department }) {
                // Build query object for search
                const query = {};

                // Include designation filter if provided
                if (designation) {
                    query.designation = new RegExp(designation, 'i');  // Case-insensitive search
                }

                // Include department filter if provided
                if (department) {
                    query.department = new RegExp(department, 'i');  // Case-insensitive search
                }

                // If no filters provided, return all employees
                if (!designation && !department) {
                    return await Employee.find();
                }

                // Return employees matching the query
                return await Employee.find(query);
            }
        }
    }
});

// Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        signup: {
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(_, { username, email, password }) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                const newUser = new User({ username, email, password: hashedPassword });
                return await newUser.save();
            }
        },
        addEmployee: {
            type: EmployeeType,
            args: {
                first_name: { type: GraphQLString },
                last_name: { type: GraphQLString },
                email: { type: GraphQLString },
                gender: { type: GraphQLString },
                designation: { type: GraphQLString },
                salary: { type: GraphQLFloat },
                date_of_joining: { type: GraphQLString },
                department: { type: GraphQLString },
                employee_photo: { type: GraphQLString }
            },
            async resolve(_, args) {
                return await new Employee(args).save();
            }
        },

        // Update Employee Mutation
        updateEmployee: {
            type: EmployeeType,
            args: {
                id: { type: GraphQLID },
                first_name: { type: GraphQLString },
                last_name: { type: GraphQLString },
                email: { type: GraphQLString },
                gender: { type: GraphQLString },
                designation: { type: GraphQLString },
                salary: { type: GraphQLFloat },
                date_of_joining: { type: GraphQLString },
                department: { type: GraphQLString },
                employee_photo: { type: GraphQLString }
            },
            async resolve(_, args) {
                const { id, ...updateFields } = args;
                const updatedEmployee = await Employee.findByIdAndUpdate(id, updateFields, { new: true });

                if (!updatedEmployee) {
                    throw new Error('Employee not found');
                }

                return updatedEmployee;
            }
        },

        deleteEmployee: {
            type: EmployeeType,
            args: { id: { type: GraphQLID } },
            async resolve(_, { id }) {
                return await Employee.findByIdAndDelete(id);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
