const httpStatus = require('http-status');
const BN = require('bignumber.js');
const sha256 = require('sha256');
const { getPubKeyFromPrivateKey, sign } = require('@zilliqa-js/crypto');

const { params, prices } = require('../../../models');
const { Binance, lastConfirmedBlock } = require('../../../constants');
const { collateralToAddressMap, getPillarTokenDecimals } = require('../../../zil_lib');

const list = collateralToAddressMap();
const privateKey = process.env.PRICE_SIGNING_KEY;
const eighteen = 18;
const pillarDecimal = getPillarTokenDecimals();

const generatePriceMessage = (col, price, decimals, blockNumber) => {
    let stringMsg = `${col.length}${col}${price.length}${price}${decimals.length}${decimals}${blockNumber.length}${blockNumber}`;
    // console.log({col,price,decimals,blockNumber, stringMsg});
    return stringMsg;
};

const controller = async (req, res) => {
    let { type } = res.locals;
    if (list[type]) {
        let _param = await params.findOne({ param: lastConfirmedBlock });
        let _price = await prices.findOne({ collateral: type, source: Binance });

        let collateralDecimals = list[type].decimals;
        let expDecimals = eighteen - parseInt(collateralDecimals) + pillarDecimal;
        let exp = new BN(10).exponentiatedBy(expDecimals);
        let actualPrice = new BN(_price.value).multipliedBy(exp);

        let decimalRequired = 6;
        let priceRequired = parseInt(actualPrice.dividedBy(new BN(10).exponentiatedBy(decimalRequired)).toNumber());

        let msg = generatePriceMessage('' + type, '' + priceRequired, '' + decimalRequired, '' + _param.value);
        const msgHash = sha256(msg);
        const msgBuffer = Buffer.from(msgHash, 'hex');

        const signature = `0x${sign(msgBuffer, privateKey, getPubKeyFromPrivateKey(privateKey))}`;
        return res.status(httpStatus.OK).json({
            msg,
            signature,
        });
    } else {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Cannot find such collateral',
        });
    }
};

module.exports = controller;
