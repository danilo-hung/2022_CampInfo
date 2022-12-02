const Review = require("../models/review");
const Campground = require("../models/campground");


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "create new Review!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res,) => {
    const { id, reviewId } = req.params;
    //$pull: delete
    //{reviews: reviewId} in specific document, pick campground's reviews matched reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("alert", "The review has been deleted (留言已刪除)");
    res.redirect(`/campgrounds/${id}`)
}