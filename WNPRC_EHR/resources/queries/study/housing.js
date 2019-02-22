require("ehr/triggers").initScript(this);

function onComplete(event, errors, helper){
    var housingRows = helper.getRows();

    //this object will be used to group animals by which cage they're being moved into
    var groupedByCage = {};
    if (housingRows){
        for (var i=0;i<housingRows.length;i++){
            if (housingRows[i].row.reason === 'Breeding' && !housingRows[i].row.enddate) {
                EHR.Server.Utils.findDemographics({
                    participant: housingRows[i].row.Id,
                    helper: helper,
                    scope: this,
                    callback: function (data) {
                        if (data) {
                            //get the gender for each animal being moved and only process them if they have a gender
                            if (data['gender/origGender']) {
                                housingRows[i].row.gender = data['gender/origGender'];
                                if (!groupedByCage[housingRows[i].row.room + housingRows[i].row.cage]) {
                                    groupedByCage[housingRows[i].row.room + housingRows[i].row.cage] = [];
                                }
                                groupedByCage[housingRows[i].row.room + housingRows[i].row.cage].push(housingRows[i].row);
                            }
                        }
                    }
                });
            } else if (housingRows[i].row.reason === 'Breeding ended' && !housingRows[i].row.enddate) {
                EHR.Server.Utils.findDemographics({
                    participant: housingRows[i].row.Id,
                    helper: helper,
                    scope: this,
                    callback: function (data) {
                        if (data) {
                            //get the gender for each animal being moved and only process them if they are female
                            if (data['gender/origGender'] && data['gender/origGender'] === 'f') {
                                LABKEY.Query.selectRows({
                                    schemaName: 'study',
                                    queryName: 'breeding_encounters',
                                    //columns: 'lsid',
                                    filterArray: [
                                            LABKEY.Filter.create('Id', housingRows[i].row.Id, LABKEY.Filter.Types.EQUAL),
                                            LABKEY.Filter.create('QCState', EHR.Server.Security.getQCStateByLabel('In Progress').RowId, LABKEY.Filter.Types.EQUAL)
                                    ],
                                    sort: 'date',
                                    scope: this,
                                    success: function(results) {
                                        if (results.rows && results.rows.length) {
                                            var row = results.rows[0];
                                            row.enddate = new Date(housingRows[i].row.date.time)
                                            row.ejaculation = housingRows[i].row.ejacConfirmed;
                                            row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;

                                            console.log('Row: ' + JSON.stringify(row));
                                            var updateRows = [];
                                            updateRows.push(row);
                                            console.log('updateRows: ' + JSON.stringify(updateRows));

                                            LABKEY.Query.updateRows({
                                                schemaName: 'study',
                                                queryName: 'breeding_encounters',
                                                rows: updateRows,
                                                scope: this,
                                                success: function(){
                                                    console.log('breeding_encounters record successfully updated');
                                                },
                                                failure: function (error) {
                                                    console.log(JSON.stringify(error));
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
        //this object will have a property for each 'encounter' that occurred
        var breeding_encounters = {};

        for(var cageIndex in groupedByCage) {
            if (groupedByCage.hasOwnProperty(cageIndex)) {
                for (var i = 0; i < groupedByCage[cageIndex].length; i++) {
                    if (groupedByCage[cageIndex][i].gender === 'f') {
                        if (!breeding_encounters[groupedByCage[cageIndex][i].Id]) {
                            breeding_encounters[groupedByCage[cageIndex][i].Id] = [];
                        }
                        breeding_encounters[groupedByCage[cageIndex][i].Id].push(groupedByCage[cageIndex][i]);
                        for (var j = 0; j < groupedByCage[cageIndex].length; j++) {
                            if (groupedByCage[cageIndex][j].gender === 'm') {
                                breeding_encounters[groupedByCage[cageIndex][i].Id].push(groupedByCage[cageIndex][j]);
                            }
                        }
                    }
                }
            }
        }

        var insertRows = [];
        for(var femaleId in breeding_encounters) {
            if (breeding_encounters.hasOwnProperty(femaleId)) {
                var sireid = '';
                var remark = breeding_encounters[femaleId][0].Id + ': ' + breeding_encounters[femaleId][0].remark + '\n';
                for(var i = 1; i < breeding_encounters[femaleId].length; i++) {
                    sireid += breeding_encounters[femaleId][i].Id;
                    remark += breeding_encounters[femaleId][i].Id + ': ' + breeding_encounters[femaleId][i].remark + '\n';
                    if (breeding_encounters[femaleId].length - i > 1) {
                        sireid += ',';
                    }
                }
                var date = new Date(breeding_encounters[femaleId][0].date.time);
                var encounter = {
                    Id: breeding_encounters[femaleId][0].Id,
                    sireid: sireid,
                    date: date,
                    project: breeding_encounters[femaleId][0].project,
                    QCState: EHR.Server.Security.getQCStateByLabel('In Progress').RowId,
                    performedby: breeding_encounters[femaleId][0].performedby,
                    remark: remark
                }
                insertRows.push(encounter);
            }
        }

        console.log('insertRows: ' + JSON.stringify(insertRows));
        LABKEY.Query.insertRows( {
            schemaName : 'study',
            queryName : 'breeding_encounters',
            rows : insertRows,
            success: function (data) {
                console.log('success');
                if (data && data.rows) {
                    //nothing
                }
            },
            failure : EHR.Server.Utils.onFailure
        });
    }
}