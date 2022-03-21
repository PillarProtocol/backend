const httpStatus = require('http-status');
const { schnorr, getAddressFromPublicKey, sha256, getHexAddress } = require('../../../zil_lib');

const { WARNINGCONSENT } = require('../../../constants');

const messageToCheck = WARNINGCONSENT;

const middleware = async (req, res, next) => {
    console.log(req.body);
    let { message, signature, publicKey } = req.body;
    let address = getHexAddress(getAddressFromPublicKey(publicKey));
    if (message !== messageToCheck) {
        return res.status(httpStatus.BAD_REQUEST).json({ info: `Please sign apt message`, message: messageToCheck });
    }

    const hashStr = sha256(message);
    const hashBytes = Buffer.from(hashStr, 'hex');
    const myZilPaySignature = signature;

    const sign = schnorr.toSignature(myZilPaySignature);
    let verify;
    try {
        verify = schnorr.verify(hashBytes, sign, Buffer.from(publicKey, 'hex'));
    } catch (ex) {
        verify = false;
    }

    if (!verify) {
        return res.status(httpStatus.BAD_REQUEST).json({ info: `Invalid Signature or PublicKey` });
    }

    res.locals.verify = verify;
    res.locals.address = address;
    res.locals.message = message;
    res.locals.signature = signature;
    res.locals.publicKey = publicKey;

    next();
};

module.exports = middleware;

// {
//   msgToSign: '4wzil2431871496394',
//   msgHash: '941b036340ca3f2500966e47906acb15e68660cc37494d55feaa0f88bcc97428',
//   msgBuffer: <Buffer 94 1b 03 63 40 ca 3f 25 00 96 6e 47 90 6a cb 15 e6 86 60 cc 37 49 4d 55 fe aa 0f 88 bc c9 74 28>,
//   signature: '6aea17c07e2fb1fb01d7c883d6de77076c65be21c7e3a39f7b453df7aa6813f5c4d904d9d70451c626f4e08dd258b1463968c041d65d11f64cbc76215740aad1'
// }
