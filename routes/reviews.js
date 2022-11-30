const express = require("express");
const router = express.Router({ mergeParams: true });
//import catchAsync
const catchAsync = require("../utils/catchAsync");
//import comgroundSchema
const Campground = require("../models/campground");
//import Review Model
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")


//create review linked with campground model
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "create new Review!");
    res.redirect(`/campgrounds/${campground._id}`);
}))
//delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (req, res,) => {
    const { id, reviewId } = req.params;
    //$pull: delete
    // {reviews: reviewId} in specific document, pick campground's reviews matched reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("alert", "The review has been deleted");
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;