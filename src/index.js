import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { resolvers, typeDefs } from './app.js';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors';
import bodyParser from 'body-parser';



const app = express();

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const wsServer = new WebSocketServer({
    server: httpServer,
    // path: '/subscriptions'
})

const wsServerCleanup = useServer({ schema }, wsServer);


const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
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

app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
})