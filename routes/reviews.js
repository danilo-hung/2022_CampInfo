const express = require("express");
const router = express.Router({ mergeParams: true });
//import catchAsync
const catchAsync = require("../utils/catchAsync");
//import comgroundSchema
const Campground = require("../models/campground");
//import Review Model
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");
//import ExpressError
const ExpressError = require("../utils/ExpressError");


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
};


//create review linked with campground model
router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "create new Review!");
    res.redirect(`/campgrounds/${campground._id}`);
}))
//delete review
router.delete("/:reviewId", catchAsync(async (req, res,) => {
    const { id, reviewId } = req.params;
    //$pull: delete
    // {reviews: reviewId} in specific document, pick campground's reviews matched reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("deleted", "The review has been");
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;