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
// import { userResolvers } from './resolvers/user.js';
// import { productResolvers } from './resolvers/product.js';
// import { categoryResolvers } from './resolvers/category.js';
import typeDefs from './typeDefs.js';
import { productsData, categoriesData, usersData, variantsData, discountsData } from './db/index.js';
// import { orderResolvers } from './resolvers/order.js';
import resolvers from './resolvers.js';

const app = express();

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const wsServer = new WebSocketServer({
    server: httpServer,
    // path: '/subscriptions'
})

const wsServerCleanup = useServer({ schema }, wsServer);


const server = new ApolloServer({
    schema,
    includeStacktraceInErrorResponses: false,
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

app.use('/', cors(), bodyParser.json(), expressMiddleware(server, {
    context: () => (
        {
            db: {
                productsData, categoriesData, usersData, variantsData, discountsData,
                ordersData: []
            }
        }
    )
}));

const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})