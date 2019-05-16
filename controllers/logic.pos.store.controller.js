"use strict";

// Import Controller
const shareController = require("./share.controller");
const databaseController = require("./database.controller");

// Import Model
const partnerStoreModel = require("../models/partner_store");
const warehouseInformationModel = require("../models/warehouse_information_list");
const userEmployeeConnectModel = require("../models/warehouse_user_employee_connect");
const warehouseUserModel = require("../models/warehouse_user_list");
const storeProductSyncModel = require("../models/store_product_sync");
const partnerProductSyncModel = require("../models/partner_product_sync");
const billDiscountModel = require("../models/bill_discount");
const productDiscountModel = require("../models/product_discount");
const discountTrackModel = require("../models/product_discount_track");
const freeDiscountModel = require("../models/free_product_offer");
const valueDiscountModel = require("../models/value_product_offer");

// Logic Warehouse Store List
module.exports.logicWarehouseStoreList = async id => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Partner Store Record
    const storeRecord = await partnerStoreModel.readStoreRecord(
      "store_code AS branch_code, store_name AS branch_name, address_one, address_two, landmark, city_id AS city_unique, locality_id AS locality_unique, store_mobile AS mobile, store_email AS email, refund_on_discount, refund_policy, invoice_format",
      partnerRecord[0].partner_id,
      1
    );

    return {
      success: true,
      data: storeRecord,
      msg: "Succesful"
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Store List
module.exports.logicStoreList = async (id, code) => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Partner Store Record By Store Code
    let storeRecord = await partnerStoreModel.readStoreByCode(
      "store_code AS branch_code, store_name AS branch_name, address_one, address_two, landmark, city_id AS city_unique, locality_id AS locality_unique, store_mobile AS mobile, store_email AS email, refund_on_discount, refund_policy, invoice_format",
      code,
      partnerRecord[0].partner_id,
      1
    );

    // Parse
    storeRecord = JSON.stringify(storeRecord);
    storeRecord = JSON.parse(storeRecord);

    if (storeRecord.length === 0)
      return {
        success: true,
        data: {},
        msg: "Succesful"
      };
    else
      return {
        success: true,
        data: storeRecord[0],
        msg: "Succesful"
      };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Warehouse Record
module.exports.logicWarehouseRecord = async id => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Warehouse Data By Code
    let warehouseRecord = await warehouseInformationModel.readWarehouseByPartner(
      "warehouse_information_id AS warehouse_unique, business_name, address_one, address_two, landmark, city_id AS city_unique, locality_id AS locality_unique, gstin, cin, pan, mobile, email",
      partnerRecord[0].partner_id,
      1
    );

    // Parse
    warehouseRecord = JSON.stringify(warehouseRecord);
    warehouseRecord = JSON.parse(warehouseRecord);

    if (warehouseRecord.length === 0)
      return {
        success: true,
        data: {},
        msg: "Succesful"
      };
    else
      return {
        success: true,
        data: warehouseRecord[0],
        msg: "Succesful"
      };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Employee Record
module.exports.logicEmployeeRecord = async (id, code) => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Partner Store Record By Store Code
    let storeRecord = await partnerStoreModel.readStoreByCode(
      "store_id",
      code,
      partnerRecord[0].partner_id,
      1
    );

    // Parse
    storeRecord = JSON.stringify(storeRecord);
    storeRecord = JSON.parse(storeRecord);

    if (storeRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown store"
      };

    let parallel = await Promise.all([
      warehouseUserModel.readBillerByJoin(
        "warehouse_user_lists.warehouse_user_id, warehouse_user_lists.warehouse_role_id, warehouse_user_lists.password, warehouse_employee_lists.warehouse_employe_id, warehouse_employee_lists.store_id, warehouse_employee_lists.first_name, warehouse_employee_lists.last_name, warehouse_employee_lists.birth_date, warehouse_employee_lists.mobile, warehouse_employee_lists.email, warehouse_employee_lists.dept_name, warehouse_employee_lists.gender_id, warehouse_employee_lists.status AS employee_status, warehouse_user_lists.status AS user_status",
        partnerRecord[0].partner_id,
        storeRecord[0].store_id,
        1
      ),
      warehouseUserModel.readWarehouseUserRoleId(
        "warehouse_user_id,warehouse_role_id,password,status",
        2,
        1
      )
    ]);

    // // Join Warehouse Biller Data
    // let connectRecord = await warehouseUserModel.readBillerByJoin('warehouse_user_lists.warehouse_user_id, warehouse_user_lists.warehouse_role_id, warehouse_user_lists.password, warehouse_employee_lists.warehouse_employe_id, warehouse_employee_lists.store_id, warehouse_employee_lists.first_name, warehouse_employee_lists.last_name, warehouse_employee_lists.birth_date, warehouse_employee_lists.mobile, warehouse_employee_lists.email, warehouse_employee_lists.dept_name, warehouse_employee_lists.gender_id, warehouse_employee_lists.status AS employee_status, warehouse_user_lists.status AS user_status', partnerRecord[0].partner_id, storeRecord[0].store_id, 1);

    // Parse
    parallel = JSON.stringify(parallel);
    parallel = JSON.parse(parallel);

    if (parallel.length === 0)
      return {
        success: true,
        data: [],
        msg: "Succesful"
      };
    else
      return {
        success: true,
        data: billerJoinJson(parallel, storeRecord[0].store_id),
        msg: "Succesful"
      };
  } catch (error) {
    return Promise.reject(error);
  }
};

const billerJoinJson = (records, storeId) => {
  try {
    // Variable
    let arr = [];

    // Array Merge
    records = records[0].concat(records[1]);

    records.map(async (record, index) => {
      let obj = {};

      obj.user_id = record.warehouse_user_id;
      obj.role_id = record.warehouse_role_id;
      obj.password = record.password;

      if (obj.role_id === 2) {
        obj.employe_id = 0;
        obj.gender_id = 0;
        obj.user_status = record.status;
        obj.employee_status = 0;
        obj.first_name = null;
        obj.last_name = null;
        obj.birth_date = null;
        obj.mobile = null;
        obj.email = null;
        obj.dept_name = null;

        // Array Push
        arr.push(obj);
      } else {
        obj.employe_id = record.warehouse_employe_id;
        obj.gender_id = record.gender_id;
        obj.user_status = record.user_status;
        obj.employee_status = record.employee_status;

        if (record.first_name === "NULL") obj.first_name = null;
        else obj.first_name = record.first_name;

        if (record.last_name === "NULL") obj.last_name = null;
        else obj.last_name = record.last_name;

        if (record.birth_date === "NULL") obj.birth_date = null;
        else obj.birth_date = record.birth_date;

        if (record.mobile === "NULL") obj.mobile = null;
        else obj.mobile = record.mobile;

        if (record.email === "NULL") obj.email = null;
        else obj.email = record.email;

        if (record.dept_name === "NULL") obj.dept_name = null;
        else obj.dept_name = record.dept_name;

        // Push Array
        if (record.store_id === storeId) arr.push(obj);
      }
    });

    return arr;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Store Product Record
module.exports.logicStoreProduct = async (id, code) => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Partner Store Record By Store Code
    let storeRecord = await partnerStoreModel.readStoreByCode(
      "store_id",
      code,
      partnerRecord[0].partner_id,
      1
    );

    // Parse
    storeRecord = JSON.stringify(storeRecord);
    storeRecord = JSON.parse(storeRecord);

    if (storeRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown store"
      };

    // Read Store Product Sync Record By Store Id
    let syncRecord = await storeProductSyncModel.readProductSyncById(
      "id, sync_id",
      storeRecord[0].store_id,
      1
    );

    // Parse
    syncRecord = JSON.stringify(syncRecord);
    syncRecord = JSON.parse(syncRecord);

    // Record Length
    const syncLength = syncRecord.length;

    if (syncLength === 0)
      return {
        success: true,
        data: {
          products: [],
          api_call: "NO",
          return_id: 0
        },
        msg: "Succesful"
      };

    // Logic Warehouse Product
    const products = await getWarehouseProduct(
      syncRecord[0],
      partnerRecord[0].mobile
    );

    if (products.success)
      return {
        success: true,
        data: {
          products: products.data,
          api_call: syncLength > 1 ? "YES" : "NO",
          return_id: syncRecord[0].id
        },
        msg: products.msg
      };
    else
      return {
        success: false,
        data: {
          products: [],
          api_call: "NO",
          return_id: 0
        },
        msg: products.msg
      };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Warehouse Product
const getWarehouseProduct = async (sync, mobile) => {
  try {
    // Read Stores Product By Sync Id Record
    let barcodeArray = await partnerProductSyncModel.readProductBySyncId(
      "attributes",
      sync.sync_id
    );

    // Parse
    barcodeArray = JSON.stringify(barcodeArray);
    barcodeArray = JSON.parse(barcodeArray);

    if (barcodeArray === 0)
      return {
        success: false,
        data: [],
        msg: "Empty barcode sync"
      };
    let attribute = [];
    if (Array.isArray(barcodeArray)) attribute = barcodeArray[0].attributes;
    else attribute = barcodeArray.attributes;

    // then, create a dynamic list of comma-separated question marks
    const quesmarks = new Array(attribute.length).fill("?").join(",");

    // Read Warehouse Product Record By Array
    const productRecord = await databaseController.readWarehouseProductArray(
      `product_barcode AS barcode, IFNULL(product_name,'') as product_name, IFNULL(brand_name,'') as brand_name, IFNULL(description,'') as description, global_category_id AS category_id, global_sub_category_id AS sub_category_id, global_sub_sub_category_id AS sub_sub_category_id, product_unit_id AS unit_id, product_sub_unit_id AS sub_unit_id, product_size, selling_price, product_margin, actual_price, sgst, cgst, igst, hsn, sodexo, status`,
      mobile,
      quesmarks,
      attribute
    );

    if (productRecord === 0)
      return {
        success: false,
        data: [],
        msg: "Empty warehouse product"
      };
    else
      return {
        success: true,
        data: productRecord,
        msg: "Succesful"
      };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Store Product Sync
module.exports.logicStoreProductSync = async id => {
  try {
    // Update Status Store Product Sync Record
    storeProductSyncModel.updateStatusSync(0, id);

    return {
      success: true,
      data: [],
      msg: "Succesful"
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Store Discount Record
module.exports.logicStoreDiscount = async (id, code) => {
  try {
    // Call User Partner Data
    const partnerRecord = await shareController.userPartnerData(id);

    if (partnerRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown partner"
      };

    // Read Partner Store Record By Store Code
    let storeRecord = await partnerStoreModel.readStoreByCode(
      "store_id",
      code,
      partnerRecord[0].partner_id,
      1
    );

    // Parse
    storeRecord = JSON.stringify(storeRecord);
    storeRecord = JSON.parse(storeRecord);

    if (storeRecord.length === 0)
      return {
        success: false,
        data: [],
        msg: "Unknown store"
      };

    return await readDiscount(partnerRecord, storeRecord);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Read Store Discount
const readDiscount = async (partnerRecord, storeRecord) => {
  try {
    const parallel = await Promise.all([
      billDiscountModel.readBillDiscount(
        "id AS key_id, discount_base_id AS discount_base_key, name AS discount_name, start_date, end_date, start_time, end_time, min_amount AS minimum_amount, max_discount_amount AS Maximum_amount, bill_offer_value AS value, status",
        storeRecord[0].store_id,
        1
      ),
      discountTrackModel.readDiscountTrackByStatus(
        "product_discount_id",
        storeRecord[0].store_id,
        1
      )
    ]);

    billDiscountModel.updateBillTrack(0, storeRecord[0].store_id);

    let id = parallel[1].map(discount => {
      return discount.product_discount_id;
    });

    // then, create a dynamic list of comma-separated question marks
    const marks = new Array(id.length).fill("?").join(",");

    let discountRecord = await productDiscountModel.readProductDiscountArray(
      "id, discount_base_id, name, start_date, end_date, start_time, end_time, status",
      marks,
      id
    );

    // Parse
    discountRecord = JSON.stringify(discountRecord);
    discountRecord = JSON.parse(discountRecord);

    if (discountRecord.length === 0 && parallel[0].length === 0) {
      return {
        success: true,
        data: {
          bill_discounts: [],
          product_discounts: []
        },
        msg: "Successful"
      };
    } else if (discountRecord.length !== 0 && parallel[0].length !== 0) {
      const json = await createDiscountJson(discountRecord);
      return {
        success: true,
        data: {
          bill_discounts: parallel[0],
          product_discounts: json
        },
        msg: "Successful"
      };
    } else if (parallel[0].length !== 0) {
      return {
        success: true,
        data: {
          bill_discounts: parallel[0],
          product_discounts: []
        },
        msg: "Successful"
      };
    } else if (discountRecord.length !== 0) {
      const json = await createDiscountJson(discountRecord);
      return {
        success: true,
        data: {
          bill_discounts: [],
          product_discounts: json
        },
        msg: "Successful"
      };
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create Discount Json
const createDiscountJson = async json => {
  let bunch = json.map(async (discount, index) => {
    let obj = {};
    obj.key_id = discount.id;
    obj.discount_base_key = discount.discount_base_id;
    obj.discount_name = discount.name;
    obj.start_date = discount.start_date;
    obj.end_date = discount.end_date;
    obj.start_time = discount.start_time;
    obj.end_time = discount.end_time;
    obj.status = discount.status;

    if (discount.discount_base_id === 5)
      obj.free_products = await freeDiscountModel.readFreeOffer(
        "id AS key_id, buy_product_barcode AS buy_barcode, buy_product_quantity AS buy_quantity, free_product_barcode AS free_barcode, free_product_quantity AS free_quantity, status",
        discount.id
      );
    else
      obj.value_products = await valueDiscountModel.readValueOffer(
        "id AS key_id, product_barcode AS barcode, buy_product_quantity AS buy_quantity, offer_value AS value, status",
        discount.id
      );

    return obj;
  });

  return await Promise.all(bunch);
};
