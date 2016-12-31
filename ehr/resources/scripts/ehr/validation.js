/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;
EHR.Server.Security = require("ehr/security").EHR.Server.Security;

/**
 * This class contains static methods used for server-side validation of incoming data.
 * @class
 */
EHR.Server.Validation = {
    /**
     * A helper that adds an error if restraint is used, but no time is entered
     * @param row The row object
     * @param errors The errors object
     */
    checkRestraint: function(row, scriptErrors){
        if (row.restraint && !LABKEY.ExtAdapter.isDefined(row.restraintDuration))
            EHR.Server.Utils.scriptErrors(errors, 'restraintDuration', 'Must enter time restrained', 'INFO');

    },

    /**
     * A helper that will find the next available necropsy or biopsy case number, based on the desired year and type of procedure.
     * @param row The labkey row object
     * @param errors The errors object
     * @param table The queryName (Necropies or Biopsies) to search
     * @param procedureType The single character identifier for the type of procedure.  At time of writing, these were b, c or n.
     */
    calculateCaseno: function(row, errors, table, procedureType){
        //TODO: move to java
        var year = row.date.getYear() + 1900;
        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study."+table+" WHERE caseno LIKE '" + year + procedureType + "%'",
            scope: this,
            success: function(data){
                if (data && data.rows && data.rows.length==1){
                    var caseno = data.rows[0].caseno || 1;
                    caseno++;
                    caseno = EHR.Server.Utils.padDigits(caseno, 3);
                    row.caseno = year + procedureType + caseno;
                }
            },
            failure: EHR.Server.Utils.onFailure
        });

    },

    /**
     * A helper that will verify whether the caseno on the provided row is unique in the given table.
     * @param helper the script helper
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     */
    verifyCasenoIsUnique: function(helper, row, errors){
        //TODO: move to java
        //find any existing rows with the same caseno
        var filterArray = [
            LABKEY.Filter.create('caseno', row.caseno, LABKEY.Filter.Types.EQUAL)
        ];
        if (row.lsid)
            filterArray.push(LABKEY.Filter.create('lsid', row.lsid, LABKEY.Filter.Types.NOT_EQUAL));

        LABKEY.Query.selectRows({
            schemaName: helper.getSchemaName(),
            queryName: helper.getQueryName(),
            filterArray: filterArray,
            scope: this,
            success: function(data){
                if (data && data.rows && data.rows.length){
                    EHR.Server.Utils.addError(errors, 'caseno', 'One or more records already uses the case no: ' + row.caseno, 'INFO');
                }
            },
            failure: EHR.Server.Utils.onFailure
        });
    },

    /**
     * A helper that will flag a date if it is in the future (unless the QCState allows them) or if it is a QCState of 'Scheduled' and has a date in the past.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param helper
     */
    verifyDate: function(row, errors, helper){
        var date = EHR.Server.Utils.normalizeDate(row.date);
        if (!date)
            return;

        var currentTime = new java.util.GregorianCalendar();
        var rowTime = new java.util.GregorianCalendar();
        rowTime.setTimeInMillis(date.getTime());

        //find if the date is greater than now
        if (!helper.isValidateOnly() && !helper.isAllowFutureDates()){
            var timeDiff = (rowTime.getTimeInMillis() - currentTime.getTimeInMillis()) / 1000;
            if (timeDiff > 3600 && !EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).allowFutureDates){
                console.error('Future date: ' + timeDiff + ' / ' + EHR.Server.Utils.datetimeToString(rowTime) + ' / ' + EHR.Server.Utils.datetimeToString(currentTime));
                EHR.Server.Utils.addError(errors, 'date', 'Cannot enter a date in the future', 'ERROR');
            }
        }

        //consider date-only, not date/time
        var currentTimeRounded = new Date(currentTime.getTimeInMillis());
        currentTimeRounded = new Date(currentTimeRounded.getFullYear(), currentTimeRounded.getMonth(), currentTimeRounded.getDate());

        var rowTimeRounded = new Date(rowTime.getTimeInMillis());
        rowTimeRounded = new Date(rowTimeRounded.getFullYear(), rowTimeRounded.getMonth(), rowTimeRounded.getDate());
        var millsDiffRounded = rowTimeRounded.getTime() - currentTimeRounded.getTime();

        if (helper.getEvent() == 'insert' && millsDiffRounded > 6000 && row.QCStateLabel == 'Scheduled'){
            EHR.Server.Utils.addError(errors, 'date', 'Date is in past, but is scheduled', 'WARN');
        }
    },

    /**
     * A helper that will flag any dates more than 1 year in the future or 60 days in the past.
     * @param row The row object, provided by LabKey
     * @param scriptErrors The scriptErrors object, maintined by EHR code
     */
    flagSuspiciousDate: function(row, scriptErrors, helper){
        var date = EHR.Server.Utils.normalizeDate(row.date);
        if (!date)
            return;

        //flag any dates greater than 1 year from now
        var cal1 = new java.util.GregorianCalendar();
        cal1.add(java.util.Calendar.YEAR, 1);
        var cal2 = new java.util.GregorianCalendar();
        cal2.setTimeInMillis(date.getTime());

        if (cal2.after(cal1)){
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Date is more than 1 year in future', 'WARN');
        }

        cal1.add(java.util.Calendar.YEAR, -1); //adjust for the year we added above
        cal1.add(java.util.Calendar.DATE, -60);
        if (cal1.after(cal2)){
            var qc = EHR.Server.Security.getQCState(row);
            if (!qc || !qc.PublicData){
                var severity = helper.allowDatesInDistantPast() ? 'INFO' : 'WARN';
                EHR.Server.Utils.addError(scriptErrors, 'date', 'Date is more than 60 days in past', severity);
            }
        }
    },

    /**
     * A helper that will verify that the ID located in the specified field is female.
     * @param row The row object, provided by LabKey
     * @param errors The errors object, provided by LabKey
     * @param helper The script helper
     * @param targetField The field containing the ID string to verify.
     */
    verifyIsFemale: function(row, errors, helper, targetField){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    if (data['gender/origGender'] && data['gender/origGender'] != 'f')
                        EHR.Server.Utils.addError(errors, (targetField || 'Id'), 'This animal is not female', 'ERROR');
                }
            }
        });
    },

    validateAnimal: function(helper, scriptErrors, row, idProp){
        if (!row[idProp])
            return;

        EHR.Server.Utils.findDemographics({
            participant: row[idProp],
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    if (data.calculated_status != 'Alive' && !helper.isAllowAnyId()){
                        if (data.calculated_status == 'Dead'){
                            if (!helper.isAllowDeadIds())
                                EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + data.calculated_status, 'INFO');
                        }
                        else if (data.calculated_status == 'Shipped'){
                            if (!helper.isAllowShippedIds())
                                EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + data.calculated_status, 'INFO');
                        }
                        else if (data.calculated_status == 'Unknown' || data.calculated_status == null){
                            if (!helper.isAllowAnyId()){
                                if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest) {
                                    EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'ERROR');
                                }
                                // the intent is to allow entry of records to proceed if we have a saved draft birth record.  this allows the ID to get reserved
                                // without creating the full demographics record yet.  it should be allowable to enter data against the ID.
                                else if (data.hasBirthRecord || data.hasArrivalRecord) {
                                    EHR.Server.Utils.addError(scriptErrors, idProp, 'Id has been entered in a birth or arrival form, but this form has not been finalized yet.  This might indicate a problem with the ID: ' + row[idProp], 'INFO');
                                }
                                else {
                                    EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'WARN');
                                }
                            }
                        }
                        else {
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Status of this Id is: ' + (data.calculated_status || 'Unknown'), 'INFO');
                        }
                    }
                }
                else {
                    if (!helper.isAllowAnyId()){
                        if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).isRequest)
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'ERROR');
                        else
                            EHR.Server.Utils.addError(scriptErrors, idProp, 'Id not found in demographics table: ' + row[idProp], 'WARN');
                    }
                }
            }
        });
    }

};