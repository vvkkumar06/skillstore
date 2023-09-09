export default {
    SSQuery: {
        categories: (_, __, { db: { categoriesData }}) => categoriesData,
        category: (parent, { id }, { db: { categoriesData }}) =>  categoriesData.find(cat => cat.id == id)
    },
    Category: {
        products: (parent, _, { db: { productsData }}) => productsData.filter(prod => prod.categoryId == parent.id)
    }
}
