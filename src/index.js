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
import { userTypeDefs } from './schemas/user.js';
import { productTypeDefs } from './schemas/product.js';
import { categoryTypeDefs } from './schemas/category.js';
import { userResolvers } from './resolvers/user.js';
import { productResolvers } from './resolvers/product.js';
import { categoryResolvers } from './resolvers/category.js';

import { productsData, categoriesData, usersData, variantsData, discountsData } from './db/index.js';



const app = express();

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs: [userTypeDefs, productTypeDefs, categoryTypeDefs],
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