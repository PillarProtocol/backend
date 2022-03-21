const httpStatus = require('http-status');
const { getPillarToken, getContractSubState } = require('../../../zil_lib');

const controller = async (req, res, next) => {
    let type = res.locals.type;
    if (type === 'ALL') {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Collateral must be explicity specified',
        });
    }
    let { address, vaultFactory } = res.locals;

    let pillarTokenContract = getPillarToken();
    let data = await getContractSubState(pillarTokenContract, 'allowances', [address]);

    if (!data) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    let { allowances } = data;

    if (!allowances[address.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }

    if (!allowances[address.toLowerCase()][vaultFactory.toLowerCase()]) {
        return res.status(httpStatus.OK).json({ value: 0 });
    }
    return res.status(httpStatus.OK).json({
        value: allowances[address.toLowerCase()][vaultFactory.toLowerCase()],
    });
};

module.exports = controller;
