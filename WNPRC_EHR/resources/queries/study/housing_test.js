var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

require("ehr/triggers").initScript(this);

function onInit(event, helper) {
    helper.setScriptOptions({
        skipHousingCheck: true
    });

    helper.decodeExtraContextProperty('housingInTransaction');
}

function onUpsert(helper, scriptErrors, row, oldRow){
    let breedingDataSaved = helper.getProperty('breedingEncountersSaved');

    if (row.date){
        row.date.setSeconds(0);
    }

    if (row.enddate){
        row.enddate.setSeconds(0);
    }

    if (row.reason) {
        let reasons = row.reason.split(',');
        let breeding = false;
        let breedingEnded = false;
        let none = false;
        for (let i = 0; i < reasons.length; i++) {
            console.log("Reason: ", reasons[i]);
            if (reasons[i] === 'Breeding') {
                breeding = true;
            } else if (reasons[i] === 'Breeding ended') {
                breedingEnded = true;
            } else if (reasons[i] === '') {
                none = true;
            }
        }
        if (breeding && breedingEnded) {
            EHR.Server.Utils.addError(scriptErrors, 'reason', 'Reason For Move cannot contain both \'Breeding\' and \'Breeding ended\'.', 'ERROR');
        }
        if (none && reasons.length > 1) {
            EHR.Server.Utils.addError(scriptErrors, 'reason', '\'[none]\' cannot be used in tandem with another reason.');
        }
    }

    if (helper.isValidateOnly() || (!helper.isValidateOnly() && !breedingDataSaved)) {
        let housingRows = this.extraContext["housingRows"];
        let event = this.extraContext["event"];
        let housingArray = [];

        var housingRowArray = [];
        for (var key in housingRows) {
            if (housingRows.hasOwnProperty(key)) {
                housingRowArray.push(housingRows[key]);
            }
        }

        //loop through all housing change rows and add them to the housing array
        //if they have all of the correct fields filled in.
        for (var i = 0; i < housingRowArray.length; i++) {
            var rowObj = housingRowArray[i];
            // Check if required fields are present and valid
            if (
                    event === 'insert' &&
                    !rowObj.enddate &&  // falsy: null/undefined
                    rowObj.reason &&
                    rowObj.room &&
                    rowObj.cageNew &&
                    rowObj.date &&
                    rowObj.id
            ) {
                // Convert date to Date object
                var dateParts = rowObj.date.split(/[\/\- :]/); // split on /, -, space, or :
                // dateParts = ["2026", "11", "11", "10", "27", "31"]

                if (dateParts.length < 6) {
                    console.warn("Invalid date format (expected YYYY-MM-DD HH:MM:SS):", dateStr);
                    return;
                }

                var year = parseInt(dateParts[0], 10);
                var month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
                var day = parseInt(dateParts[2], 10);
                var hour = parseInt(dateParts[3], 10);
                var minute = parseInt(dateParts[4], 10);
                var second = parseInt(dateParts[5], 10);

                // Basic sanity checks
                if (
                        month < 0 || month > 11 ||
                        day < 1 || day > 31 ||
                        hour < 0 || hour > 23 ||
                        minute < 0 || minute > 59 ||
                        second < 0 || second > 59
                ) {
                    console.warn("Invalid date values:", dateStr);
                    return;
                }

                // Add required context fields
                var processedRow = {};
                for (var prop in rowObj) {
                    if (rowObj.hasOwnProperty(prop)) {
                        processedRow[prop] = rowObj[prop];
                    }
                }

                processedRow.date = new Date(year, month, day, hour, minute, second).getTime();
                processedRow.currentId = row.id;
                processedRow.validateOnly = helper.isValidateOnly();

                housingArray.push(processedRow);
            }
        }

        //call java method to create the breeding encounter records from the housing changes
        //add any errors that are returned to the page
        if (housingArray.length > 0) {
            let javaErrors = WNPRC.Utils.getJavaHelper().createBreedingRecordsFromHousingChanges(housingArray);
            if (javaErrors) {
                for (let i = 0; i < javaErrors.length; i++) {
                    let error = javaErrors[i];
                    console.log('Field: ' + error.field + ', Message: ' + error.message + ', Severity: ' + error.severity);
                    EHR.Server.Utils.addError(scriptErrors, error.field, error.message, error.severity);
                }
            }
        }

        //set data saved to true so that it doesn't save for every row
        //this is necessary because we're saving everything all at once
        helper.setProperty('breedingEncountersSaved', true);
    }
}

function onComplete(event, errors, helper){
    helper.closeRecordsOnComplete(false);
}