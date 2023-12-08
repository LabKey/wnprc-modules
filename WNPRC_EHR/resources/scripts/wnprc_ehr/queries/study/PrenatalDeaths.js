// const console = require("console");
// var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
//
// // noinspection JSUnresolvedVariable
// exports.registerTriggers = function (EHR, registerGenericHandler, Events) {
//     var registerHandler = function (event, callback) {
//         registerGenericHandler(event, "study", "prenatal", callback);
//     };
//
//     registerHandler(Events.COMPLETE, function (event, errors, helper) {
//         console.log("PrenatalDeaths.js: ONCOMPLETE (incorrect version)");
//
//         var ids = helper.getRows().map(function (row) {
//             return row.row.id;
//         });
//
//         // Trigger the update through Java.
//         // noinspection JSUnresolvedFunction
//         WNPRC.Utils.getJavaHelper().sendDeathNotification(ids);
//     });
// };