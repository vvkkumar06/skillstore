import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';

const typeDefs = gql(
    readFileSync("./schema.gql", {
        encoding: 'utf-8'
    })
);

const resolvers = {
    Query: {
        greeting: () => 'hello'
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers
})

const { url } = await startStandaloneServer(server, {
    listen: {
        port: 8080
    }
});

console.log(`Server is running at ${url}`);