//set mongoose
const mongoose = require('mongoose');
//import comgroundSchema
const Campground = require("../models/campground");
const { twCities } = require("./taiwanCities")
const { places, descriptors } = require("./fakePlaces");

const User = require("../models/user");


const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const geocoder = mbxGeocoding({ accessToken: "pk.eyJ1IjoiZGFuaWxvLTk5IiwiYSI6ImNra3dmcWlqczAwNjQyd2tjbnltOGhrdzMifQ.g8eeztwQbZSYXCWbbUqU3w" });
// const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongoose connect to MongoDB : SUCCESS')
    })
    .catch((e) => {
        console.log('Mongoose connect ot MongoDB : ERROR');
        console.log(e)
    })

const seedUser = async () => {
    try {
        await User.deleteMany({});
        const username = 'danilo';
        const password = 'danilo';
        const email = 'danilo@gmail.com'
        const user = new User({ email, username });
        await User.register(user, password);
    }
    catch (e) {
        console.log(e)
    }
}

const pickRand = (subject) => { return subject[Math.floor(Math.random() * subject.length)] };
const seedDB = async () => {
    try {

        await seedUser();
        const adminUser = await User.findOne({ username: 'danilo' });

        await Campground.deleteMany({});
        for (let i = 0; i < 300; i++) {
            const randomC = Math.floor(Math.random() * twCities.length);
            //set random price between 30.00~39.99
            const price = Math.round((Math.random() * 30 + 10) * 100) / 100;
            const city = twCities[randomC].city;
            const country = twCities[randomC].country;
            const NP =[1, -1];
            const NP1 = NP[Math.floor(Math.random() * 2)];
            const NP2 = NP[Math.floor(Math.random() * 2)]
            // const geoData = await geocoder.forwardGeocode({
            //     query: `${city}, ${country}`,
            //     limit: 1
            // }).send()
            // const geo = geoData.body.features[0].geometry;

            const c = new Campground({
                title: `${pickRand(descriptors)} ${pickRand(places)}`,
                location: `${city}, ${country}`,
                author: adminUser._id,
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis, totam blanditiis, cupiditate quam quaerat magni laboriosam sed accusamus error natus eligendi iusto a ipsa! Deserunt sit ab praesentium ratione illum.',
                price,
                address: "Lorem ipsum dolor sit amet consectetur adipisicing elit",
                geometry: {
                    type:"Point",
                    coordinates:[
                        String(Number(twCities[randomC].lng) + NP1 * (Math.floor(Math.random()*1250)/100000)),
                        String(Number(twCities[randomC].lat) + NP2 * (Math.floor(Math.random()*1250)/100000))

                    ]
                },
                images: [
                    {
                        url: "https://res.cloudinary.com/dg9is6ac7/image/upload/v1669995158/2022YelpCamp/xthxbyd7tg396lojb4co.jpg",
                        filename: "filename1"
                    },
                    {
                        url: "https://res.cloudinary.com/dg9is6ac7/image/upload/v1669995117/2022YelpCamp/fhpx1trwtrbvlfcuwha5.jpg",
                        filename: "filename2"
                    },
                    {
                        url: "https://res.cloudinary.com/dg9is6ac7/image/upload/v1669995117/2022YelpCamp/xnf8ouslrspqnx0pqbfe.jpg",
                        filename: "filename3"
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
seedDB()
.then(() => {
    mongoose.connection.close()
})