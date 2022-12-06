if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// require('dotenv').config();
// console.log(process.env.MAPBOX_TOKEN);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
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
const User = require("./models/user");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
//connect Mongoose
const dbUrl = process.env.DB_URL
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongoose connect to MongoDB : SUCCESS')
    })
    .catch((e) => {
        console.log('Mongoose connect ot MongoDB : ERROR');
        console.log(e)
    })

const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//set style css js (Bootstrap)
//path.join('__dirname','public') = (__dirname + '/public')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
//use fake POST request
app.use(methodOverride('_method'));
app.use(mongoSanitize());
//use session

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: "notAGoodSecrete",
    touchAfter:24 * 60 * 60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: "notAGoodSecrete",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnlly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
//use flash
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
}))

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com",
//     "https://*.tiles.mapbox.com",
//     "https://events.mapbox.com",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

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

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);
app.use("/", userRouter);

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