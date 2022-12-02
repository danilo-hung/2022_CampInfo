if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require("./utils/ExpressError");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user")
//connect Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Mongoose connect to MongoDB : SUCCESS')
    })
    .catch((e) => {
        console.log('Mongoose connect ot MongoDB : ERROR');
        console.log(e)
    })
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//set style css js (Bootstrap)
//path.join('__dirname','public') = (__dirname + '/public')
app.use(express.static(path.join(__dirname, 'public')));
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
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.alert = req.flash("alert");
    res.locals.error = req.flash("error");
    next();
})

app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.get('/', (req, res) => {
    res.render('home.ejs')
})

//ERRORS HANDLING
//404 not found
//app.all = for any HTTP verb, * = for any route
app.all('*', (req, res, next) => {
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