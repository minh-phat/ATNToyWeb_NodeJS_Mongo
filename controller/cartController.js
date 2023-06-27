const categories = require('../model/categories');
const Product = require('../model/products');
const Cart = require('../model/carts');

exports.addToCart = async (request, respond, next) => {

    console.log("\n BODY: ", request.body);
    // console.log("\n Params: ", request.params);
    // console.log("\n Query: ", request.query);
    // console.log("\n File: ", request.file);

    const productID = request.body.id;
    const quantity = request.body.quantity;
    const name = request.body.name;
    const image = request.body.image;
    const price = request.body.price;
    const total = price * quantity;

    const addCart = new Cart(productID, quantity, name, image, price, total);
    Cart.save(addCart);

    respond.redirect("/shop");

}

exports.cartView = async (request, respond, next) => {

    try {
        let carts = await Cart.getCart({});

        //JSON.stringify to show object array
        const str = JSON.stringify(carts);
        console.log("Products add cart: " + str);

        respond.render('userPage/cart', { cartList: carts })
    }
    catch (error) {
        console.log(error);
    }

}
exports.checkout = async (request, respond, next) => {

}
