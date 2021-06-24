var express = require('express');
var router = express.Router();
const {callAPI, bind} = require('../lib/common-utils/router_functions');
const InventoryAPIs = require('../lib/apis/inventoryAPIs').getInstance();

/* GET home page. */
router.post('/createProduct', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'createProduct'));
});

router.post('/getProductData', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'getProductData'));
});

router.post('/addInventoryToWarehouse', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'addInventoryToWarehouse'));
});

router.post('/pushInventoryToReservedOrDamaged', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'pushInventoryToReservedOrDamaged'));
});

router.post('/getMasterInventoryViewWithSkuId', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'getMasterInventoryViewWithSkuId'));
});

router.post('/getProductsWithFilter', async (req, res) => {
  callAPI(req, res, bind(InventoryAPIs, 'getProductsWithFilter'));
});

module.exports = router;
