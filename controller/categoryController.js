const express = require("express");
const router = express.Router();
const fs = require("fs");
const appServer = express();
const hbs = require("hbs");
const authMiddleware = require("../middleware/authMiddleware");

////// - Model
const Category = require("../model/categories");


//-------------------------------------<<handle upload file img
// Upload - https://www.npmjs.com/package/multer 
const multer = require('multer');

//Setting storage engine
const storageEngine = multer.diskStorage({
    destination: "public/img/categories",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}--${file.originalname}`);
    },
});

const path = require("path");
const { log } = require("console");
const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can Only Upload Images!!");
    }
};

const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
})
//-------------------------------------handle upload file img>>

//-------------------------------------------
router.get("/categoryView", authMiddleware.hasClass(['Director', 'Manager']), categoryView);
async function categoryView(yeucau, trave) {
    try {
        let CategoryList = await Category.find({});
        console.log(CategoryList);
        trave.render("adminPage/CategoryView", {
            Categories: CategoryList,
            username: yeucau.session.username
        });
    } catch (error) {
        console.log(error);
    }
}

router.get("/categoryInsert", authMiddleware.hasClass(['Director', 'Manager']), categoryInsert);
async function categoryInsert(yeucau, trave) {
    try {
        trave.render("adminPage/CategoryInsert", {
            messageError: yeucau.session.messageError,
            messageSuccess: yeucau.session.messageSuccess,
            username: yeucau.session.username,
        });
    } catch (error) {
        console.log(error);
    }
}

router.post("/categoryInsert", upload.single("image"), authMiddleware.hasClass(['Director', 'Manager']), (request, response, ketiep) => {

    console.log("\n BODY: ", request.body);
    console.log("\n Params: ", request.params);
    console.log("\n Query: ", request.query);
    console.log("\n File: ", request.file);

    //Validate required for some fields
    if (
        !request.body.category_name
    ) {
        request.session.messageError = "Please fill in all the fields";
        request.session.messageSuccess = null; //destroy session 
        return response.redirect("/categoryInsert");
    }

    //Validate image is uploaded
    if (!request.file) {
        request.session.messageError = "Please upload an image";
        request.session.messageSuccess = null; //destroy session
        return response.redirect("/categoryInsert");
    }

    request.body.image = request.file.filename; //gán Imagelink bằng đường link tới ảnh trong document

    //Validate if product name is unique
    Category.findOne({ category_name: request.body.category_name }).exec((error, category) => {

        //error of system
        if (error) {
            console.log(error);
            return response.redirect("/categoryInsert");
        }

        if (category) {
            request.session.messageError = "There can only be one category " + request.body.category_name;
            request.session.messageSuccess = null; //destroy session
            console.log(" *Error for user: There can only be one product " + request.body.category_name);
            return response.redirect("/categoryInsert");
        }


        oneCategory = new Category(request.body);
        oneCategory.save(); //save data into database

        request.session.messageError = null; //destroy session
        request.session.messageSuccess = "Add successful";
        response.redirect('./categoryInsert');

    })

});

//----------------------<<Delete one Category
router.get("/categoryDelete/:id", authMiddleware.hasClass(['Director', 'Manager']), (yeucau, trave) => {

    var deleteId = yeucau.params.id; //take id on link http

    //use to delete item have id like which id on http
    Category.findOneAndRemove({ _id: deleteId }, function (err) {
        if (err) {
            console.log(err);
            return trave.status(500).send();
        }
        return trave.status(200).send();
    });

    trave.redirect('../categoryView');
});
//----------------------Delete one Category>>


// SHOW EDIT USER FORM
router.get('/categoryEdit:id', authMiddleware.hasClass(['Director', 'Manager']), async (yeucau, trave) => {

    console.log("\n BODY: ", yeucau.body);
    console.log("\n Params: ", yeucau.params);
    console.log("\n Query: ", yeucau.query);


    try {
        let CategoryID = await Category.findOne({ _id: yeucau.params.id });
        console.log(CategoryID);
        trave.render("adminPage/categoryEdit", { Categories: CategoryID, username: yeucau.session.username });
    } catch (error) {
        console.log(error);
    }

});

router.post("/categoryUpdate:id", upload.single("image"), authMiddleware.hasClass(['Director', 'Manager']), (yeucau, trave, ketiep) => {


    console.log("\n BODY: ", yeucau.body);
    console.log("\n Params: ", yeucau.params);
    console.log("\n Query: ", yeucau.query);
    console.log("\n File: ", yeucau.file);

    yeucau.body.image = yeucau.file.filename; //gán Imagelink bằng đường link tới ảnh trong documents

    var myquery = { _id: yeucau.params.id };
    var newvalues = { $set: { category_name: yeucau.body.category_name, image: yeucau.body.image } };


    //use to delete item have id like which id on http
    Category.updateOne(myquery, newvalues, function (err) {
        if (err) {
            console.log(err);
            return trave.status(500).send();
        }
        return trave.status(200).send();
    });

    trave.redirect('../categoryView');
});

router.get("/categorySearch?", authMiddleware.hasClass(['Director', 'Manager']), async (yeucau, trave) => {

    console.log("\n BODY: ", yeucau.body);
    console.log("\n Params: ", yeucau.params);
    console.log("\n Query: ", yeucau.query);

    let category_name = yeucau.query.category_name;
    console.log("\n Search : " + category_name); // respond category name in console log to check category name

    try {
        // "{ $regex : category_name }" -- "$regex" that mean search the things relative element is filterd. cateroy_name taken from "let category_name"
        // "find({ category_name:...})" that mean find catetory_name in query 
        let CategoryList = await Category.find({ category_name: { $regex: category_name, '$options': 'i' } });
        console.log(CategoryList);
        trave.render("adminPage/categoryView", { Categories: CategoryList, user: yeucau.session.username });
    } catch (error) {
        console.log(error);
    }
});



//-------------------------------------------
exports.categoryController = router;