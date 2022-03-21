const print = (data) => {
    console.log(JSON.stringify(data, null, 4));
};

const errorDelay = 6000;
const flow = true;

const repeater = (func, delay = 1000) => async () => {
    while (true) {
        try {
            if (flow) {
                await func();
            }
            await induceDelay(delay);
        } catch (ex) {
            console.log(ex);
            await induceDelay(errorDelay);
        }
    }
};

const induceDelay = (ts) => {
    let delay = ts || 3000;
    return new Promise((resolve) => {
        setTimeout(function () {
            resolve();
        }, delay);
    });
};

const generateVaultId = (collateralName, internalId) => {
    // vault id generation may change in future
    // return `${collateralName}-${internalId}`;
    return `${internalId}`;
};

const generateUniqueVaultId = (collateralName, internalId) => {
    return `${collateralName}-${internalId}`;
};

module.exports = {
    print,
    repeater,
    induceDelay,
    errorDelay,
    generateVaultId,
    generateUniqueVaultId,
};
