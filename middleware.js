const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("alert", "You Must Be Signed In First!! (請先登入)");
        return res.redirect("/login");
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!req.user || !campground.author.equals(req.user._id)) {
        req.flash("error", "YOU ARE NOT ALLOWED TO DO THAT! (請勿越權操作)");
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash("error", "YOU ARE NOT ALLOWED TO DO THAT! (請勿越權操作)");
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
}

module.exports.validateReviewRating = (req, res, next) => {
    const { id } = req.params
    if (req.body.review.rating < 1) {
        req.flash("alert", "rating must grater than 0");
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//make a Joi campgroundSchema-and-catch-error middleware
module.exports.validateCampground = (req, res, next) => {
    //destructure error from campgroundSchema(req.body)
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        req.session.returnTo = req.originalUrl;
        const msg = error.details.map(el => el.message).join(",");
        req.flash("error", msg);
        const redirectUrl = req.session.returnTo;
        delete req.session.returnTo;
        return res.redirect(redirectUrl);
    } else {
        next()
    }
}