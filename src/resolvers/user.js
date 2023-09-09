import { GraphQLError, GraphQLScalarType } from "graphql";
import { ApolloServerErrorCode } from '@apollo/server/errors'

function isValidEmail(email) {
    // Regular expression pattern for a basic email validation
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email);
  }


export default {
    Email: new GraphQLScalarType({
        name: 'Email',
        description: 'Custom scalar for representing email addresses',
        parseValue: (value) => {
            if(isValidEmail(value)) {
                return value.toLowerCase();
            } 
            throw new Error('Invalid Email');
        },
        serialize: (value) => {
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
    SSQuery: {
        users: (_,__, { db: { usersData }}) => usersData,
        user: (_,__, { db: { usersData }}) => usersData.find(user => user.email)
    },
    SSMutation: {
        createUser: (_, { createUserData: { username, email, role } }, { db: { usersData}}) => {
            const id = (Math.random()*10000000).toFixed(0);

            if(username.length <= 6) {
                throw new GraphQLError("Please provide username of atleast 6 characters!", {
                    extensions: {
                        code: ApolloServerErrorCode.BAD_USER_INPUT
                    }
                });
            }

            const newUser = {id, username, email, role};
            usersData.push(newUser);
            return newUser;
        }
    }
}
