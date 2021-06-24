const CONFIG = require('config');
const Constants = require('../Constants');


function handleError(errorThrown) {
    let error = errorThrown;
    const stack = error && error.stack || '';
    let msg = '';
    if (Object.prototype.toString.call(error) !== '[object Object]' && error instanceof Error) {
        msg = error && error.msg || error && error.toString() || 'Error Thrown';
    } else if (Object.prototype.toString.call(error) === '[object Object]') {
        msg = error.msg || JSON.stringify(error);
    } else {
        msg = 'Internal Server Error';
    }
    error = {success: false, msg, code: error && parseInt(error.code, 10)};
    if (CONFIG.envType && CONFIG.envType !== 'production') {
        error.stack = stack;
    }
    try {
        console.logger.error(error);
    } catch (err) {
        console.logger.error('error in logging');
    }
    let errorCode = Constants.HTTP_ERRORS.INTERNAL_SERVER_ERROR.code;
    if (error.code && error.code >= 100 && error.code < 600) {
        errorCode = error.code;
    } else {
        error.code = errorCode;
    }
    return {errorCode, error, stack};
}

function handleStreamError(res, e) {
    const {error} = handleError(e);
    let errorMsg = Constants.HTTP_ERRORS.INTERNAL_SERVER_ERROR.msg;
    try {
        errorMsg = JSON.stringify(error);
    } catch (err) {
        console.log('Error in handle stream error', err);
    }
    return res.end(errorMsg);
}

function handleResult(result, res) {
    if (result && result.streamable && result.stream) {
        if (result.headers) {
            res.writeHead(200, result.headers);
        }

        result
            .stream
            .on('error', handleStreamError.bind(this, res))
            .pipe(res)
            .on('error', handleStreamError.bind(this, res));
    } else if (result && result.render) {
        const name = result.pageName;
        const {data} = result;
        res.render(name, {data});
    } else if (result && result.redirect) {
        res.redirect(301, result.url);
    } else if (result && result.pdf) {
        res.download(result.data);
    } else {
        res.send(result);
    }
}

function handleCatchError(error, res, url, params) {
    const {error: err, errorCode, stack} = handleError(error);
    if (url && params && stack && errorCode > Constants.HTTP_ERRORS.BAD_REQUEST.code) {
        // we can add notification service here
    }
    res.status(errorCode).send(err);
}

/**
 * Gets params from request Object.
 * @param {object} req
 * @param {object} req.params
 * @param {object} [req.body]
 * @param {object} req.headers
 * @param {object} req.query
 * @param {object} [req.middlewareStorage]
 * @param {string} req.url
 * @param {string} req.method
 * @param {array} req.files
 */
function getParams(req) {
    let params = {};
    if (req.method.toLowerCase() === 'get') {
        ({params} = req);
    }
    if (['put', 'post'].includes(req.method.toLowerCase())) {
        ({params} = req);
        params.post = req.body;
    }
    params.headers = req.headers;
    params.query = req.query;
    params.middlewareStorage = req.middlewareStorage;
    params.files = req.files;
    params.file = req.file;
    params.authData = req.authData || {};
    return params;
}

function callAPI(req, res, apiMethod, logParams = true) {
    const params = getParams(req);
    if (logParams) {
        console.log(`params for url ${req.url}: ${JSON.stringify(params)}`);
    }
    apiMethod(params)
        .then((result) => {
            handleResult.call(this, result, res);
        })
        .catch((error) => {
            handleCatchError(error, res, req.url, params);
        });
}

function streamData(req, res, asyncData) {
    let asyncDataPromise;
    if (!asyncData.then) {
        asyncDataPromise = new Promise(resolve => resolve(asyncData));
    } else {
        asyncDataPromise = asyncData;
    }

    asyncDataPromise
        .then((result) => {
            handleResult.call(this, result, res);
        })
        .catch((error) => {
            handleCatchError(error, res);
        });
}

exports.callAPI = callAPI;
exports.streamData = streamData;
exports.getParams = getParams;
exports.handleError = handleError;
