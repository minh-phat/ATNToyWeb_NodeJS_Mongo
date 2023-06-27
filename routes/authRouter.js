const express = require("express");
const router = express.Router();
const fs = require("fs");
const controller = require("../controller/authController");

//Auth routes|==================================

router.get("/signup", (req, res) => {
    res.render("signup", req.session.message ? { message: req.session.message } : null);
    req.session.message = undefined;
});

router.get("/login", (req, res) => {
    res.render("login", req.session.message ? { message: req.session.message } : null);
    req.session.message = undefined;
});

router.post("/signup/newAccount", controller.newAccount);   //signup

router.post("/login/accountAuth", controller.accountAuth);  //signin

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

//Export module|========================================

exports.authRouter = router;