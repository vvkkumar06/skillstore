export const productTypeDefs = `#graphql

    extend type Query {
        products(status: ProductStatus): [Product!]!
        product(id: ID!): Product
    }

    extend type Mutation {
        updateProduct(productId: ID!, updateProductData: UpdateProductInput!): Product
    }

    input UpdateProductInput {
        name: String
        description: String
        price: Float
        quantity: Int
    }


    enum ProductStatus {
    IN_STOCK
    OUT_OF_STOCK
    BACKORDERED
    }


    interface ProductVariant {
        id: ID!
        variantName: String!
        price: Float!
    }

    type SizeVariant implements ProductVariant {
        id: ID!
        variantName: String!
        price: Float!
        size: String!
    }

    type ColorVariant implements ProductVariant {
        id: ID!
        variantName: String!
        price: Float!
        color: String!
    }

    union ProductDiscount = FixedAmountDiscount | PercentageDiscount | BOGODiscount

    type FixedAmountDiscount {
        id: ID!
        amount: Float!
    }

    type PercentageDiscount {
        id: ID!
        percentage: Float!
    }

    type BOGODiscount {
        id: ID!
        buy: Int!
        get: Int!
    }

    type Product {
        id: ID!
        name: String!
        description: String!
        price: Float!
        category: Category!
        variants: [ProductVariant!]!
        discounts: ProductDiscount
        status: ProductStatus!
        quantity: Int!
    }

    type Subscription {
        productsAvailability(productId: ID!): ProductsAvailability!
    }

    type ProductsAvailability {
    productId: ID!
    status: ProductStatus!
    }

`;