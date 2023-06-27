const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    category_name: String,
    image: String,
}, {timestamps: true}); 

module.exports = mongoose.model("Category", CategoriesSchema);
