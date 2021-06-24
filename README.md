# inventory-management-system
To run project use: npm start

Api contract:
url: http://localhost:7007/createProduct
Request params:
{
  "title": 12,
  "price": 100
}
Response:
{
    "code": 200,
    "msg": "ok"
}


url: http://localhost:7007/getProductData
Request params:
{
  "skuId": 1
}
Response:
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

url: http://localhost:7007/addInventoryToWarehouse
Request params:
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test"
}
Response:
{
    "code": 200,
    "msg": "ok"
}

url: http://localhost:7007/pushInventoryToReservedOrDamaged
Request params:
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test",
    "actionType": "reserved" // possible value ['reserved', 'damaged']
}
Response:
{
    "code": 200,
    "msg": "ok"
}

url: http://localhost:7007/getMasterInventoryViewWithSkuId
Request params:
{
    "skuId": 1,
    "warehouseId": 1,
    "quantity": 10,
    "userId": "test",
    "actionType": "reserved"
}
Response:
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
}

url: http://localhost:7007/getProductsWithFilter
Request params:
{
    "size":2,
    "minPrice": 50,
    "maxPrice": 101
}
Response:
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

