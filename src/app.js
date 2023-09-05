import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { productsData as products } from './db/products.js';
import { categoriesData } from './db/categories.js';
import { variantsData } from './db/variants.js';
import { discountsData } from './db/discounts.js';
import { usersData } from './db/users.js';
import { GraphQLScalarType, Kind } from 'graphql';
import { pubSub } from './pub-sub.js';

let productsData = products;
export const typeDefs = gql(readFileSync('./schema.gql', {
    encoding: 'utf-8'
}))

function isValidEmail(email) {
    // Regular expression pattern for a basic email validation
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email);
  }


export const resolvers = {
    Email: new GraphQLScalarType({
        name: 'Email',
        description: 'Custom scalar for representing email addresses',
        parseValue: (value) => {
            console.log('parseValue', value)
            if(isValidEmail(value)) {
                return value.toLowerCase();
            } 
            throw new Error('Invalid Email');
        },
        serialize: (value) => {
            console.log('serialize', value)
            if(isValidEmail(value)) {
                return value.toLowerCase();
            } 
            throw new Error('Invalid Email');
        },
        parseLiteral: (ast) => {
            console.log('parseLiteral', value)
            if(ast.kind === Kind.STRING && isValidEmail(ast.value)) {
                return ast.value.toLowerCase()
            }
            throw new Error('Invalid Email');
        }
    }),
    Query: {
        products: (_, { status }) => {
            if(status) {
                return productsData.filter(prod => prod.status ==  status);
            } else {
                return productsData;
            }
        },
        categories: () => categoriesData,
        product: (parent, { id }) =>  productsData.find(prod => prod.id == id),
        category: (parent, { id }) =>  categoriesData.find(cat => cat.id == id),
        users: () => usersData,
        user: () => usersData.find(user => user.email)
    },
    Mutation: {
        createUser: (_, { createUserData: { username, email, role } }) => {
            const id = (Math.random()*10000000).toFixed(0);
            const newUser = {id, username, email, role};
            usersData.push(newUser);
            return newUser;
        },
        updateProduct: (_, { productId, updateProductData }) => {
            let updatedProduct = {};
            productsData = productsData.map(prod => {
                if (prod.id === productId) {
                    updatedProduct = { ...prod, ...updateProductData };
                    if (updatedProduct.quantity > 0 && prod.quantity === 0) {
                        updatedProduct.status = 'IN_STOCK';
                        pubSub.publish(`PRODUCT_AVAILABLE_${prod.id}`, {
                            productsAvailability: {
                                productId,
                                status: updatedProduct.status
                            }
                        })
                    } else if(updatedProduct.quantity <= 0 && prod.quantity > 0){
                        updatedProduct.status = 'OUT_OF_STOCK';
                        pubSub.publish(`PRODUCT_AVAILABLE_${prod.id}`, {
                            productsAvailability: {
                                productId,
                                status: updatedProduct.status
                            }
                        })
                    }
                    return updatedProduct;
                }
                return prod;
            })
            return updatedProduct;
        }
    },
    Product: {
        category: (parent) => categoriesData.find(cat => cat.id == parent.categoryId),
        variants: (parent) => variantsData.filter(v => v.productId == parent.id),
        discounts: (parent) => discountsData.find(dis => dis.id == parent.discountId)
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
    },
    Subscription: {
        productsAvailability: {
            subscribe: (_, { productId}) => pubSub.asyncIterator([`PRODUCT_AVAILABLE_${productId}`])
        }
    }
}
