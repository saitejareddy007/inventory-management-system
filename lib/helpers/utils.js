const Constants = require('../Constants');
let instance;

class Utils {

    constructErrorObj({e}) {
        const errorObject = {
            ...Constants.HTTP_ERRORS.INTERNAL_SERVER_ERROR,
        };
        if (e && e.code) {
            errorObject.code = typeof e.code === 'number' ? e.code : errorObject.code;
            errorObject.msg = e.msg || e.message || e.detail || errorObject.msg;
        }
        return errorObject;
    }

    static getInstance() {
        if (!instance) {
            instance = new Utils();
        }
        return instance;
    }
}

exports.getInstance = Utils.getInstance;
