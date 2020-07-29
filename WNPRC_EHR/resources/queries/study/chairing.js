require("ehr/triggers").initScript(this);
require ("labkey");

function onInit(event, helper){

}
function onUpsert(helper, scriptErrors, row, oldRow){

    var startChairing = new Date (row.chairingStartTime.toGMTString());
    var endChairing = new Date (row.chairingEndTime.toGMTString());


    var _MS_PER_HOUR = 1000 * 60 * 60;

    var timeDifference = parseInt(Math.ceil((endChairing - startChairing)/_MS_PER_HOUR));

    if (timeDifference >12){

        EHR.Server.Utils.addError(scriptErrors, 'chairingEndTime', 'An animal cannot be chaired for longer than 12 hours', 'ERROR');

    }
    if (timeDifference == 0){
        EHR.Server.Utils.addError(scriptErrors, 'chairingEndTime', 'Chairing End time cannot be the same as Start time', 'ERROR');
    }

    console.log ('chairing start time: '+ startChairing);
    console.log ('chairing end time: '+ endChairing);

    if (endChairing < startChairing){
        EHR.Server.Utils.addError(scriptErrors,'chairingEndTime', 'End time cannot be before the Start time', 'ERROR');
    }


}