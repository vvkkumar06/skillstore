import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors';
import bodyParser from 'body-parser';
import { userResolvers } from './resolvers/user.js';
import { productResolvers } from './resolvers/product.js';
import { categoryResolvers } from './resolvers/category.js';

import { readdirSync, readFileSync } from 'fs';

import { productsData, categoriesData, usersData, variantsData, discountsData } from './db/index.js';
import path from 'path';

// step1 loading schema folder files names
const schemaFileNames = readdirSync(path.resolve('src/schemas'), { encoding: 'utf-8'});
// step2 read the content of files

const schemas = schemaFileNames.map(file => readFileSync(path.resolve(`src/schemas/${file}`), { encoding: 'utf-8'}))

const app = express();

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs: schemas,
    resolvers: [userResolvers, productResolvers, categoryResolvers],
});

const wsServer = new WebSocketServer({
    server: httpServer,
    // path: '/subscriptions'
})

const wsServerCleanup = useServer({ schema }, wsServer);


const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await wsServerCleanup.dispose();
                    }
                }
            }
        }
    ]
})

await server.start();

app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server, {
    context: () => (
        {
            db: {
                productsData, categoriesData, usersData, variantsData, discountsData
            }
        }
    )
}));

const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
})