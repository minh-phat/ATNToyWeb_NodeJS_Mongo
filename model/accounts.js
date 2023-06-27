const { ObjectID } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
    product_id: ObjectID,
    quantity: Number,
    color: String,
    value: Number,
    address: String,
    Date: Date,
});

const AccountsSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String, unique: true },
    birthday: { type: String, required: true },
    gender: { type: String, required: true },
    account_class: { type: String, default: 'User' },
    orders: [OrdersSchema],
});

module.exports = mongoose.model("accounts", AccountsSchema);