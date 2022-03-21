const httpStatus = require('http-status');
const { userRewards } = require('../../../models');
const BN = require('bignumber.js');

const controller = async (req, res, next) => {
    let address = res.locals.address.toLowerCase();
    let _userRewards = await userRewards.find({ address, claimed: false }).sort({ epoch: -1 }).populate('tokenDetails').exec();
    _userRewards = _userRewards.map(({ epoch, amount, tokenDetails }) => {
        return {
            epoch,
            amount: new BN(amount).toNumber(),
            token: tokenDetails ? tokenDetails.token : '????',
        };
    });
    return res.status(httpStatus.OK).json(_userRewards);
};

module.exports = controller;

// {
//     "claimed": true,
//     "_id": "612f967460fa7b00288fcfda",
//     "epoch": "1",
//     "address": "0x3221d2f6ac18b04f719c383cdcb583cca8734501",
//     "amount": 1e+16,
//     "__v": 0,
//     "tokenDetails": {
//       "value": 0,
//       "token": "0xfc96828ccfb2eae68d22dcdc60fae2511e5a04b1",
//       "_id": "612f965e60fa7b00288fcfd9",
//       "epoch": "1",
//       "__v": 0
//     }
//   }
