
export default {
    SSQuery: {
        orders: (_, { userId }, { db: { ordersData }}) => ordersData.filter(order => order.userId === userId)
    },
    SSMutation: {
        createOrder: (_, { userId, createOrderData}, { db: { ordersData, variantsData, productsData}} ) =>  {
            const id = (Math.random() * 10000000).toFixed(0);
            const items = [];
            const total = createOrderData.reduce((sum, cartItem) => {
                let selectedProduct;
                if(cartItem.varientId) {
                    selectedProduct = variantsData.find(variant => variant.productId === cartItem.productId)
                } else {
                    selectedProduct = productsData.find(prod => prod.id === cartItem.productId);
                }
                const subTotal = Number((selectedProduct.price * cartItem.quantity).toFixed(2));
                items.push({ ...cartItem, subTotal})
                sum += subTotal;
                return sum;
            }, 0)

            const createdAt = new Date().toISOString();
          
            const newOrder = { id, total, createdAt, userId, items };

            ordersData.push(newOrder);

            return newOrder;
        }
    },
    Order: {
        user: ( parent, __, {db: {usersData}}) =>  usersData.find(user => user.id === parent.userId),
        items: (parent, __) => parent.items 
    },
    OrderedProduct: {
        product: (parent, _, { db: { productsData}}) => productsData.find(prod => prod.id === parent.productId),
        productVariant: (parent, __, {db: { variantsData}}) => variantsData.find(variant => variant.id === parent.variantId)
    }
};