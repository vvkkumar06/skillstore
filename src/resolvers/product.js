import { pubSub } from './../pub-sub.js';

export default {
    SSQuery: {
        products: (_, { status }, { db: { productsData }}) => {
            if(status) {
                return productsData.filter(prod => prod.status ==  status);
            } else {
                return productsData;
            }
        },
        product: (parent, { id }, { db: { productsData }}) =>  productsData.find(prod => prod.id == id)
    },
    SSMutation: {
        updateProduct: (_, { productId, updateProductData }, { db: { productsData }}) => {
            let updatedProduct = {};
            productsData = productsData.map(prod => {
                if (prod.id === productId) {
                    updatedProduct = { ...prod, ...updateProductData };
                    if (updatedProduct.quantityInStock > 0 && prod.quantityInStock === 0) {
                        updatedProduct.status = 'IN_STOCK';
                        pubSub.publish(`PRODUCT_AVAILABLE_${prod.id}`, {
                            productsAvailability: {
                                productId,
                                status: updatedProduct.status
                            }
                        })
                    } else if(updatedProduct.quantityInStock <= 0 && prod.quantityInStock > 0){
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
        category: (parent, _, { db: { categoriesData }}) => categoriesData.find(cat => cat.id == parent.categoryId),
        variants: (parent, _, { db: { variantsData }}) => variantsData.filter(v => v.productId == parent.id),
        discounts: (parent, { db: { discountsData }}) => discountsData.find(dis => dis.id == parent.discountId)
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
    SSSubscription: {
        productsAvailability: {
            subscribe: (_, { productId}) => pubSub.asyncIterator([`PRODUCT_AVAILABLE_${productId}`])
        }
    }
}
