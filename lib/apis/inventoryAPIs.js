const Constants = require('../Constants');
const {mProductsMasterRepo, mInventoryRepo, mSkuIdSequenceRepo, mInventoryTransactionsRepo} = require('../repos/mongoDbRepos');
const _ = require('lodash');
const utils = require('../helpers/utils').getInstance();

let instance;

class InventoryAPIs {

    async addAuditForInventoryTransactions(data) {
        try {
            await mInventoryTransactionsRepo.create(data);
        } catch (e) {
            console.log('unable to audit for this data', e, data);
            // can add a notification service here
        }
    }

    async generateNewSkuId(){
        try{
            const query = {seqName: 'skuIdSequence'};
            const update = {$inc: {id: 1}, $setOnInsert: {id: 1000}};
            const {id} = await mSkuIdSequenceRepo.updatePlain({query, update, options: {upsert: true}});
            return id
        } catch (e) {
            console.log('unable to generate sequence id', e);
            // can add a notification service here
        }
    }

    async createProduct(params) {
        try {
            const {post: postParams} = params;
            const {title, price} = postParams;
            if (!title || !title.trim() || !Number(price)) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Invalid Params'};
            }
            const skuId = await this.generateNewSkuId();
            if(!skuId){
                throw {...Constants.HTTP_ERRORS.INTERNAL_SERVER_ERROR, msg: 'Something went wrong, please try again'};
            }
            const queryParams = {skuId, title, price};
            await mProductsMasterRepo.create(queryParams);
            return {...Constants.HTTP_STATUS.SUCCESS};
        } catch (e) {
            console.log('Error:', this.createProduct.name, e);
            throw utils.constructErrorObj({e});
        }
    }

    async getProductData(params) {
        try {
            const {post: postParams} = params;
            const {skuId} = postParams;
            if (!skuId) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Invalid Params'};
            }
            const queryParams = {skuId};
            const data = await mProductsMasterRepo.findOneItem({query: queryParams});
            if(!data || !data.skuId){
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Product node found'};
            }
            return {...Constants.HTTP_STATUS.SUCCESS, data: {skuData: data}};
        } catch (e) {
            console.log('Error:', this.getProductData.name, e);
            throw utils.constructErrorObj({e});
        }
    }

    async addInventoryToWarehouse(params){
        try {
            const {post: postParams} = params;
            const {skuId, title, price, warehouseId, quantity, userId} = postParams;
            if (!skuId || !Number(quantity) || !warehouseId || !warehouseId.length || !title || !price || !userId) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Invalid Params'};
            }
            const queryParams = {skuId, warehouseId};
            const update = {
                $inc: {'compartmentsData.availableQty': quantity},
                $setOnInsert: {
                    title,
                    price,
                    compartmentsData: {
                        availableQty: quantity,
                        damagedQty: 0,
                        reservedQty: 0
                    }
                }
            };
            const data = await mInventoryRepo.updatePlain({query: queryParams, update, options:{upsert: true}});
            const auditData = {
                skuId: data.skuId,
                action: 'addInventory',
                userId,
                createdAt: Date.now(),
                requestData: {...postParams}
            };
            await this.addAuditForInventoryTransactions(auditData);
            return {...Constants.HTTP_STATUS.SUCCESS};
        } catch (e) {
            console.log('Error:', this.addInventoryToWarehouse.name, e);
            throw utils.constructErrorObj({e});
        }
    }

    async pushInventoryToReservedOrDamaged(params) {
        try {
            const {post: postParams} = params;
            const {skuId, warehouseId, quantity, actionType, userId} = postParams;
            if (!skuId || !Number(quantity) || !warehouseId || !warehouseId.length || !(quantity <= 0) || !actionType || !userId) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Invalid Params'};
            }
            if (!Constants.INVENTORY_PUSH_ACTION_TYPES.includes(actionType)) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'Invalid Action Type'};
            }
            const queryParams = {skuId, warehouseId};
            const invData = await mInventoryRepo.findOneItem({query: queryParams});
            const currentQty = _.get(invData, 'compartmentsData.availableQty', 0);
            if (currentQty < quantity) {
                throw {...Constants.HTTP_ERRORS.BAD_REQUEST, msg: 'you can not reserve more than available quantity'};
            }
            const update = {
                $inc: {
                    'compartmentsData.availableQty': -quantity
                }
            };
            update.$inc.compartmentsData[Constants.INVENTORY_PUSH_ACTION_TYPES_MAPPINGS[actionType]] = quantity;
            const data = await mInventoryRepo.updatePlain({query: queryParams, update});
            const auditActionType = {damaged: 'pushToDamaged', reserved: 'pushToReserved'};
            const auditData = {
                skuId: data.skuId,
                action: auditActionType[actionType],
                userId,
                createdAt: Date.now(),
                requestData: {...postParams}
            };
            await this.addAuditForInventoryTransactions(auditData);
            return {...Constants.HTTP_STATUS.SUCCESS};
        } catch (e) {
            console.log('Error:', this.pushInventoryToReservedOrDamaged.name, e);
            throw utils.constructErrorObj({e});
        }
    }

    async getMasterInventoryViewWithSkuId(params){
        try {
            const {post: postParams} = params;
            const {skuId} = postParams;
            const res = await this.getProductData({post: {skuId}});
            const skuData = _.get(res, 'data.skuData', {});
            const invDataQuery = {skuId};
            const invData = await mInventoryRepo.findItems({query: invDataQuery});
            const totalCompartmentsData = {
                availableQty: 0,
                damagedQty: 0,
                reservedQty: 0
            };
            const warehouseLevelData = [];
            invData.forEach(item=>{
                const {warehouseId} = item;
                const availableQty = _.get(item, 'compartmentsData.availableQty', 0) || 0;
                const damagedQty = _.get(item, 'compartmentsData.damagedQty', 0) || 0;
                const reservedQty = _.get(item, 'compartmentsData.reservedQty', 0) || 0;
                totalCompartmentsData.availableQty+= availableQty;
                totalCompartmentsData.damagedQty+= damagedQty;
                totalCompartmentsData.reservedQty+= reservedQty;
                totalCompartmentsData.push({warehouseId, availableQty, damagedQty, reservedQty});
            });
            return {...Constants.HTTP_STATUS.SUCCESS, data: {...skuData, totalCompartmentsData, warehouseLevelData}};
        } catch (e) {
            console.log('Error:', this.getMasterInventoryViewWithSkuId.name, e);
            throw utils.constructErrorObj({e});
        }
    }

    async getProductsWithFilter(params){
        try {
            const {post: postParams} = params;
            const {minPrice, maxPrice, size=10} = postParams;
            const query = {};
            if(!isNaN(minPrice)){
                query.price.$gte = minPrice;
            }
            if(!isNaN(maxPrice)){
                query.price.$lte = maxPrice;
            }
            const data = await mProductsMasterRepo.findItems({query, limit: size});
            return {...Constants.HTTP_STATUS.SUCCESS, data: {skusData: data}};
        } catch (e) {
            console.log('Error:', this.getProductsWithFilter.name, e);
            throw utils.constructErrorObj({e});
        }
    }




    static getInstance() {
        if (!instance) {
            instance = new InventoryAPIs();
        }
        return instance;
    }
}

exports.getInstance = InventoryAPIs.getInstance;
