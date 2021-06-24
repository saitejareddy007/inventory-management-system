const Constants = {
    HTTP_STATUS: {
        SUCCESS: {code: 200, msg: 'ok'},
    },
    HTTP_ERRORS: {
        BAD_REQUEST: {code: 400, msg: 'Invalid Data'},
        UNAUTHORIZED: {code: 401, msg: 'Unauthorized Request'},
        FORBIDDEN: {code: 403, msg: 'Forbidden!! Insufficient permissions to process this request'},
        INTERNAL_SERVER_ERROR: {code: 500, msg: 'Internal Server Error'},
    },
    INVENTORY_PUSH_ACTION_TYPES: ['reserved', 'damaged'],
    INVENTORY_PUSH_ACTION_TYPES_MAPPINGS:{
        reserved: 'reservedQty',
        damaged: 'damagedQty'
    }
};

module.exports = Constants;
