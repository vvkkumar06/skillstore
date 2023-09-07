export const userTypeDefs = `#graphql

    scalar Email

    type Query {
        users: [User!]!
        user(email: Email!): User
    }

    type Mutation {
        createUser(createUserData: CreateUserInput!): User
    }


    input CreateUserInput {
        username: String!
        email: Email!
        role: Role = USER
    }

    enum Role {
        USER
        ADMIN
    }

    type User {
        id: ID!
        username: String!
        email: Email!
        role: Role!
    }
`