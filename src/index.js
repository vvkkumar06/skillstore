import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { productsData } from "./db/products-data.js";
import { categoriesData } from "./db/categories-data.js";

const typeDefs = gql(
    readFileSync("./schema.gql", {
        encoding: 'utf-8'
    })
);

const resolvers = {
    Query: {
        greeting: () => 'hello',
        products: () => productsData,
        categories: () => categoriesData 
    },
    Category: {
        products: (parent) => productsData.filter(p => p.categoryId == parent.id)
    },
    Product: {
        category: (parent) => categoriesData.find(cat => cat.id == parent.categoryId)
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