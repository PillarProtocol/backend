const httpStatus = require('http-status');
const { collateralToAddressMap, getContractSubState, gzilToken, stakingContract } = require('../../../zil_lib');

const controller = async (req, res, next) => {
    let address = res.locals.address;
    let contractAddress = gzilToken();
    let sc = stakingContract();

    let data = await getContractSubState(contractAddress, 'allowances', [address]);
    if (!data) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    let { allowances } = data;

    if (!allowances[address.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }

    if (!allowances[address.toLowerCase()][sc.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    return res.status(httpStatus.OK).json({ value: allowances[address.toLowerCase()][sc.toLowerCase()] });
};

module.exports = controller;
