    const Joi = require("joi");
    
    // create a Schema (not mongoose schema), to validate data before save it with Mongoose
    // set condition of validation (see joi Doc)
    module.exports.campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            location:Joi.string().required(),
            // image:Joi.string().required(),
            description:Joi.string().required(),
        }).required(),
        deleteImages: Joi.array()
    });

    module.exports.reviewSchema = Joi.object({
        review: Joi.object({
            body:Joi.string().required(),
            rating:Joi.number().required().min(1).max(5),
        }).required()
    })