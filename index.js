const express = require("express");
const router = express.Router();
const PORT = process.env.PORT || 8080;
const appServer = express();
const fs = require("fs");
const path = require('path');
const mongoose = require("mongoose");
const hbs = require("hbs");
const session = require('express-session');
const bcrypt = require("bcrypt");

//Middleware|=======================================================================

const bodyParser = require("body-parser");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { send } = require("process");
appServer.use(bodyParser.json());

//must be have to get request.body
appServer.use(bodyParser.urlencoded({extended: true}));

//Sessions|==========================================================================
//!SESSION ALWAYS STAYS ON TOP BEFORE OTHER STUFFS, IT IS LIKE THAT NO QUESTION ASKED.
var appSession = {
    secret: 'atnSecret',
    resave: true,
    saveUninitialized: true,
    cookie: {},
}

appServer.use(session(appSession));

//View engine setup|=================================================================

appServer.set("views", path.join(__dirname, "view")); //setting views directory for views.
appServer.set("view engine", "hbs"); //setting view engine as handlebars

//Handlebars(Partials, helper)|==========================================================================

hbs.registerPartials('view/userPage');
hbs.registerPartials('view/adminPage');

// limit an array to a maximum of elements (from the start)
hbs.registerHelper('limit', function (arr, limit) {                
    if (!Array.isArray(arr)) { return []; }                         
    return arr.slice(0, limit);                                     
});

//Config|============================================================================

appServer.use(express.static("public"));

//Connect database|==================================================================

const DB_USERNAME = "minhphat";
const DB_PASSWORD = "060802";
const DB_SERVER = "cluster0.pmi9h7n.mongodb.net";
const DB_NAME = "minhphat";
const uri = `mongodb+srv://` + DB_USERNAME + `:` + DB_PASSWORD + `@` + DB_SERVER + `/` + DB_NAME + `?retryWrites=true&w=majority`;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", _ => {
    console.log("Connected to Database");
    console.log("the web is running at the link http://localhost:"+ PORT );
})

//Middleware|========================================================================

router.use((req, res, next) => {
    console.log("||REQ: ", Date.now(), req.url);
    next();
});

router.use((err, req, res, next) => {
    console.log("ERROR: ", Date.now(), req.url);
    console.log(err);
    res.status(500).send("Uh oh stinky error! No clue where it is from tho !");
});

router.use((req, res, next) => {
    if (req.session.username === undefined && req.session.loggedIn === true) {
        req.session.message = "Your login seems a bit wrong. Please login again"
    }
    next();
});         //this for session along all pages more easily

//Routing|============================================================================
//! routes cannot have spaces in them else they will not be able to run
//User routing|==================================================================

const UserRouter = require("./routes/userRouter").UserRouter;
appServer.use("/", UserRouter);

//Admin routing|==================================================================

const AdminRouter = require("./routes/adminRouter").AdminRouter;
appServer.use("/", AdminRouter);

//Product routing|==================================================================

const ProductRouter = require("./routes/productRouter").ProductRouter;
appServer.use("/", ProductRouter);

//Category routing|==================================================================

const categoryController = require("./controller/categoryController").categoryController;
appServer.use("/", categoryController);

//Add middleware|=====================================================================

appServer.use("/", router);
appServer.use(bodyParser.json());
appServer.use(bodyParser.urlencoded({ extended: true }));

//Controller routers|==============================================================

const AuthRouter = require("./routes/authRouter").authRouter;
appServer.use("/", AuthRouter);

//!Launch|=======================================================

appServer.listen(PORT);
console.log("||Server running at PORT:" + PORT + "||=====================================");

//!Launch|=======================================================
