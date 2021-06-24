const mongoose = require('mongoose');
const {mongoConfig} = require('config');

const replicaSetString = (mongoConfig.hasReplicaSet ? `/?replicaSet=${mongoConfig.rsName}` : '');
const connection = mongoose.createConnection(`mongodb://${mongoConfig.hosts}${replicaSetString}`, {
    ignoreUndefined: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connection.on('error', (err) => {
    console.log('something is wrong : ', err);
});

connection.on('open', () => {
    console.log('successfully connected to mongodb');
});

// Database
const db = connection.useDb(mongoConfig.database);

// Schema
const OpenSchema = mongoose.Schema({}, {strict: false});

// Entity Models
const InventoryModel = db.model('inventory', OpenSchema, 'inventory');
const ProductsMasterModel = db.model('products_master', OpenSchema, 'products_master');
const SequenceModel = db.model('SkuIdSequence', OpenSchema, 'SkuIdSequence');
const InventoryTransactionsModal = db.model('inventory_transactions', OpenSchema, 'inventory_transactions');

class MongoBaseRepo {
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

    findItems({query, projection = {}, sort, limit}) {
        let queryOp = this.model.find(query, projection);
        if (sort) {
            queryOp = queryOp.sort({...sort});
        }
        if(limit){
            queryOp = queryOp.limit(limit);
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

class InventoryRepo extends MongoBaseRepo {

}

class ProductsMasterRepo extends MongoBaseRepo {

}

class SequenceRepo extends MongoBaseRepo {

}

class InventoryTransactionsRepo extends MongoBaseRepo {

}

// mongoose.set('debug', true);//todo:enable this to see mongodb debugs
// mongoose.Promise = global.Promise;


const mInventoryRepo = new InventoryRepo(InventoryModel);
const mProductsMasterRepo = new ProductsMasterRepo(ProductsMasterModel);
const mSequenceRepo = new SequenceRepo(SequenceModel);
const mInventoryTransactionsRepo = new InventoryTransactionsRepo(InventoryTransactionsModal);

exports.mInventoryRepo = mInventoryRepo;
exports.mProductsMasterRepo = mProductsMasterRepo;
exports.mSequenceRepo = mSequenceRepo;
exports.mInventoryTransactionsRepo = mInventoryTransactionsRepo;
