const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        req.session.returnTo = req.originalUrl;
        const campground = await Campground.findById(id).populate({
            path: "reviews",
            populate: {
                path: 'author',
                select: 'username'
            }
        }).populate("author");
        if (!campground) {
            req.flash("error", "Cannot find the campground (找不到該營區)");
            return res.redirect("/campgrounds")
        }
        res.render('campgrounds/show.ejs', { campground })
    }
    catch (e) {
        next(new ExpressError("Campground Isn't Exist", 404))
    }
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find the campground (找不到該營區)");
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/edit.ejs', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // imgs is an array [...], and to push contents of imgs instead of whole array
    // push {...}, {...}, {...} instead of push [{}, {}, {}]
    // push ...imgs
    campground.images.push(...imgs);
    campground.save();
    if (req.body.deleteImages) {
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        for (let imgs of req.body.deleteImages) {
            await cloudinary.uploader.destroy(imgs)
        }
    }

    req.flash("success", "update the campground! (營區資訊已更新)");
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("alert", "The campground has been deleted (營區已刪除)");
    res.redirect('/campgrounds')
}