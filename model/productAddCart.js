const products = [];
const ProductDatabase = require('../model/products');

class Product{


    ProductList =  ProductDatabase.findOne({ _id: productID }); 
    constructor(id) {
        this.id = ProductList.id;
        
        
    }
    save() {
        products.push(this);
    }

    static findById(prodId) {
        return products.filter(p => p._id == prodId);
    }
}

module.exports = Product;