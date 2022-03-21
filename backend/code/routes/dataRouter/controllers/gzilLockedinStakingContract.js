const httpStatus = require('http-status');
const { getContractSubState, stakingContract } = require('../../../zil_lib');

const controller = async (req, res) => {
    let contractAddress = stakingContract();
    let data = await getContractSubState(contractAddress, 'totalGzilLocked');

    return res.status(httpStatus.OK).json({ value: data.totalGzilLocked });
};

module.exports = controller;
