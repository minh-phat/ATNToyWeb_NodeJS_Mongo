const products = require("./products");

let cart = null;


module.exports = class Cart {

    constructor(productID, quantity, name, image, price, total, ) {
        this.productID = productID;
        this.quantity = quantity;
        this.name = name;
        this.image = image;
        this.price = price;
        this.total = total;
    }

    static save(product) {
        // Cart.foreach( cart.products => {
        //     console.log("122");
        // });

        // let getCart = await Cart.getCart({});


        if (cart === null) {
            cart = { products: [], totalPrice: 0 };
        }

        //updates quantity if found matching productID and color
        if (cart.products.find(products => products.productID === product.productID)) {
            console.log("Duplicate product found: " + product.productID + ", updating count");
            cart.products.find(products => products.productID === product.productID).quantity = 
            (+cart.products.find(products => products.productID === product.productID).quantity) + (+product.quantity);    //looks like a mess lol
        } else {
            cart.products.push(product);
        }
        cart.totalPrice = Number(cart.totalPrice) + Number(product.price);
        //const strProduct = JSON.stringify(product);
        //console.log("find Product to add to cart: " + product);

        //JSON.stringify to show object array
        const str = JSON.stringify(cart);
        console.log("Products add cart: " + str);



        // cart.totalPrice += product.price;
    }
    static getCart() {
        return cart;
    }
    static checkout() {

    }
}