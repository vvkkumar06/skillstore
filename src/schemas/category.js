export const categoryTypeDefs = `#graphql

    extend type Query {
        categories: [Category!]!
        category(id: ID!): Category
    }


    type Category {
        id: ID!
        name: String!
        products: [Product!]!
    }
`;