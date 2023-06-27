const accounts = require("../model/accounts");
const express = require("express");
const fs = require("fs");

exports.hasClass = (user_class) => {
    return async function (req, res, next) {
        if (req.session.username) {
            const username = await accounts.findOne({ username: req.session.username });
            if (!username || !user_class.includes(username.account_class)) {
                req.session.message = "You must be an autorized user to access this!";
                res.redirect('/login');
            }
            next();
        } else {
            req.session.message = "You must be logged in!";
            res.redirect('/login');
        }
    }
}

exports.isLoggedIn = (req, res, next) => {
    if (req.session.username) {
        res.render("userPage/checkout");
        next();
    } else {
        req.session.message = "You must be loggin to view that page!";
        res.redirect('/login');
        next();
    }
}