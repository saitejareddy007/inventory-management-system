# inventory-management-system
Database name: invData
Need to create sequence collection: db.sequence.insert({seqName: 'skuIdSequence', seqId: 100});
To run project use: npm start<br />

Api contract:<br />
url: http://localhost:7007/createProduct <br />
Request params:<br />
{
  "title": 12,
  "price": 100
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok"
}<br />


url: http://localhost:7007/getProductData<br />
Request params:<br />
{
  "skuId": 1
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok",
    "data": {
        "skuData": {
            "_id": "60d46478aa76a847cd6a4c2c",
            "skuId": 1,
            "title": "some product",
            "price": 100,
            "__v": 0
        }
    }
}

url: http://localhost:7007/addInventoryToWarehouse<br />
Request params:<br />
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test"
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok"
}

url: http://localhost:7007/pushInventoryToReservedOrDamaged<br />
Request params:<br />
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test",
    "actionType": "reserved" // possible value ['reserved', 'damaged']
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok"
}

url: http://localhost:7007/getMasterInventoryViewWithSkuId<br />
Request params:<br />
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test",
    "actionType": "reserved"
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok",
    "data": {
        "_id": "60d46478aa76a847cd6a4c2c",
        "skuId": 1,
        "title": "some product",
        "price": 100,
        "__v": 0,
        "totalCompartmentsData": {
            "availableQty": 10,
            "damagedQty": 0,
            "reservedQty": 20
        },
        "warehouseLevelData": [
            {
                "warehouseId": 1,
                "availableQty": 10,
                "damagedQty": 0,
                "reservedQty": 20
            }
        ]
    }
}<br />

url: http://localhost:7007/getProductsWithFilter<br />
Request params:<br />
{
    "size":2,
    "minPrice": 50,
    "maxPrice": 101
}<br />
Response:<br />
{
    "code": 200,
    "msg": "ok",
    "data": {
        "skusData": [
            {
                "_id": "60d46478aa76a847cd6a4c2c",
                "skuId": 1,
                "title": "some product",
                "price": 100,
                "__v": 0
            },
            {
                "_id": "60d464c7aa76a847cd6a4c2f",
                "skuId": 2,
                "title": "some product - 1",
                "price": 100,
                "__v": 0
            }
        ]
    }
}

