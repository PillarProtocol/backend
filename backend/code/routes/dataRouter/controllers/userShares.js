const httpStatus = require('http-status');
const { getContractSubState, stakingContract } = require('../../../zil_lib');

const controller = async (req, res) => {
    let address = res.locals.address;
    let contractAddress = stakingContract();
    let data = await getContractSubState(contractAddress, 'userShares', [address]);

    if (!data) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    let { userShares } = data;

    if (!userShares[address.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }

    return res.status(httpStatus.OK).json({ value: userShares[address.toLowerCase()] });
};

module.exports = controller;
