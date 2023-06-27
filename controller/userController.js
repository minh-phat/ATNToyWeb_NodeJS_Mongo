const accounts = require("../model/accounts");
const express = require("express");
const router = express.Router();
const fs = require("fs");

exports.delAccount = async (req, res) => {
    var deleteID = req.params.id;
    var userClass;
    var backURL = req.header('Referer') || '/';
    console.log("Deleting account ID: " + deleteID);
    accounts.findOneAndRemove({ _id: deleteID }, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send();
    });
    req.session.message = 'deleted account successfully !';
    console.log(userClass);
    return res.redirect(backURL);
}