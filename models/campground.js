const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            require: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
})

//create mongoose middle to set when a Campround is deleted, its reviews will then deleted
campgroundSchema.post("findOneAndDelete", async function (campground) {
    if (campground.reviews.length) {
        const res = await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})

module.exports = mongoose.model('campground', campgroundSchema)