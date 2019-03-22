"use strict";

// Import Controller
const posWarehoseController = require("./logic.pos.warehouse.controller");
const validateController = require("./validate.controller");
const shareController = require("./share.controller");

// Request Get Warehouse Static Data
module.exports.requestGetWarehouseStaticData = (req, res) => {
  if (
    req.body.version !== undefined &&
    req.body.version !== ""
  ) {

    // Validate Warehouse Static Version
    const validate = validateController.warehouseStaticVersion(
      req.body.version
    );

    if (!validate.success) return res.status(400).send(validate.msg);

    // Logic Pos Warehouse Controller
    return posWarehoseController
      .logicWarehouseStaticData(req.body.version)
      .then(response => {

        return res
          .status(200)
          .send(
            shareController.createJsonObject(
              response.data,
              response.msg,
              "/api/v1/warehouses/static",
              200,
              response.success, response.version
            )
          );
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send("Oops our bad!!!");
      });
  } else return res.status(400).send("Not a good api call");

};


// Request Keep Warehouse User Employee Data
module.exports.requestKeepCriticalData = (req, res) => {
  if (
    req.body.version !== undefined &&
    req.body.version !== ""
  ) {

    // Validate Warehouse Static Version
    const validate = validateController.warehouseStaticVersion(
      req.body.version
    );

    if (!validate.success) return res.status(400).send(validate.msg);

    // Variable
    // const apiKey = req.headers["api_key"];

    // Logic Pos Warehouse Controller
    return posWarehoseController
      .logicWarehouseStaticData(req.body.version)
      .then(response => {

        // Intialize
        const metadata = {
          version: []
        };

        return res
          .status(200)
          .send(
            shareController.createJsonObject(
              response.data,
              response.msg,
              "/api/v1/warehouses/static",
              200,
              response.success, response.version
            )
          );
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send("Oops our bad!!!");
      });
  } else return res.status(400).send("Not a good api call");

};


// Request Keep Warehouse Stores Detail
module.exports.requestKeepStoreDetail = (req, res) => {
  if (
    req.body.stores !== undefined &&
    req.body.stores !== "" &&
    res.userKey !== undefined &&
    res.userKey !== ""
  ) {

    // Validate Warehouse Static Version
    const validate = validateController.warehouseStores(
      req.body.stores
    );

    if (!validate.success) return res.status(400).send(validate.msg);

    // Logic Keep Warehouse Stores
    return posWarehoseController
      .logicKeepStoreDetail(req.body.stores, res.userKey)
      .then(response => {

        return res
          .status(200)
          .send(
            shareController.createJsonObject(
              response.data,
              response.msg,
              "/api/v1/warehouses/stores",
              200,
              response.success,
            )
          );
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send("Oops our bad!!!");
      });
  } else return res.status(400).send("Not a good api call");

};