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
            //set random price between 30.00~39.99
            const price = Math.round((Math.random() * 30 + 10) * 100) / 100;
            //get random photo from a collection on unsplash web
            const imgUrl= 'http://source.unsplash.com/collection/162213';
            const c = new Campground({
                title: `${pickRand(descriptors)} ${pickRand(places)}`,
                location: `${cities[randomC].city}, ${cities[randomC].state}`,
                image: imgUrl,
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis, totam blanditiis, cupiditate quam quaerat magni laboriosam sed accusamus error natus eligendi iusto a ipsa! Deserunt sit ab praesentium ratione illum.',
                price,
                //above line = price : price
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