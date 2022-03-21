const httpStatus = require('http-status');
const { collateralToAddressMap, getContractSubState, stakingContract } = require('../../../zil_lib');

const controller = async (req, res, next) => {
    let address = res.locals.address;
    let contractAddress = stakingContract();
    let data = await getContractSubState(contractAddress, 'userShares', [address]);

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

// field userShares: Map ByStr20 Uint128 = Emp ByStr20 Uint128
// field userSharesPendingToBeWithdrawn: Map ByStr20 Uint128 = Emp ByStr20 Uint128
