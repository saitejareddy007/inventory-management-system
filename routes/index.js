var express = require('express');
var router = express.Router();
const {callAPI, fn} = require('../lib/common-utils/router_functions');
const InventoryAPIs = require('../lib/apis/inventoryAPIs').getInstance();

/* GET home page. */
router.post('/createProduct', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'createProduct'));
});

router.post('/getProductData', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'getProductData'));
});

router.post('/addInventoryToWarehouse', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'addInventoryToWarehouse'));
});

router.post('/pushInventoryToReservedOrDamaged', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'pushInventoryToReservedOrDamaged'));
});

router.post('/getMasterInventoryViewWithSkuId', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'getMasterInventoryViewWithSkuId'));
});

router.post('/getProductsWithFilter', async (req, res) => {
  callAPI(req, res, fn.bind(InventoryAPIs, 'getProductsWithFilter'));
});

module.exports = router;
