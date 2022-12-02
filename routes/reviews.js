const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews")
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor,validateReviewRating } = require("../middleware")

router.post("/", isLoggedIn, validateReviewRating, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;