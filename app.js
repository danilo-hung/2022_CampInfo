//set express
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
//set mongoose
const mongoose = require('mongoose');
//fake POST request
const methodOverride = require('method-override');
//import comgroundSchema
const Campground = require("./models/campground");
//import Review Model
const Review = require("./models/review");
//import ExpressError
const ExpressError = require("./utils/ExpressError");
//import catchAsync
const catchAsync = require("./utils/catchAsync");
const { campgroundSchema, reviewSchema } = require("./schemas.js")
//connect Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Mongoose connect to MongoDB : SUCCESS')
    })
    .catch((e) => {
        console.log('Mongoose connect ot MongoDB : ERROR');
        console.log(e)
    })
//import ejs-mate
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
//set ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//set style css js (Bootstrap)
//path.join('__dirname','public') = (__dirname + '/public')
app.use(express.static(path.join(__dirname, 'public')));
//parse post infomation
app.use(express.urlencoded({ extended: true }))
//use fake POST request
app.use(methodOverride('_method'))
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
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}
//HomePage
app.get('/', (req, res) => {
    res.render('home.ejs')
})
//get campground
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index.ejs', { campgrounds });
}));
//get create new page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
//post new to DB
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campgrounod Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
//show page get detail
app.get('/campgrounds/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews");
        res.render('campgrounds/show.ejs', { campground })
    }
    catch (e) {
        next(new ExpressError("Campground Isn't Exist", 404))
    }
});
//get edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit.ejs', { campground })
}));
//patch edit
app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    res.redirect(`/campgrounds/${id}`)
}));
//Delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));
//create review linked with campground model
app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    // res.send("SUBMIT REVIEW TEST")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
//delete review
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res,) => {
    const { id, reviewId } = req.params;
    //$pull: delete
    // {reviews: reviewId} in specific document, pick campground's reviews matched reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

//ERRORS HANDLING
//404 not found
//app.all = for any HTTP verb, * = for any route
app.all("*", (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404))
})

app.use((err, req, res, next) => {
    // const { statusCode = 500, message = "OH NO, SOMETHING GO WRONG!!!" } = err
    const { statusCode = 500 } = err
    if (!err.message) err.message = "OH NO, SOMETHING GO WRONG!!!"
    console.dir(err)
    res.status(statusCode).render("error.ejs", { err })
})

app.listen(port, () => { console.log(`serving on port : ${port}`) });