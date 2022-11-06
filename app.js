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
//HomePage
app.get('/', (req, res) => {
    res.render('home.ejs')
})
//get campground
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index.ejs', { campgrounds });
});
//get create new page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
//post new to DB
app.post('/campgrounds', async (req, res) => {
    const c = new Campground(req.body.campground);
    await c.save();
    res.redirect(`/campgrounds/${c._id}`)
})
//get detail
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show.ejs', { campground })
});
//get edit
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit.ejs', { campground })
})
//patch edit
app.patch('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators: true, new: true})
    res.redirect(`/campgrounds/${id}`)
})
//Delete
app.delete('/campgrounds/:id', async(req, res)=>{
    const{id} =req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

app.listen(port, () => { console.log(`serving on port : ${port}`) });