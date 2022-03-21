const httpStatus = require('http-status');
const maxPageLimit = 1000;

const middleware = async (req, res, next) => {
    let page = verifyNumber(req.query.page, 0);
    let pageLimit = verifyNumber(req.query.pageLimit, 100);
    if (pageLimit > maxPageLimit) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: `Page Limit exceeds ${maxPageLimit}`,
        });
    }
    res.locals.page = page;
    res.locals.pageLimit = pageLimit;
    next();
};

module.exports = middleware;

const verifyNumber = (input, def = 0) => {
    if (!input || isNaN(input)) {
        return def;
    } else {
        input = input.trim();
        return parseInt(input);
    }
};
