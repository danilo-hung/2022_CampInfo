//set mongoose
const mongoose = require('mongoose');
//import comgroundSchema
const Campground = require("../models/campground");
const { cities } = require("./cities")
const { places, descriptors } = require("./fakePlaces")
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Mongoose connect to MongoDB : SUCCESS')
    })
    .catch((e) => {
        console.log('Mongoose connect ot MongoDB : ERROR');
        console.log(e)
    })

const pickRand = (subject) => { return subject[Math.floor(Math.random() * subject.length)] };
const seedDB = async () => {
    try {
        await Campground.deleteMany({});
        for (let i = 0; i < 50; i++) {
            const randomC = Math.floor(Math.random() * cities.length);
            const c = new Campground({
                title: `${pickRand(descriptors)} ${pickRand(places)}`,
                location: `${cities[randomC].city}, ${cities[randomC].state}`
            })
            await c.save();
        }
    }
    catch (e) {
        console.log(e)
    }
}

//exit this app after it runned
seedDB().then(()=>{
    mongoose.connection.close()
})