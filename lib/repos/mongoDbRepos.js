const mongoose = require('mongoose');
const {mongoConfig} = require('config');
const Constants = require('../Constants');

const replicaSetString = (mongoConfig.hasReplicaSet ? `/?replicaSet=${mongoConfig.rsName}` : '');
const connection = mongoose.createConnection(`mongodb://${mongoConfig.hosts}${replicaSetString}`, {ignoreUndefined: true});

connection.on('error', (err) => {
    console.log('something is wrong : ', err);
});

connection.on('open', () => {
    console.log('successfully connected to mongodb: ');
});

// Database
const db = connection.useDb(mongoConfig.database);

// Schema
const InventorySchema = mongoose.Schema({}, {strict: false});

// Entity Models
const InventoryModel = db.model('inventory', InventorySchema, 'inventory');

class MedTrailBaseRepo {
    /**
     *
     * @param model
     * the model the repo should be working on.
     */
    constructor(model) {
        this.model = model;
    }

    create(params) {
        return this.model.create(params);
    }

    findItems({query, projection = {}, sort}) {
        let queryOp = this.model.find(query, projection);
        if (sort) {
            queryOp = queryOp.sort({...sort});
        }
        return queryOp.then(result => result && JSON.parse(JSON.stringify(result)));
    }

    findStream({query, projection}) {
        return this.model.find(query, projection).cursor();
    }

    findOneItem({query, projection = {}}) {
        return this.model.findOne(query, projection)
            .then(result => result && JSON.parse(JSON.stringify(result)));
    }

    getQueryStream(query) {
        return this.model.find(query).cursor();
    }

    updatePlain({query, update, options = {}}) {
        return this.model.findOneAndUpdate(query, update, {new: true, ...options})
            .then(result => result && JSON.parse(JSON.stringify(result)));
    }

    updateWithOptions({query, update, options = {}}) {
        return this.model.update(query, update, {...options});
    }

}

class InventoryRepo extends MedTrailBaseRepo {

}

// mongoose.set('debug', true);//todo:enable this to see mongodb debugs
// mongoose.Promise = global.Promise;


const mInventoryRepo = new InventoryRepo(InventoryModel);

exports.mInventoryRepo = mInventoryRepo;
