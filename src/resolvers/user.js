import { GraphQLScalarType } from "graphql";

function isValidEmail(email) {
    // Regular expression pattern for a basic email validation
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email);
  }


export const userResolvers = {
    Email: new GraphQLScalarType({
        name: 'Email',
        description: 'Custom scalar for representing email addresses',
        parseValue: (value) => {
            console.log('parseValue', value)
            if(isValidEmail(value)) {
                return value.toLowerCase();
            } 
            throw new Error('Invalid Email');
        },
        serialize: (value) => {
            console.log('serialize', value)
            if(isValidEmail(value)) {
                return value.toLowerCase();
            } 
            throw new Error('Invalid Email');
        },
        parseLiteral: (ast) => {
            console.log('parseLiteral', value)
            if(ast.kind === Kind.STRING && isValidEmail(ast.value)) {
                return ast.value.toLowerCase()
            }
            throw new Error('Invalid Email');
        }
    }),
    Query: {
        users: (_,__, { db: { usersData }}) => usersData,
        user: (_,__, { db: { usersData }}) => usersData.find(user => user.email)
    },
    Mutation: {
        createUser: (_, { createUserData: { username, email, role } }, { db: { usersData}}) => {
            const id = (Math.random()*10000000).toFixed(0);
            const newUser = {id, username, email, role};
            usersData.push(newUser);
            return newUser;
        }
    }
}
