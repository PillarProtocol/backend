const { updateLatestBlock } = require('./worker1');
const { confirmBlock } = require('./worker2');
const { updatePrice } = require('./worker3');

const { repeater } = require('../helpers');

module.exports = {
    worker1: repeater(updateLatestBlock, 60000),
    worker2: repeater(confirmBlock, 1),
    worker3: repeater(updatePrice, 30000),
};
