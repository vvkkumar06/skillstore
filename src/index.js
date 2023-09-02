import { ApolloServer } from '@apollo/server';
import { startStandaloneServer} from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { productsData } from './db/products.js';
import { categoriesData } from './db/categories.js';
import { variantsData } from './db/variants.js';
import { discountsData } from './db/discounts.js';

const typeDefs = gql(readFileSync('./schema.gql', {
    encoding: 'utf-8'
}))

const resolvers = {
    Query: {
        products: (_, { status }) => { 
            if(status)  {
                return productsData.filter(prod => prod.status === status)
            } else {
                return productsData;
            }
        },
        categories: () => categoriesData,
        product: (parent, { id }) =>  productsData.find(prod => prod.id == id),
        category: (parent, { id }) =>  categoriesData.find(cat => cat.id == id)
    },
    Product: {
        category: (parent) => categoriesData.find(cat => cat.id == parent.categoryId),
        variants: (parent) => variantsData.filter(v => v.productId == parent.id),
        discount: (parent) =>  discountsData.find(dis => dis.id == parent.discountId)
    },
    Category: {
        products: (parent) => productsData.filter(prod => prod.categoryId == parent.id)
    },
    ProductVariant: {
        __resolveType: (variant) => {
            if(variant.size) {
                return 'SizeVariant';
            } else {
                return 'ColorVariant';
            }
        }
    },
    ProductDiscount: {
        __resolveType: (discount) => {
            if(discount.amount) {
                return 'FixedAmountDiscount';
            } else if(discount.percentage) {
                return 'PercentageDiscount';
            } else {
                return 'BOGODiscount';
            }
        }
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