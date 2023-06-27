const express = require("express");
const router = express.Router();
const Category = require("../model/categories");
const Product = require("../model/products");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

//Direct to create product page
router.get("/newProduct", authMiddleware.hasClass(['Director', 'Manager']), loadCategories);
async function loadCategories(request, response) {
    try {
        let categoriesList = await Category.find({});
        if (request.session.message) {
            response.render("adminPage/newProduct", { categories: categoriesList, message: request.session.message, username: request.session.username });
        } else {
            response.render("adminPage/newProduct", { categories: categoriesList, username: request.session.username });
        }
        request.session.message = null;
    } catch (error) {
        console.log(error);
    }
}

//Save product to database
//Setting storage engine and save image to server
const storageEngine = multer.diskStorage({
    destination: "public/img/products",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}--${file.originalname}`);
    },
});
const path = require("path");
const products = require("../model/products");
const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Please upload images only");
    }
};
const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
})


router.post("/newProduct", upload.single("image"), authMiddleware.hasClass(['Director', 'Manager']), (request, response, next) => {
    console.log("\n BODY: ", request.body);
    console.log("\n File: ", request.file);

    //Validate required for some fields
    if (
        !request.body.product_name ||
        !request.body.description ||
        !request.body.price ||
        !request.body.stock
    ) {
        request.session.message = "Please fill in all the fields";
        return response.redirect("/newProduct");
    }

    //Validate image is uploaded
    if (!request.file) {
        request.session.message = "Please upload an image";
        return response.redirect("/newProduct");
    }

    //Validate if product name is unique
    Product.findOne({ product_name: request.body.product_name }).exec((error, product) => {
        if (error) {
            console.log(error);
            return response.redirect("/newProduct");
        }
        if (product) {
            request.session.message = "There can only be one product " + request.body.product_name;
            console.log("There can only be one product " + request.body.product_name);
            return response.redirect("/newProduct");
        }

        //If product name is indeed unique then save to database
        request.body.image = request.file.filename; //make image link the filename
        let toy = {
            product_name: request.body.product_name,
            category: request.body.category,
            description: request.body.description,
            price: request.body.price,
            image: request.body.image,
            stock: request.body.stock
        }
        const newToy = new Product(toy)
        newToy.save(function (error, document) {
            if (error) {
                console.error(error)
            }

            if (document) {
                console.log("\nInserted one document: \n" + document)
                request.session.message = "Inserted one product " + document.product_name;
                response.redirect("/viewProducts")
            }
        })
    })
});

//Direct to product view page
router.get("/viewProducts", authMiddleware.hasClass(['Director', 'Manager']), viewProducts);
async function viewProducts(request, response) {
    try {
        let productsList = await Product.find({}).populate('category');
        console.log("Products currently in database are: \n" + productsList);
        if (request.session.messageError) {
            response.render("adminPage/viewProducts", {
                products: productsList,
                messageError: request.session.messageError,
                username: request.session.username
            });
        } else if (request.session.messageSuccess) {
            response.render("adminPage/viewProducts", {
                products: productsList,
                messageSuccess: request.session.messageSuccess,
                username: request.session.username
            });
        } else {
            response.render("adminPage/viewProducts", { products: productsList, username: request.session.username });
        }
        request.session.message = null;
    } catch (error) {
        console.log(error);
    }
}

//Delete product
router.get("/deleteProduct?:id", authMiddleware.hasClass(['Director', 'Manager']), deleteProducts);
async function deleteProducts(request, response) {
    try {
        const document = await Product.findOne({ _id: request.query.id });
        console.log(request.query)
        const deleted = await document.remove(function (error, deleted) {
            if (error) {
                console.log(error);
                return response.redirect("/viewProducts")
            }
            if (deleted) {
                console.log("Deleted one document: \n" + document);
                request.session.message = "Deleted product " + document.product_name;
                return response.redirect("/viewProducts");
            }
        });
        request.session.message = null;
    } catch (error) {
        console.log(error);
    }
}

//Update product
router.get("/updateProduct?:id", authMiddleware.hasClass(['Director', 'Manager']), updateProduct);
async function updateProduct(request, response) {
    try {
        const document = await Product.findOne({ _id: request.query.id });
        const categoriesList = await Category.find({});
        if (request.session.message) {
            response.render("adminPage/updateProduct", {
                categories: categoriesList,
                product: document,
                message: request.session.message,
                username: request.session.username,
            })
            request.sesison.message = null;
        } else {
            response.render("adminPage/updateProduct", {
                categories: categoriesList,
                product: document,
                username: request.session.username,
            })
        }
    } catch (error) {
        console.log(error);
    }
}

//Save updated information to database
router.post("/updateProduct?:id", upload.single("image"), authMiddleware.hasClass(['Director', 'Manager']), (request, response, next) => {
    console.log("\n BODY: ", request.body);
    console.log("\n File: ", request.file);

    //Validate required for some fields
    if (
        !request.body.product_name ||
        !request.body.description ||
        !request.body.price ||
        !request.body.stock
    ) {
        request.session.message = "Please fill in all the fields";
        return response.redirect("/updateProduct?id=" + request.body._id);
    }

    request.body.image = request.file.filename; //make image link the filename

    //If product name is updated then check if it is duplicated or not
    if (request.body.updated) {
        Product.findOne({ product_name: request.body.product_name }).exec((error, product) => {
            if (error) {
                console.log(error);
                return response.redirect("/updateProduct?id=" + request.body._id);
            }
            if (product) {
                request.session.message = "There can only be one product " + request.body.product_name;
                console.log("There can only be one product " + request.body.product_name);
                return response.redirect("/updateProduct?id=" + request.body._id);
            }
        })
    }

    let toy = {
        product_name: request.body.product_name,
        category: request.body.category,
        description: request.body.description,
        price: request.body.price,
        image: request.body.image,
        stock: request.body.stock
    }

    Product.updateOne({ _id: request.body._id }, { $set: toy }, function (error, document) {
        if (error) {
            console.error(error)
        }

        if (document) {
            console.log("Updated " + toy.product_name + "\n" + toy)
            request.session.message = "Updated " + toy.product_name;
            response.redirect("/viewProducts")
        }
    })
});

router.get("/searchProduct?", authMiddleware.hasClass(['Director', 'Manager']), async (request, response) => {
    try {
        if (request.query.search) {
            let productsList = await Product.find({ product_name: { $regex: request.query.search, '$options': 'i' } }).populate('category')
            if (productsList.length > 0) {
                request.session.messageSuccess = "Showing results for " + request.query.search;
                response.render("adminPage/viewProducts", {
                    products: productsList,
                    messageSuccess: request.session.messageSuccess,
                    username: request.session.username,
                });
                request.session.messageError = null;
                request.session.messageSuccess = null;
            } else {
                request.session.messageError = "No results for " + request.query.search;
                response.redirect("/viewProducts");
                request.session.messageError = null;
                request.session.messageSuccess = null;
            }
        } else {
            request.session.messageError = null;
            request.session.messageSuccess = null;
            response.redirect("/viewProducts");
        }
    } catch (error) {
        console.log(error);
    }

});

//!Exporting router module|================================================

exports.ProductRouter = router;