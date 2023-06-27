const express = require("express");
const router = express.Router();
const fs = require("fs");
const accounts = require("../model/accounts");
const authController = require("../controller/userController");
const managerController = require("../controller/managerController");
const authMiddleware = require("../middleware/authMiddleware");
const { GeoReplyWith } = require("redis");

//Setting routes in module|================================================

router.get("/formImplement", authMiddleware.hasClass(['Director', 'Manager']), (req, res) => {
    res.render("adminPage/formImplement", { username: req.session.username });
});

router.get("/table", authMiddleware.hasClass(['Director', 'Manager']), (req, res) => {
    res.render("adminPage/table", { username: req.session.username })   //check login class
});

router.get("/accountDelete/:id", authMiddleware.hasClass(['Director', 'Manager']), authController.delAccount);

router.post("/managerAdd", authMiddleware.hasClass('Director'), managerController.managerAdd);

router.get("/dashboard", authMiddleware.hasClass(['Director', 'Manager']), (req, res) => {
    req.session.username ? res.render("adminPage/dashboard", { username: req.session.username }) : res.redirect("/login")
});

router.get("/userView", authMiddleware.hasClass(['Director', 'Manager']), async (req, res) => {
    userList = await accounts.find({ account_class: 'User' });
    res.render("adminPage/userView", req.session.message ? { User: userList, message: req.session.message, username: req.session.username } : { User: userList, username: req.session.username });
    req.session.message = null;
});

router.get("/managerSearch?", authMiddleware.hasClass(['Director', 'Manager']), async (yeucau, trave) => {

    console.log("\n BODY: ", yeucau.body);
    console.log("\n Params: ", yeucau.params);
    console.log("\n Query: ", yeucau.query);

    let fullname = yeucau.query.fullname;
    console.log("\n Search : " + fullname); // respond category name in console log to check category name

    try {
        // "{ $regex : fullname }" -- "$regex" that mean search the things relative element is filterd. cateroy_name taken from "let fullname"
        // "find({ fullname:...})" that mean find catetory_name in query 
        let managerList = await accounts.find({ fullname: { $regex: fullname, '$options': 'i' }, account_class: 'Manager' });
        console.log(managerList);
        trave.render("adminPage/managerView", { User: managerList, username: yeucau.session.managername });
    } catch (error) {
        console.log(error);
    }
});

router.get("/userSearch?", authMiddleware.hasClass(['Director', 'Manager']), async (yeucau, trave) => {

    console.log("\n BODY: ", yeucau.body);
    console.log("\n Params: ", yeucau.params);
    console.log("\n Query: ", yeucau.query);

    let fullname = yeucau.query.fullname;
    console.log("\n Search : " + fullname); // respond category name in console log to check category name

    try {
        // "{ $regex : fullname }" -- "$regex" that mean search the things relative element is filterd. cateroy_name taken from "let fullname"
        // "find({ fullname:...})" that mean find catetory_name in query 
        let userList = await accounts.find({ fullname: { $regex: fullname, '$options': 'i' }, account_class: 'User' });
        console.log(userList);
        trave.render("adminPage/userView", { User: userList, username: yeucau.session.username });
    } catch (error) {
        console.log(error);
    }
});

router.get("/managerView", authMiddleware.hasClass(['Director']), async (req, res) => {
    managerList = await accounts.find({ account_class: 'Manager' });
    res.render("adminPage/managerView", req.session.message ? { User: managerList, message: req.session.message, username: req.session.username } : { User: managerList, username: req.session.username });
    req.session.message = null;
});

router.get("/managerInsert", authMiddleware.hasClass(['Director']), (req, res) => {
    res.render("adminPage/managerInsert", { username: req.session.username })   //check login class
});

exports.AdminRouter = router;