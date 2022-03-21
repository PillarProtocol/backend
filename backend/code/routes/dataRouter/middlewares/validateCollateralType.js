const httpStatus = require('http-status');

const validateCollateralType = async (req, res, next) => {
    let type = req.params.type.trim();
    if (!type) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Missing type' });
    }
    let cols = process.env.COLLATERAL_NAMES.split(',');
    cols = cols.map((col) => col.trim());
    if (cols.includes(type)) {
        res.locals.type = type;
        next();
    } else if (type.toUpperCase() === 'ALL') {
        res.locals.type = type.toUpperCase();
        next();
    } else {
        return res.status(httpStatus.BAD_REQUEST).json({ message: `Not a valid type of collateral` });
    }
};

module.exports = validateCollateralType;
