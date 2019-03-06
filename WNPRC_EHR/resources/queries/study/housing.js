require("ehr/triggers").initScript(this);

//TODO removed console output
function onComplete(event, errors, helper){
    let housingRows = helper.getRows();

    //this object will be used to group animals by which cage they're being moved into
    let groupedByCage = {};
    if (housingRows){
        for (let i = 0; i < housingRows.length; i++){
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
                                    columns: 'lsid,sireid,remark',
                                    filterArray: [
                                            LABKEY.Filter.create('Id', housingRows[i].row.Id, LABKEY.Filter.Types.EQUAL),
                                            LABKEY.Filter.create('QCState', EHR.Server.Security.getQCStateByLabel('In Progress').RowId, LABKEY.Filter.Types.EQUAL)
                                    ],
                                    sort: 'date',
                                    scope: this,
                                    success: function(results) {
                                        if (results.rows && results.rows.length) {
                                            let row = results.rows[0];

                                            let remark = 'Breeding Ended\n';
                                            let remarkFound = false;

                                            if (!!housingRows[i].row.remark) {
                                                remarkFound = true;
                                                remark += housingRows[i].row.Id + ': ' + housingRows[i].row.remark + '\n';
                                            }
                                            //TODO figure out why sire remarks aren't being recorded!!
                                            let sireList = row.sireid.split(",");
                                            for (let sireId in sireList) {
                                                for (let j = 0; j < housingRows.length; j++) {
                                                    if (housingRows[j].row.Id === sireId && housingRows[j].row.reason === 'Breeding ended') {
                                                        if (!!housingRows[j].row.remark) {
                                                            remarkFound = true;
                                                            remark += sireId + ': ' + housingRows[j].row.remark + '\n';
                                                        }
                                                    }
                                                }
                                            }

                                            row.enddate = new Date(housingRows[i].row.date.time);
                                            row.ejaculation = housingRows[i].row.ejacConfirmed;
                                            row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;
                                            if (remarkFound) {
                                                row.remark += remark;
                                            }

                                            let updateRows = [];
                                            updateRows.push(row);
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
        let breeding_encounters = {};

        for(let cageIndex in groupedByCage) {
            if (groupedByCage.hasOwnProperty(cageIndex)) {
                for (let i = 0; i < groupedByCage[cageIndex].length; i++) {
                    if (groupedByCage[cageIndex][i].gender === 'f') {
                        if (!breeding_encounters[groupedByCage[cageIndex][i].Id]) {
                            breeding_encounters[groupedByCage[cageIndex][i].Id] = [];
                        }
                        breeding_encounters[groupedByCage[cageIndex][i].Id].push(groupedByCage[cageIndex][i]);
                        for (let j = 0; j < groupedByCage[cageIndex].length; j++) {
                            if (groupedByCage[cageIndex][j].gender === 'm') {
                                breeding_encounters[groupedByCage[cageIndex][i].Id].push(groupedByCage[cageIndex][j]);
                            }
                        }
                    }
                }
            }
        }

        let insertRows = [];
        for(let femaleId in breeding_encounters) {
            if (breeding_encounters.hasOwnProperty(femaleId)) {
                let sireid = '';
                let remark = 'Breeding Started\n';
                let remarkFound = false;
                if (!!breeding_encounters[femaleId][0].remark) {
                    remarkFound = true;
                    remark += breeding_encounters[femaleId][0].Id + ': ' + breeding_encounters[femaleId][0].remark + '\n';
                }
                for(let i = 1; i < breeding_encounters[femaleId].length; i++) {
                    sireid += breeding_encounters[femaleId][i].Id;
                    if (!!breeding_encounters[femaleId][i].remark) {
                        remarkFound = true;
                        remark += breeding_encounters[femaleId][i].Id + ': ' + breeding_encounters[femaleId][i].remark + '\n';
                    }
                    if (breeding_encounters[femaleId].length - i > 1) {
                        sireid += ',';
                        remark += '\n';
                    }
                }
                remark = remarkFound ? remark : '';
                let date = new Date(breeding_encounters[femaleId][0].date.time);
                let encounter = {
                    Id: breeding_encounters[femaleId][0].Id,
                    sireid: sireid,
                    date: date,
                    project: breeding_encounters[femaleId][0].project,
                    QCState: EHR.Server.Security.getQCStateByLabel('In Progress').RowId,
                    performedby: breeding_encounters[femaleId][0].performedby,
                    remark: remark
                };
                insertRows.push(encounter);
            }
        }

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