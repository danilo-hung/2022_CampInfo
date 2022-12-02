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
        for (let i = 0; i < 100; i++) {
            const randomC = Math.floor(Math.random() * cities.length);
            //set random price between 30.00~39.99
            const price = Math.round((Math.random() * 30 + 10) * 100) / 100;
            //get random photo from a collection on unsplash web
            const imgUrl = 'https://images.unsplash.com/photo-1573347885404-729f489816ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80';
            const c = new Campground({
                title: `${pickRand(descriptors)} ${pickRand(places)}`,
                location: `${cities[randomC].city}, ${cities[randomC].state}`,
                author: '63874ea77440bb229c194ca6',
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis, totam blanditiis, cupiditate quam quaerat magni laboriosam sed accusamus error natus eligendi iusto a ipsa! Deserunt sit ab praesentium ratione illum.',
                price,
                images: [
                    {
                        url: 'https://res.cloudinary.com/dg9is6ac7/image/upload/v1669916292/2022YelpCamp/iimdvcaspw5dkstboynv.jpg',
                        filename: '2022YelpCamp/iimdvcaspw5dkstboynv',
                    },
                    {
                        url: 'https://res.cloudinary.com/dg9is6ac7/image/upload/v1669916291/2022YelpCamp/z0rcgsubxr7h3ldqc59v.jpg',
                        filename: '2022YelpCamp/z0rcgsubxr7h3ldqc59v',
                    },
                    {
                        url: 'https://res.cloudinary.com/dg9is6ac7/image/upload/v1669916292/2022YelpCamp/kvgemarvruvs0rfy996h.jpg',
                        filename: '2022YelpCamp/kvgemarvruvs0rfy996h',
                    }
                ]
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
seedDB().then(() => {
    mongoose.connection.close()
})