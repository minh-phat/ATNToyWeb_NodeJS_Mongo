const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    product_name: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'The toy cannot be free'] },
    image: { type: String, required: true },
    stock: { type: Number, required: true }
}, {timestamps: true});

module.exports = mongoose.model("Product", productSchema);