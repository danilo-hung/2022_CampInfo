const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}

module.exports.createNewUser = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(e)
            req.flash("success", `Hello ${username}. Welcome to Yelp Camp!! (已註冊成功!)`);
            res.redirect("/campgrounds");
        })
    } catch (e) {
        req.flash("alert", e.message)
        res.redirect("/register")
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    const { username } = req.body;
    req.flash("success", `Hi, ${username} welcome back! (已登入)`);
    const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    if (redirectUrl) {
        return res.redirect(redirectUrl)
    }
    res.redirect("/campgrounds")
}

module.exports.logout = (req, res, next) => {
    req.logout(function (e) {
        if (e) { return next(e); }
        req.flash("success", "Logged out, Bye bye (已登出)");
        res.redirect("/campgrounds")
    })
}