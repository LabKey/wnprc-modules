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

    if (row.reason) {
        let reasons = row.reason.split(',');
        let breeding = false;
        let breedingEnded = false;
        let none = false;
        for (let i = 0; i < reasons.length; i++) {
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
        let housingRows = helper.getProperty('housingInTransaction');
        let housingArray = [];

        //loop through all housing change rows and add them to the housing array
        //if they have all of the correct fields filled in.
        for (let propertyName in housingRows) {
            if (housingRows.hasOwnProperty(propertyName)) {
                for (let i = 0; i < housingRows[propertyName].length; i++) {
                    if (housingRows[propertyName][i].event === 'insert' && !housingRows[propertyName][i].enddate
                            && housingRows[propertyName][i].reason && housingRows[propertyName][i].room
                            && housingRows[propertyName][i].cage && housingRows[propertyName][i].date
                            && housingRows[propertyName][i].Id) {
                        housingRows[propertyName][i].date = new Date(housingRows[propertyName][i].date);
                        housingRows[propertyName][i].currentId = row.Id;
                        housingRows[propertyName][i].validateOnly = helper.isValidateOnly();
                        housingArray.push(housingRows[propertyName][i]);
                    }
                }
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