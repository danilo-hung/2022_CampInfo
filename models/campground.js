const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: {
        type: String,
        require: false
    },
    price: {
        type: Number,
        require: false
    },
    description: {
        type: String,
        require: false
    },
    location: {
        type: String,
        require: false
    }
}) 

module.exports = mongoose.model('campground', campgroundSchema)