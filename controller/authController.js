const bcrypt = require("bcrypt");
const accounts = require("../model/accounts");
const express = require("express");
const router = express.Router();
const fs = require("fs");

exports.newAccount = (req, res) => {

    req.session.message = 'empty';

    if (!req.body.login__username ||        //only line of defense against stuffs
        !req.body.password ||
        !req.body.confirm_password ||
        !req.body.login__fullname ||
        !req.body.login__email ||
        !req.body.gender ||
        !req.body.login__birthday
    ) {
        console.log("Empty params post detected, returning error");
        return res.redirect('/');
    }

    const newAccount = new accounts({
        username: req.body.login__username,
        password: bcrypt.hashSync(req.body.password, 10),
        confirm_password: req.body.confirm_password,
        fullname: req.body.login__fullname,
        email: req.body.login__email,
        gender: req.body.gender,
        birthday: req.body.login__birthday
    });

    console.log("Hashed password:" + newAccount.password);

    //validate email type, i.e. 'a@b.c' instead of 'ab.c' or 'a@b .c'
    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    //email validation check
    if (!validateEmail(newAccount.email)) {
        var errorMsg = 'email "' + newAccount.email + '" is not in the correct format.';
        console.log(errorMsg);
        req.session.message = errorMsg + " i.e: demo@mail.net";
        return res.redirect('/signup');
    }
    

    accounts.findOne({
        username: req.body.login__username
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/signup');
            return;
        }
        if (user) {
            var err = 'user "' + user.username + '" already in use';
            console.log(err);
            req.session.message = err;
            res.redirect('/signup');
            return;
        }
        accounts.findOne({
            email: req.body.login__email
        }).exec(async (err, user) => {
            if (err) {
                console.log(err);
                return res.redirect('/signup');
            }
            if (user) {
                var err = 'user "' + user.email + '" already in use';
                console.log(err);
                req.session.message = err;
                return res.redirect('/signup');
            }
            newAccount.save(
                (err, document) => {
                    if (err) {
                        console.log(err);
                        return res.redirect('/signup');
                    } else {
                        console.log("Data:", document);
                        req.session.message = undefined;
                        req.session.username = newAccount.username; //*signin user and return to homepage
                        req.session.class = "User";
                        console.log("Saved password:" + newAccount.password);
                        return res.redirect('/');
                    }
                }
            );
        });
    });
}

//login bits
exports.accountAuth = async (req, res) => {

    req.session.message = 'empty';

    console.log(req.body.username);

    accounts.findOne({
        username: req.body.username
    }).exec((err, user) => {

        if (err) {
            console.log(err);
            return res.redirect('/login');
        }

        if (!user) {
            errorMsg = 'username ' + req.body.username + ' not found !';
            console.log(errorMsg);
            req.session.message = errorMsg;
            return res.redirect('/login');
        }

        if (user) {
            console.log('username ' + user.username + ' found, checking password..');
        }

        if ( !bcrypt.compareSync(req.body.password, user.password) && user.password !== req.body.password) {
            errorMsg = 'password "' + req.body.password + '" for user ' + user.username + ' does not match !';
            console.log(errorMsg);
            req.session.message = errorMsg;
            res.redirect('/login');
        }

        if (bcrypt.compareSync(req.body.password, user.password) || user.password === req.body.password) {
            console.log('user ' + user.username + ' logged in successfully');

            req.session.message = undefined;
            req.session.username = user.username;
            res.locals.username = req.session.username;
            req.session.loggedIn = true;
            req.session.class = user.account_class;

            if (req.session.class === "User") {
                return res.redirect('/');
            } else if (req.session.class === "Director"
                || req.session.class === "Manager") {
                return res.redirect('/dashboard');
            }
        }
    });
}