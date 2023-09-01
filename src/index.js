import { ApolloServer } from '@apollo/server';
import { startStandaloneServer} from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { productsData } from './db/products.js';
import { categoriesData } from './db/category.js'

const typeDefs = gql(readFileSync('./schema.gql', {
    encoding: 'utf-8'
}))

const resolvers = {
    Query: {
        products: () => productsData,
        categories: () => categoriesData
    },
    Category: {
        products: (parent) => productsData.filter(p => p.categoryId == parent.id)
    }
}


const server = new ApolloServer({
    typeDefs, resolvers
})

const {url} = await startStandaloneServer(server, {
    listen: {
        port: 8080
    }
});

console.log(`Server is running at ${url}`);