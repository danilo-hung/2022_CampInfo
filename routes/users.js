const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync")

router.get("/register", (req, res) => {
    res.render("users/register");
})

router.post("/register", catchAsync(async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(e)
            req.flash("success", `Hello ${username}. Welcome to Yelp Camp!!`);
            res.redirect("/campgrounds");
        })
    } catch (e) {
        req.flash("alert", e.message)
        res.redirect("/register")
    }
}))

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), (req, res) => {
    const { username } = req.body;
    req.flash("success", `Hi, ${username} welcome back!`);
    const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    if (redirectUrl) {
        return res.redirect(redirectUrl)
    }
    res.redirect("/campgrounds")
})

router.get("/logout", (req, res, next) => {
    req.logout(function (e) {
        if (e) { return next(e); }
        req.flash("success", "Logged out, Bye bye");
        res.redirect("/campgrounds")
    })
})

module.exports = router;