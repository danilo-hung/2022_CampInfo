const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } }

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('crop').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,h_600,w_900');
});

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
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
    address: String,
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
}, opts)

campgroundSchema.virtual("properties.popUpMarkup")
    .get(function () {
        return `
        <strong><a class="text-success" href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p class="text-secondary"><b>Address :</b> ${this.address.substring(0, 30)} ... </p>`
    });
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