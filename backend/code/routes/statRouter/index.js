const express = require('express');
const router = express.Router();

const { param, welcome, priceMsg, collective } = require('./controllers');
const { validateCollateralType } = require('./middlewares');

router.get('/', welcome);
router.get('/runtime', param);
router.get('/priceMsg/:type', validateCollateralType, priceMsg);
router.get('/collective', collective);

module.exports = router;
