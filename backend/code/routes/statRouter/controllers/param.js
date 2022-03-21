const httpStatus = require('http-status');
const { params } = require('../../../models');
const { getLatestBlockData } = require('../../../zil_lib');

const controller = async (req, res) => {
    let _params = await params.find({});
    _params = _params.map(({ value, param }) => {
        return { value, param };
    });
    let _blockData = await getLatestBlockData();

    _params.push({
        value: parseInt(_blockData.NumTxBlocks),
        param: 'blocksAtNode',
    });
    return res.status(httpStatus.OK).json(_params);
};

module.exports = controller;
