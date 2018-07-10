"use strict";

// Import Package
const moment = require("moment");

// Import Controller
const shareController = require("./shareController");
const databaseController = require("./databaseController");

// Import Model
const localityModel = require("../models/locality");
const cityModel = require("../models/city");
const genderModel = require("../models/gender");
const deviceModel = require("../models/device_detail");
const senseConstModel = require("../models/sense_constant");
const feedbackModel = require("../models/feedback_question");
const feedbackOptionModel = require("../models/feedback_option");
const surveyModel = require("../models/survey_question");
const surveyOptionModel = require("../models/survey_option");
const surveyOfferModel = require("../models/sense_offer");
const complainModel = require("../models/store_complain");
const merchantModel = require("../models/merchant");

// Current Date and Time
const todayDate = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD");

// Back Date -1 Convert
const backDate = moment()
  .subtract(1, "days")
  .format("YYYY-MM-DD");

// Logic Sense Static
module.exports.logicSenseStatic = async appVersion => {
  try {
    // Intialize
    let responsedata = {};

    // Read Sense Constant Record
    const senseConstant = await senseConstModel.readSenseConstant(
      "*",
      "STATIC_APP_VERSION",
      1
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      return (responsedata = {
        success: false,
        msg: "Empty sense constant"
      });
    }

    // Check Sense Static App Version
    if (appVersion === parseFloat(senseConstant[0].value)) {
      return (responsedata = {
        success: true,
        msg: "Upto date"
      });
    } else {
      appVersion = parseFloat(senseConstant[0].value);
    }

    // Parallel City Locality Gender Record
    const parallel = await Promise.all([
      cityModel.readCityRecord(
        "city_id AS city_unique, city_name AS city, longitude AS lon, latitude AS lat",
        1
      ),
      localityModel.readLocalityRecord(
        "locality_id AS locality_unique, city_id AS city_unique, locality_name AS locality, pincode, longitude AS lon, latitude AS lat",
        1
      ),
      genderModel.readGenderRecord(
        "gender_id AS gender_unique, name AS gender_name",
        1
      )
    ]);

    if (parallel.length === 0) {
      return Promise.reject("Oops our bad!!!");
    }

    return (responsedata = {
      success: true,
      msg: {
        city: parallel[0],
        locality: parallel[1],
        gender: parallel[2]
      },
      version: appVersion
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Request Logic Keep Complain
module.exports.requestLogicKeepComplain = async (
  complainJson,
  mobile,
  storeId
) => {
  try {
    let responsedata = {};

    // Read Merchant Record
    const merchantRecord = await merchantModel.readMerchantByMobile(
      "merchant_id",
      mobile,
      1
    );

    if (merchantRecord.length === 0) {
      return (responsedata = {
        success: false,
        msg: "Empty merchant record"
      });
    }

    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Parallel
    await Promise.all([
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId)
    ]);

    // Logic Read Complain
    const complain = await logicKeepComplain(
      mobile,
      storeId,
      complainJson,
      merchantRecord
    );

    return (responsedata = {
      success: true,
      msg: "Succesful"
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Read Complain
const logicKeepComplain = async (
  mobile,
  storeId,
  complainJson,
  merchantRecord
) => {
  try {
    let versionFlag = {
      customer: true
    };

    // Read Constant Record
    const constant = await databaseController.readConstantRecordName(
      "*",
      mobile,
      storeId,
      "CUSTOMER_IDENTITY_APP_VERSION",
      1
    );

    // // Read Sense Offer Record
    // const offer = await surveyOfferModel.readSenseOffer("*", Complain, 1);

    const promises = complainJson.map(async (json, index) => {
      // Read Customer Identity By Mobile
      const customerRecord = await databaseController.readCustomerIdentityByMobile(
        "*",
        mobile,
        storeId,
        json.customer_mobile,
        1
      );

      // Reform Customer Detail
      const reform = shareController.reformCustomerDetail(
        json.first_name,
        json.last_name,
        json.spouse_name,
        json.dob,
        json.married,
        json.anniversary,
        false
      );

      if (customerRecord.length === 0) {
        // Keep Merchant Customer Identity Record
        const customerId = await databaseController.keepCustomerIdentity(
          mobile,
          storeId,
          reform.first_name,
          reform.last_name,
          json.email,
          json.customer_mobile,
          reform.dob,
          json.gender_id,
          reform.married,
          reform.spouse_name,
          reform.anniversary,
          1
        );

        // Keep Merchant Store Complain
        complainModel.keepStoreComplain(
          customerId.insertId,
          merchantRecord[0].merchant_id,
          storeId,
          json.description,
          1
        );
      } else {
        // Update Merchant Customer Identity Record
        await databaseController.updateCustomerIdentity(
          mobile,
          storeId,
          reform.first_name,
          reform.last_name,
          json.email,
          json.customer_mobile,
          reform.dob,
          json.gender_id,
          reform.married,
          reform.spouse_name,
          reform.anniversary,
          1
        );

        // Read Store Complain Record
        const complainRecord = await complainModel.readStoreComplain(
          "*",
          storeId,
          merchantRecord[0].merchant_id,
          customerRecord[0].cust_identity_id,
          1
        );

        if (complainRecord.length === 0) {
          // Keep Merchant Store Complain
          complainModel.keepStoreComplain(
            customerRecord[0].cust_identity_id,
            merchantRecord[0].merchant_id,
            storeId,
            json.description,
            1
          );
        } else {
          // Complain Record CreatedAt Date Convert
          const createdDate = moment(complainRecord[0].created_at).format(
            "YYYY-MM-DD"
          );

          // Check Complain Keep or Update
          if (createdDate >= backDate && createdDate <= todayDate) {
            // Update Merchant Store Complain
            complainModel.updateStoreComplain(
              complainRecord[0].complain_id,
              json.description,
              1
            );
          } else {
            // Keep Merchant Store Complain
            complainModel.keepStoreComplain(
              customerRecord[0].cust_identity_id,
              merchantRecord[0].merchant_id,
              storeId,
              json.description,
              1
            );
          }
        }
      }

      if (versionFlag.customer) {
        versionFlag.customer = false;
        // Increment Constant Value
        const increment = parseFloat(constant[0].value) + parseFloat(0.1);

        databaseController.updateMerchantConstantTable(
          mobile,
          storeId,
          constant[0].constant_id,
          increment.toFixed(1),
          1
        );
      }
    });

    return await Promise.all(promises);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Request Logic Keep Customer
module.exports.requestLogicKeepCustomer = async (
  customerJson,
  mobile,
  storeId
) => {
  try {
    let responsedata = {};

    // Read Merchant Record
    const merchantRecord = await merchantModel.readMerchantByMobile(
      "merchant_id",
      mobile,
      1
    );

    if (merchantRecord.length === 0) {
      return (responsedata = {
        success: false,
        msg: "Empty merchant record"
      });
    }
    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Parallel
    await Promise.all([
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId)
    ]);

    // Logic Read Customer
    const complain = await logicKeepCustomer(
      mobile,
      storeId,
      customerJson,
      merchantRecord
    );

    return (responsedata = {
      success: true,
      msg: "Succesful"
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Read Customer
const logicKeepCustomer = async (
  mobile,
  storeId,
  customerJson,
  merchantRecord
) => {
  let versionFlag = {
    customer: true
  };
  // Read Constant Record
  const constant = await databaseController.readConstantRecordName(
    "*",
    mobile,
    storeId,
    "CUSTOMER_IDENTITY_APP_VERSION",
    1
  );

  const promises = customerJson.map(async (json, index) => {
    // Reform Customer Detail
    const reform = shareController.reformCustomerDetail(
      json.first_name,
      json.last_name,
      json.spouse_name,
      json.dob,
      json.married,
      json.anniversary,
      true
    );

    // Read Customer Identity By Mobile
    const customerRecord = await databaseController.readCustomerIdentityByMobile(
      "*",
      mobile,
      storeId,
      json.customer_mobile,
      1
    );

    if (customerRecord.length === 0) {
      // Keep Merchant Customer Identity Record
      const customerId = await databaseController.keepCustomerIdentity(
        mobile,
        storeId,
        reform.first_name,
        reform.last_Name,
        json.email,
        json.customer_mobile,
        reform.dob,
        json.gender_id,
        reform.married,
        reform.spouse_name,
        reform.anniversary,
        1
      );
    } else {
      // Update Merchant Customer Identity Record
      await databaseController.updateCustomerIdentity(
        mobile,
        storeId,
        reform.first_name,
        reform.last_Name,
        json.email,
        json.customer_mobile,
        reform.dob,
        json.gender_id,
        reform.married,
        reform.spouse_name,
        reform.anniversary,
        1
      );
    }

    if (versionFlag.customer) {
      versionFlag.customer = false;

      // Increment Constant Value
      const increment = parseFloat(constant[0].value) + parseFloat(0.1);

      databaseController.updateMerchantConstantTable(
        mobile,
        storeId,
        constant[0].constant_id,
        increment.toFixed(1),
        1
      );
    }
  });

  return await Promise.all(promises);
};

// Request Logic Keep Feedback Survey
module.exports.requestLogicFeedbackSurvey = async (
  feedbackSurveyJson,
  mobile,
  storeId
) => {
  try {
    // Intialize
    let responsedata = {};

    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Read Merchant Record
    const merchantRecord = await merchantModel.readMerchantByMobile(
      "merchant_id",
      mobile,
      1
    );

    if (merchantRecord.length === 0) {
      return (responsedata = {
        success: false,
        msg: "Empty merchant record"
      });
    }

    // Parallel
    await Promise.all([
      databaseController.createFeedbackQuestionTable(mobile, storeId),
      databaseController.createFeedbackOptionTable(mobile, storeId),
      databaseController.createFeedbackStoreTable(mobile, storeId),
      databaseController.createSurveyQuestionTable(mobile, storeId),
      databaseController.createSurveyOptionTable(mobile, storeId),
      databaseController.createSurveyStoreTable(mobile, storeId),
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId)
    ]);

    // Logic Feedback Survey
    await logicFeedbackSurvey(
      feedbackSurveyJson,
      mobile,
      storeId,
      merchantRecord
    );

    return (responsedata = {
      success: true,
      msg: "Succesful"
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Feedback Survey
const logicFeedbackSurvey = async (
  feedbackSurveyJson,
  mobile,
  storeId,
  merchantRecord
) => {
  try {
    // Intialize
    let surveyVersion = undefined;
    let feedbackVersion = undefined;
    let customerVersion = undefined;
    let versionFlag = {
      survey: true,
      feedback: true,
      customer: true
    };

    // Read Constant Record
    const constant = await databaseController.readConstantRecord(
      "*",
      mobile,
      storeId,
      1
    );

    if (constant.length === 0) {
      return Promise.reject("Oops our bad!!!");
    }

    // Iterate
    constant.map((version, index) => {
      if (version.name === "CUSTOMER_SURVEY_APP_VERSION") {
        surveyVersion = version[index];
      } else if (version.name === "CUSTOMER_FEEDBACK_APP_VERSION") {
        feedbackVersion = version[index];
      } else if (version.name === "CUSTOMER_IDENTITY_APP_VERSION") {
        customerVersion = version[index];
      }
    });

    const promises = feedbackSurveyJson.map(async (json, index) => {
      // Read Customer Identity By Mobile
      let customerRecord = await databaseController.readCustomerIdentityByMobile(
        "*",
        mobile,
        storeId,
        json.customer_mobile,
        1
      );

      // Declare
      const customerId = undefined;

      // Reform Customer Detail
      const reform = shareController.reformCustomerDetail(
        json.first_name,
        json.last_name,
        json.spouse_name,
        json.dob,
        json.married,
        json.anniversary,
        true
      );

      if (customerRecord.length === 0) {
        // Keep Merchant Customer Identity Record
        customerRecord = await databaseController.keepCustomerIdentity(
          mobile,
          storeId,
          reform.first_name,
          reform.last_name,
          json.email,
          json.customer_mobile,
          dob,
          json.gender_id,
          reform.married,
          reform.spouse_name,
          reform.anniversary,
          1
        );

        customerId = customerRecord.insertId;
      } else {
        // Update Merchant Customer Identity Record
        await databaseController.updateCustomerIdentity(
          mobile,
          storeId,
          reform.first_name,
          reform.last_name,
          json.email,
          json.customer_mobile,
          dob,
          json.gender_id,
          reform.married,
          reform.spouse_name,
          reform.anniversary,
          1
        );

        customerId = customerRecord[0].cust_identity_id;
      }

      if (versionFlag.customer) {
        // Customer flag
        versionFlag.customer = false;

        // Increment Constant Value
        const increment = parseFloat(customerVersion.value) + parseFloat(0.1);

        databaseController.updateMerchantConstantTable(
          mobile,
          storeId,
          customerVersion.constant_id,
          increment.toFixed(1),
          1
        );
      }

      // Survey
      json.customer_survey.map(async (survey, index) => {
        // Read One Record Merchant Store Survey
        const surveyRecord = await database.readLimitMerchantSurvey(
          "*",
          mobile,
          storeId,
          customerId,
          survey.question_id,
          survey.role_id,
          1
        );

        if (surveyRecord.length === 0) {
          // Keep Merchant Store Survey Table
          await database.keepMerchantSurveyTable(
            mobile,
            storeId,
            survey.question_id,
            survey.option_id,
            customerId,
            survey.role_id,
            1
          );
        } else {
          // Survey Record CreatedAt Date Convert
          const createdDate = moment(surveyRecord[0].created_at).format(
            "YYYY-MM-DD"
          );

          // Check Survey Keep or Update
          if (createdDate >= backDate && createdDate <= todayDate) {
            // Update Merchant Store Survey
            await database.updateMerchantSurveyTable(
              mobile,
              storeId,
              surveyRecord[0].keep_survey_id,
              survey.question_id,
              survey.option_id,
              customerId,
              survey.role_id,
              1
            );
          } else {
            // Keep Merchant Store Survey Table
            await database.keepMerchantSurveyTable(
              mobile,
              storeId,
              survey.question_id,
              survey.option_id,
              customerId,
              survey.role_id,
              1
            );
          }
        }

        if (versionFlag.survey) {
          // Survey flag
          versionFlag.survey = false;

          // Increment Constant Value
          const increment = parseFloat(surveyVersion.value) + parseFloat(0.1);

          databaseController.updateMerchantConstantTable(
            mobile,
            storeId,
            surveyVersion.constant_id,
            increment.toFixed(1),
            1
          );
        }
      });

      // Feedback
      json.customer_feedback.map(async (feedback, index) => {
        // Read One Record Merchant Store Feedback
        const feedbackRecord = await database.readLimitMerchantFeedback(
          "*",
          mobile,
          storeId,
          customerId,
          feedback.question_id,
          feedback.role_id,
          1
        );

        if (feedbackRecord.length === 0) {
          // Keep Merchant Store Feedback Table
          await database.keepMerchantFeedbackTable(
            mobile,
            storeId,
            feedback.question_id,
            feedback.option_id,
            customerId,
            feedback.role_id,
            1
          );
        } else {
          // Feedback Record CreatedAt Date Convert
          const createdDate = moment(feedbackRecord[0].created_at).format(
            "YYYY-MM-DD"
          );

          // Check Survey Keep or Update
          if (createdDate >= backDate && createdDate <= todayDate) {
            // Update Merchant Store Feedback
            await database.updateMerchantFeedbackTable(
              mobile,
              storeId,
              feedbackRecord[0].keep_feed_id,
              feedback.question_id,
              feedback.option_id,
              customerId,
              feedback.role_id,
              1
            );
          } else {
            // Keep Merchant Store Feedback Table
            await database.keepMerchantFeedbackTable(
              mobile,
              storeId,
              feedback.question_id,
              feedback.option_id,
              customerId,
              feedback.role_id,
              1
            );
          }
        }

        if (versionFlag.feedback) {
          // Feedback flag
          versionFlag.feedback = false;
          // Increment Constant Value
          const increment = parseFloat(feedbackVersion.value) + parseFloat(0.1);

          databaseController.updateMerchantConstantTable(
            mobile,
            storeId,
            feedbackVersion.constant_id,
            increment.toFixed(1),
            1
          );
        }
      });
    });

    return await Promise.all(promises);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Get Feedback Data
module.exports.logicGetFeedback = async (
  merchantVersion,
  senseVersion,
  mobile,
  storeId
) => {
  try {
    // Intialize
    let responsedata = {};
    let merchantFlag = false;
    let senseFlag = false;

    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Parallel Merchant and Sense Constant
    const parallel = await Promise.all([
      databaseController.readConstantRecordName(
        "*",
        mobile,
        storeId,
        "CUSTOMER_FEEDBACK_APP_VERSION",
        1
      ),
      senseConstModel.readSenseConstant("*", "CUSTOMER_FEEDBACK_APP_VERSION", 1)
    ]);

    if (parallel.length === 0) {
      return Promise.reject("Oops our bad!!!");
    }

    // Merchant app version
    if (merchantVersion === parseFloat(parallel[0][0].value)) {
      merchantFlag = true;
    } else {
      merchantVersion = parseFloat(parallel[0][0].value);
    }

    // Admin app version
    if (senseVersion === parseFloat(parallel[1][0].value)) {
      senseFlag = true;
    } else {
      senseVersion = parseFloat(parallel[1][0].value);
    }

    // Both flag true then return
    if (merchantFlag && senseFlag) {
      return (responsedata = {
        success: true,
        msg: "Upto date"
      });
    }

    // Logic Read Feedback
    const feedback = await logicReadFeedback(
      mobile,
      storeId,
      merchantFlag,
      senseFlag
    );

    return (responsedata = {
      success: true,
      msg: feedback,
      sense_version: senseVersion,
      merchant_version: merchantVersion
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Read Feedback
const logicReadFeedback = async (mobile, storeId, merchantFlag, senseFlag) => {
  try {
    // Variable
    let jsonArray = [];
    let merchantArray = [];
    let adminArray = [];

    // Parallel
    await Promise.all([
      databaseController.createFeedbackQuestionTable(mobile, storeId),
      databaseController.createFeedbackOptionTable(mobile, storeId),
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId),
      databaseController.createFeedbackStoreTable(mobile, storeId)
    ]);

    // Merchant Version
    if (!merchantFlag) {
      const merchantFeed = await databaseController.readFeedbackQuestion(
        mobile,
        storeId,
        1
      );

      if (merchantFeed.length !== 0) {
        // Create Feedback Json
        merchantArray = await creatFeedbackJson(
          merchantFeed,
          1,
          mobile,
          storeId
        );
      }
    }

    // Admin Version
    if (!senseFlag) {
      const adminFeed = await feedbackModel.readAdminFeedbackQuestion(
        "feedback_questions.feed_ques_id, feedback_questions.feed_question, feedback_questions.input_id, input_types.input_name",
        mobile,
        1
      );

      if (adminFeed.length !== 0) {
        // Create Feedback Json
        adminArray = await creatFeedbackJson(
          adminFeed,
          2,
          undefined,
          undefined
        );
      }
    }
    return merchantArray.concat(adminArray);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create Feedback Json
const creatFeedbackJson = async (json, role, mobile, storeId) => {
  try {
    // Variable
    let option = [];
    const jsonArray = json.map(async (feed, index) => {
      // Block
      let lowerObject = {};
      if (role === 1) {
        option = await databaseController.readFeedbackOption(
          mobile,
          storeId,
          feed.feed_ques_id,
          1
        );
      } else {
        option = await feedbackOptionModel.readAdminFeedbackOption(
          "*",
          feed.feed_ques_id,
          1
        );
      }

      lowerObject.feedback_id = feed.feed_ques_id;
      lowerObject.feedback_question = feed.feed_question;
      lowerObject.feedback_input_id = feed.input_id;
      lowerObject.feedback_input_name = feed.input_name;
      lowerObject.role_id = role;

      // Zero Means No Record
      if (option.length === 0) {
        lowerObject.feedback_option = [];
      } else {
        // Create Feedback Option Json
        lowerObject.Feedback_Option = createFeedbackOptionJson(option);
      }

      return lowerObject;
    });

    return await Promise.all(jsonArray);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create Feedback Option Json
const createFeedbackOptionJson = json => {
  // Variable
  let upperArray = [];
  json.map(async (option, index) => {
    // Block Variable Declaration
    let lowerobject = {};

    lowerobject.feedback_option_id = option.feed_option_id;
    lowerobject.feedback_option = option.option_value;
    lowerobject.feedback_id = option.feed_ques_id;

    // Push Array
    upperArray.push(lowerobject);
  });

  return upperArray;
};

// Logic Get Survey Data
module.exports.logicGetSurvey = async (
  merchantVersion,
  senseVersion,
  mobile,
  storeId
) => {
  try {
    // Intialize
    let responsedata = {};
    let merchantFlag = false;
    let senseFlag = false;

    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Parallel Merchant and Sense Constant
    const parallel = await Promise.all([
      databaseController.readConstantRecordName(
        "*",
        mobile,
        storeId,
        "CUSTOMER_SURVEY_APP_VERSION",
        1
      ),
      senseConstModel.readSenseConstant("*", "CUSTOMER_SURVEY_APP_VERSION", 1)
    ]);

    if (parallel.length === 0) {
      return Promise.reject("Oops our bad!!!");
    }

    // Merchant app version
    if (merchantVersion === parseFloat(parallel[0][0].value)) {
      merchantFlag = true;
    } else {
      merchantVersion = parseFloat(parallel[0][0].value);
    }

    // Admin app version
    if (senseVersion === parseFloat(parallel[1][0].value)) {
      senseFlag = true;
    } else {
      senseVersion = parseFloat(parallel[1][0].value);
    }

    // Both flag true then return
    if (merchantFlag && senseFlag) {
      return (responsedata = {
        success: true,
        msg: "Upto date"
      });
    }

    // Logic Read Survey
    const survey = await logicReadSurvey(
      mobile,
      storeId,
      merchantFlag,
      senseFlag
    );

    return (responsedata = {
      success: true,
      msg: survey,
      sense_version: senseVersion,
      merchant_version: merchantVersion
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Read Survey
const logicReadSurvey = async (mobile, storeId, merchantFlag, senseFlag) => {
  try {
    // Variable
    let jsonArray = [];
    let merchantArray = [];
    let adminArray = [];

    // Parallel
    await Promise.all([
      databaseController.createSurveyQuestionTable(mobile, storeId),
      databaseController.createSurveyOptionTable(mobile, storeId),
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId),
      databaseController.createSurveyStoreTable(mobile, storeId)
    ]);

    // Merchant Version
    if (!merchantFlag) {
      const merchantFeed = await databaseController.readSurveyQuestion(
        mobile,
        storeId,
        1
      );

      if (merchantFeed.length !== 0) {
        // Create Survey Json
        merchantArray = await creatSurveyJson(merchantFeed, 1, mobile, storeId);
      }
    }

    // Admin Version
    if (!senseFlag) {
      const adminFeed = await surveyModel.readAdminSurveyQuestion(
        "survey_questions.survey_ques_id, survey_questions.survey_question, survey_questions.input_id, input_types.input_name",
        mobile,
        1
      );

      if (adminFeed.length !== 0) {
        // Create Survey Json
        adminArray = await creatSurveyJson(adminFeed, 2, undefined, undefined);
      }
    }
    return merchantArray.concat(adminArray);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create Survey Json
const creatSurveyJson = async (json, role, mobile, storeId) => {
  try {
    // Variable
    let option = [];
    const jsonArray = json.map(async (survey, index) => {
      // Block
      let lowerObject = {};
      if (role === 1) {
        option = await databaseController.readSurveyOption(
          mobile,
          storeId,
          survey.survey_ques_id,
          1
        );
      } else {
        option = await surveyOptionModel.readAdminSurveyOption(
          "*",
          survey.survey_ques_id,
          1
        );
      }

      lowerObject.survey_id = survey.survey_ques_id;
      lowerObject.survey_question = survey.survey_question;
      lowerObject.survey_input_id = survey.input_id;
      lowerObject.survey_input_name = survey.input_name;
      lowerObject.role_id = role;

      // Zero Means No Record
      if (option.length === 0) {
        lowerObject.survey_option = [];
      } else {
        // Create Survey Option Json
        lowerObject.survey_Option = createSurveyOptionJson(option);
      }

      return lowerObject;
    });

    return await Promise.all(jsonArray);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create Survey Option Json
const createSurveyOptionJson = json => {
  // Variable
  let upperArray = [];
  json.map(async (option, index) => {
    // Block Variable Declaration
    let lowerobject = {};

    lowerobject.survey_option_id = option.survey_option_id;
    lowerobject.survey_option = option.option_value;
    lowerobject.survey_id = option.survey_ques_id;

    // Push Array
    upperArray.push(lowerobject);
  });

  return upperArray;
};

// Logic Customer Data
module.exports.logicCustomerData = async (customerVersion, mobile, storeId) => {
  try {
    // Intialize
    let responsedata = {};

    // Merchant Constant Table Exist
    const senseConstant = await databaseController.showConstantTable(
      mobile,
      storeId
    );

    // Zero Means Empty Record
    if (senseConstant.length === 0) {
      // Create Merchant Constant Store Table
      await databaseController.createConstantTable(mobile, storeId);

      // Logic Keep Merchant Constant
      await logicMerchantConstant(mobile, storeId);
    }

    // Read Constant Record
    const constant = await databaseController.readConstantRecordName(
      "*",
      mobile,
      storeId,
      "CUSTOMER_IDENTITY_APP_VERSION",
      1
    );

    if (constant.length === 0) {
      return Promise.reject("Oops our bad!!!");
    }

    // Customer version
    if (customerVersion === parseFloat(constant[0].value)) {
      return (responsedata = {
        success: true,
        msg: "Upto date"
      });
    } else {
      customerVersion = parseFloat(constant[0].value);
    }

    // Parallel
    await Promise.all([
      databaseController.createCustomerIdentityTable(mobile, storeId),
      databaseController.createCustomerAddressTable(mobile, storeId)
    ]);

    // Read Merchant Customer Idenitity Record
    const record = await databaseController.readCustomerIdentityRecord(
      mobile,
      storeId,
      1
    );

    return (responsedata = {
      success: true,
      msg: record,
      customer_version: customerVersion
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Device Data
module.exports.logicDeviceData = async (deviceJson, mobile, storeId) => {
  try {
    // Intialize
    let responsedata = {};

    deviceJson.map((json, index) => {
      if (
        json.hasOwnProperty("latitude") &&
        json.hasOwnProperty("longitude") &&
        json.hasOwnProperty("brand") &&
        json.hasOwnProperty("device") &&
        json.hasOwnProperty("model") &&
        json.hasOwnProperty("app_id") &&
        json.hasOwnProperty("version_sdk") &&
        json.hasOwnProperty("version_release") &&
        json.hasOwnProperty("sense_version_number")
      ) {
        // Keep Device Detail
        deviceModel.keepDeviceDetail(
          mobile,
          storeId,
          json.latitude,
          json.longitude,
          json.brand,
          json.device,
          json.model,
          json.app_id,
          json.version_sdk,
          json.version_release,
          json.sense_version_number
        );
      }
    });

    return (responsedata = {
      success: true,
      msg: "Succesful"
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Logic Keep Merchant Constant
const logicMerchantConstant = async (mobile, storeId) => {
  try {
    // Block Variable
    const seed = [];
    let responsedata = {};

    seed.push({
      name: "CUSTOMER_FEEDBACK_APP_VERSION",
      value: "1.0",
      comment: null,
      status: 1
    });
    seed.push({
      name: "CUSTOMER_SURVEY_APP_VERSION",
      value: "1.0",
      comment: null,
      status: 1
    });
    seed.push({
      name: "CUSTOMER_IDENTITY_APP_VERSION",
      value: "1.0",
      comment: null,
      status: 1
    });

    seed.map(async (json, index) => {
      // Keep Merchant Constant Table
      await databaseController.keepMerchantConstantTable(
        mobile,
        storeId,
        json.name,
        json.value,
        json.comment,
        json.status
      );
    });

    return (responsedata = {
      success: true,
      msg: "Succesful"
    });
  } catch (error) {
    return Promise.reject(error);
  }
};