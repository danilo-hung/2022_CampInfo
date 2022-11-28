module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("alert", "You Must Be Signed In First!!");
        return res.redirect("/login");
    }
    next();
}
