const { Joi } = require('express-validation');

const verifyUserConsentPayload = {
    body: Joi.object({
        message: Joi.string().required(),
        publicKey: Joi.string().required().trim(),
        signature: Joi.string().required().trim(),
    }),
};

module.exports = {
    verifyUserConsentPayload,
};
