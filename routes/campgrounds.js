const express = require("express");
const router = express.Router();
//import comgroundSchema
const Campground = require("../models/campground");
//import catchAsync
const catchAsync = require("../utils/catchAsync");
//import ExpressError
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//get campground
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index.ejs', { campgrounds });
}));
//get create new page
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
//post new to DB
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campgrounod Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))
//show page get detail
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        req.session.returnTo = req.originalUrl;
        const campground = await Campground.findById(id).populate({
            path: "reviews",
            populate: {
                path: 'author',
                select: 'username'
            }
        }).populate("author");
        if (!campground) {
            req.flash("error", "Cannot find the campground (找不到該營區)");
            return res.redirect("/campgrounds")
        }
        res.render('campgrounds/show.ejs', { campground })
    }
    catch (e) {
        next(new ExpressError("Campground Isn't Exist", 404))
    }
});
//get edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find the campground (找不到該營區)");
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/edit.ejs', { campground })
}));
//patch edit
router.patch('/:id', validateCampground, isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    // await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    req.flash("success", "update the campground! (營區資訊已更新)");
    res.redirect(`/campgrounds/${id}`)
}));
//Delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("alert", "The campground has been deleted (營區已刪除)");
    res.redirect('/campgrounds')
}));


module.exports = router
