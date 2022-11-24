//set express
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
//set mongoose
const mongoose = require('mongoose');
//fake POST request
const methodOverride = require('method-override');
//import ExpressError
const ExpressError = require("./utils/ExpressError");
//import campgrounds router
const campgroundsRouter = require("./routes/campgrounds");
//import reviews router
const reviewsRouter = require("./routes/reviews");
//import session
const session = require("express-session");
//import flash for flash msg
const flash = require("connect-flash");
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
app.use(methodOverride('_method'));
//use session
const sessionConfig = {
    secret: "notAGoodSecrete",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnlly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
//use flash
app.use(flash())

//set flash msg middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.deleted = req.flash("deleted");
    res.locals.error = req.flash("error");
    next();
})

//use campgrounds Route
app.use("/campgrounds", campgroundsRouter);
//use reviews Route
app.use("/campgrounds/:id/reviews", reviewsRouter);
//HomePage
app.get('/', (req, res) => {
    res.render('home.ejs')
})

//ERRORS HANDLING
//404 not found
//app.all = for any HTTP verb, * = for any route
app.all("*", (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404))
})
//ERRORS HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    // const { statusCode = 500, message = "OH NO, SOMETHING GO WRONG!!!" } = err
    const { statusCode = 500 } = err
    if (!err.message) err.message = "OH NO, SOMETHING GO WRONG!!!"
    console.dir(err)
    res.status(statusCode).render("error.ejs", { err })
})

app.listen(port, () => { console.log(`serving on port : ${port}`) });