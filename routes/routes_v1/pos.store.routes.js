/**
 * Pos Store Routes
 */

// Import Package
const { Router } = require("express");

// Controllers (route handlers).
const PosStoreApiController = require("../../controllers/request.pos.store.controller");
const PosWarehouseApiController = require("../../controllers/request.pos.warehouse.controller");

// Api Key Auth
const { apiKeyAuth } = require("../../services/api.key.auth");

const routes = new Router();

// Get Store Static Data
routes.post(
  "/static",
  apiKeyAuth,
  PosWarehouseApiController.requestGetWarehouseStaticData
);

// Get All Stores Record
routes.get(
  "/stores",
  apiKeyAuth,
  PosStoreApiController.requestWarehouseStoreList
);

// Get All Stores Record
routes.get(
  "/stores/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreRecord
);

// Get Warehouse Information Record
routes.get(
  "/warehouse",
  apiKeyAuth,
  PosStoreApiController.requestWarehouseRecord
);

// Get Stores Employee Record
routes.get(
  "/employees/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestEmployeeRecord
);

// Get Stores Products Record
routes.get(
  "/products/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreProduct
);

// Get Stores Products Record
routes.put(
  "/products/:id([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreProductSync
);

// Get Stores Discount
routes.get(
  "/discounts/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreDiscount
);

// Post Stores Invoice
routes.post(
  "/invoices/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreInvoice
);

// Post Stores Login-History
routes.post(
  "/login-history/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreLoginHistory
);

// Post Stores Error-Log
routes.post(
  "/error-log/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreErrorLog
);

// Get New Membership Card
routes.get(
  "/new/card/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestNewMembershipCard
);

// Deactivated Membership Sync
routes.put(
  "/new/card/:storeCode([0-9]+)/:syncId([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestMembershipSync
);

// Get Customer Record
routes.get(
  "/customers/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestGetCustomers
);

// Post Customer Record
routes.post(
  "/customers/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestPostCustomers
);

// Post Store Stocks Record
routes.post(
  "/stocks/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreStock
);

// Post Store Stocks Log Record
routes.post(
  "/stock/logs/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreStockLog
);

// Post Store Supplier Detail
routes.post(
  "/supplier/detail/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestSupplierDetail
);

// Post Store Supplier Invoice
routes.post(
  "/supplier/invoice/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestSupplierInvoice
);

// Get Coupon Record
routes.get(
  "/coupons/:storeCode([0-9]+)",
  apiKeyAuth,
  PosStoreApiController.requestStoreCoupon
);

module.exports = routes;
