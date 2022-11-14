const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: {
        type: String,
        require: false
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        require: false,
        min: 0
    },
    description: {
        type: String,
        require: false
    },
    location: {
        type: String,
        require: false
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