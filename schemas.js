    const BaseJoi = require('joi');
    const sanitizeHtml = require('sanitize-html');
    
    const extension = (joi) => ({
        type: 'string',
        base: joi.string(),
        messages: {
            'string.escapeHTML': '{{#label}} must not include HTML!'
        },
        rules: {
            escapeHTML: {
                validate(value, helpers) {
                    const clean = sanitizeHtml(value, {
                        allowedTags: [],
                        allowedAttributes: {},
                    });
                    if (clean !== value) return helpers.error('string.escapeHTML', { value })
                    return clean;
                }
            }
        }
    });
    
    const Joi = BaseJoi.extend(extension)
    
    // create a Schema (not mongoose schema), to validate data before save it with Mongoose
    // set condition of validation (see joi Doc)
    module.exports.campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required().escapeHTML(),
            price: Joi.number().required().min(0),
            location:Joi.string().required().escapeHTML(),
            // image:Joi.string().required(),
            description:Joi.string().required().escapeHTML(),
            address: Joi.string().required().escapeHTML()
        }).required(),
        deleteImages: Joi.array()
    });

    module.exports.reviewSchema = Joi.object({
        review: Joi.object({
            body:Joi.string().required().escapeHTML(),
            rating:Joi.number().required().min(1).max(5),
        }).required()
    })