const mainParam = 'NODE_ENV';
if (mainParam in process.env) {
    console.log(`${mainParam} is defined`);
} else {
    console.log(`${mainParam} is not defined`);
    process.exit(1);
}
const devEnvParams = [
    'BLOCKCHAIN_URL',
    'START_BLOCK',
    'CONFIRMATIONS',
    'VAULT_FACTORIES',
    'VAULT_PROXIES',
    'VAULT_STORAGES',
    'VAULT_PARAMS',
    'COLLATERAL_ADDRESSES',
    'COLLATERAL_NAMES',
    'BINANCE_URL',
    'BINANCE_PRICE_SYMBOL',
    'COLLATERAL_DECIMALS',
    'PRICE_SIGNING_KEY',
    'PILLAR_DECIMAL',
    'PILLAR_TOKEN',
    'MONGO_USER',
    'MONGO_PASSWORD',
    'MONGO_URL',
    'MONGO_DB_NAME',
    'PAUSE_BLOCK',
    'GZIL_TOKEN',
    'STAKING_CONTRACT',
    'DELEGATION_CONTRACT',
    'REWARD_CONTRACT',
    'ENABLE_SERVER',
    'SERVER_LOGS',
].filter((element, index, array) => array.indexOf(element) === index);

const prodEnvParams = []; //write seperately latter

if (process.env.NODE_ENV == 'prod') {
    checkParams(prodEnvParams);
} else {
    checkParams(devEnvParams);
}

function checkParams(params) {
    for (let index = 0; index < params.length; index++) {
        const element = params[index];
        //   console.log(`${element}`);
        if (element in process.env) {
            console.log(`${element} is defined in env variables`);
        } else {
            console.log(`${element} is not defined in env variables`);
            process.exit(1);
        }
    }
}
