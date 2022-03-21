const httpStatus = require('http-status');
const { collateralToAddressMap, getContractSubState } = require('../../../zil_lib');

const controller = async (req, res, next) => {
    let type = res.locals.type;
    let address = res.locals.address;
    if (type === 'ALL') {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Collateral must be explicity specified',
        });
    }
    let { contractAddress, factory } = collateralToAddressMap()[type];
    let data = await getContractSubState(contractAddress, 'balances', [address]);

    if (!data) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    let { balances } = data;

    if (!balances[address.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }

    return res.status(httpStatus.OK).json({ value: balances[address.toLowerCase()] });
};

module.exports = controller;
