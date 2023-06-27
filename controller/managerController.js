const accounts = require("../model/accounts");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");

exports.managerAdd = (req, res) => {

    if (!req.body.username ||        //only line of defense against stuffs
        !req.body.password ||
        !req.body.confirm_password ||
        !req.body.fullname ||
        !req.body.email ||
        !req.body.gender ||
        !req.body.birthday
    ) {
        console.log("Empty params post detected, returning error");
        return res.redirect('/');
    }

    const newAccount = new accounts({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        confirm_password: req.body.confirm_password,
        fullname: req.body.fullname,
        email: req.body.email,
        gender: req.body.gender,
        birthday: req.body.birthday,
        account_class: "Manager",
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
        return res.redirect('/managerInsert');
    }
    

    accounts.findOne({
        username: req.body.login__username
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/managerInsert');
            return;
        }
        if (user) {
            var err = 'user "' + user.username + '" already in use';
            console.log(err);
            req.session.message = err;
            res.redirect('/managerInsert');
            return;
        }
        accounts.findOne({
            email: req.body.login__email
        }).exec(async (err, user) => {
            if (err) {
                console.log(err);
                return res.redirect('/managerInsert');
            }
            if (user) {
                var err = 'user "' + user.email + '" already in use';
                console.log(err);
                req.session.message = err;
                return res.redirect('/managerInsert');
            }
            newAccount.save(
                (err, document) => {
                    if (err) {
                        console.log(err);
                        return res.redirect('/managerInsert');
                    } else {
                        console.log("Data:", document);
                        return res.redirect('/managerView');
                    }
                }
            );
        });
    });
}