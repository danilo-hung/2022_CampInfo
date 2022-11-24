const express = require("express");
const router = express.Router();
//import comgroundSchema
const Campground = require("../models/campground");
//import catchAsync
const catchAsync = require("../utils/catchAsync");
//import ExpressError
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../schemas.js");
//make a Joi campgroundSchema-and-catch-error middleware
const validateCampground = (req, res, next) => {
    //destructure error from campgroundSchema(req.body)
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}


//get campground
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index.ejs', { campgrounds });
}));
//get create new page
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})
//post new to DB
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campgrounod Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))
//show page get detail
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews");
        if(!campground){
            req.flash("error", "Cannot find the campground");
            return res.redirect("/campgrounds")
        }
        res.render('campgrounds/show.ejs', { campground })
    }
    catch (e) {
        next(new ExpressError("Campground Isn't Exist", 404))
    }
});
//get edit
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/edit.ejs', { campground })
}));
//patch edit
router.patch('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    req.flash("success", "update the campground!");
    res.redirect(`/campgrounds/${id}`)
}));
//Delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("deleted", "The campground has been");
    res.redirect('/campgrounds')
}));


module.exports = router
