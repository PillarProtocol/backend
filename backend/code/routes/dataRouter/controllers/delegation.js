const httpStatus = require('http-status');
const { getContractSubState, delegationContract } = require('../../../zil_lib');

const controller = async (req, res) => {
    let address = res.locals.address;
    let contractAddress = delegationContract();
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
