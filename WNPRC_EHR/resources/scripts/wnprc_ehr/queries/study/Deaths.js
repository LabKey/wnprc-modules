var console = require("console");
var LABKEY = require("labkey");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

// noinspection JSUnresolvedVariable
exports.registerTriggers = function (EHR, registerGenericHandler, Events) {
    var registerHandler = function (event, callback) {
        registerGenericHandler(event, "study", "Deaths", callback);
    };

    registerHandler(Events.COMPLETE, function (event, errors, helper) {
        var ids = helper.getRows().map(function (row) {
            return row.row.id;
        });

        // Trigger the update through Java.
        // noinspection JSUnresolvedFunction
        WNPRC.Utils.getJavaHelper().sendDeathNotification(ids);

        if (helper.getPublicParticipantsModified().length && !helper.isETL()) {
            var generateAnEmail = 0;
            var valuesMap = {};
            var r;
            for (var i = 0; i < helper.getRows().length; i++) {
                r = helper.getRows()[i];
                console.log('value of r.account ' + r.row.account);
                valuesMap[r.row.Id] = {};
                valuesMap[r.row.Id].death = r.row.date;
                valuesMap[r.row.Id].animalNumber = r.row.Id;
                if (r.row.necropsy) {
                    //populate the enddate
                    valuesMap[r.row.Id].enteredGrant = r.row.account;
                    valuesMap[r.row.Id].project = r.row.project;
                }

                valuesMap[r.row.Id].notified = hasAnimalNotificationBeenSent(r.row.Id);
                if (valuesMap[r.row.Id].notified <= 0) {
                    generateAnEmail += 1;
                }
                else {
                    console.log('else in the verifyAssignment');
                    verifyAssignmentUpdate(valuesMap[r.row.Id]);
                }
            }

            if (generateAnEmail > 0 || helper.getExtraContext().resendEmail) {
                for (var j = 0; j < helper.getRows().length; j++) {
                    r = helper.getRows()[j];
                    if (valuesMap[r.row.Id].notified) {
                        continue;
                    }

                    var aDate = new Date(valuesMap[r.row.Id].death.getTime());
                    var monthString = EHR.Server.Utils.getMonthString(aDate.getMonth());
                    var minStr = aDate.getMinutes() >= 10 ? aDate.getMinutes() : '0' + aDate.getMinutes();
                    valuesMap[r.row.Id].deathDate = aDate.getDate() + ' ' + monthString + ' ' + aDate.getFullYear();
                    valuesMap[r.row.Id].deathTime = aDate.getHours() + ':' + minStr;
                    valuesMap[r.row.Id].animalNumber = r.row.Id;
                    valuesMap[r.row.Id].manner = r.row.manner;
                    valuesMap[r.row.Id].necropsy = r.row.necropsy;

                    if (r.row.necropsy && r.row.weight) {
                        //populate the enddate
                        addIndication(r.row.Id);
                        valuesMap[r.row.Id].weight = r.row.weight;
                        valuesMap[r.row.Id].enteredGrant = r.row.account;
                    }
                    valuesMap[r.row.Id].cause = r.row.cause;

                    //Get weight for animal
                    if (!r.row.necropsy) {
                        LABKEY.Query.selectRows({
                            schemaName: 'study',
                            queryName: 'Weight',
                            filterArray: [
                                LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL)
                            ],
                            scope: this,
                            success: function (data) {
                                if (data.rows && data.rows.length) {
                                    var wRow = data.rows[0];
                                    valuesMap[r.row.Id].weight = wRow.weight;
                                }
                            }
                        });
                    }

                    //Get Grant Number(s)
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: 'assignment',
                        filterArray: [LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL),
                            LABKEY.Filter.create('enddate', r.row.date, LABKEY.Filter.Types.DATE_EQUAL)
                        ],
                        scope: this,
                        success: function (data) {
                            if (data && data.rows.length) {
                                if (data.rows.length > 1) {
                                    valuesMap[r.row.Id].grant = [];
                                    for (var x = 0; x < data.rows.length; x++) {
                                        LABKEY.Query.selectRows({
                                            schemaName: 'ehr',
                                            queryName: 'project',
                                            filterArray: [
                                                LABKEY.Filter.create('project', data.rows[x].project, LABKEY.Filter.Types.EQUAL)
                                            ],
                                            scope: this,
                                            success: function (data) {
                                                if (data && data.rows.length) {
                                                    valuesMap[r.row.Id].grant.push(data.rows[0].account);
                                                    console.log('added ' + data.rows[0].account + ' to list of grantNumbers for ' + r.row.Id);
                                                }
                                            }
                                        });

                                    }
                                } else {
                                    LABKEY.Query.selectRows({
                                        schemaName: 'ehr',
                                        queryName: 'project',
                                        filterArray: [
                                            LABKEY.Filter.create('project', data.rows[0].project, LABKEY.Filter.Types.EQUAL)
                                        ],
                                        scope: this,
                                        success: function (data) {
                                            if (data && data.rows.length) {
                                                valuesMap[r.row.Id].grant = data.rows[0].account;
                                                console.log(data.rows[0].account + ' is the sole grant number associated with ' + r.row.Id);
                                            }
                                        }
                                    });

                                }
                            }
                        }
                    });

                    //Get Necropsy Date
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: 'necropsy',
                        filterArray: [LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL)],
                        scope: this,
                        success: function (data) {
                            if (data && data.rows.length) {
                                var nDate = data.rows[0].date;
                                aDate = new Date(nDate);
                                monthString = EHR.Server.Utils.getMonthString(aDate.getMonth());
                                valuesMap[r.row.Id].necropsyDate = aDate.getDate() + ' ' + monthString + ' ' + aDate.getFullYear();
                                if (valuesMap[r.row.Id].enteredGrant === undefined || valuesMap[r.row.Id].enteredGrant == null) {
                                    console.log('No grant number supplied... defaulting to: ' + data.rows[0].account);
                                    valuesMap[r.row.Id].enteredGrant = data.rows[0].account;
                                }
                            } else {
                                var aDate = new Date(r.row.necropsyDate);
                                var monthString = EHR.Server.Utils.getMonthString(aDate.getMonth());
                                valuesMap[r.row.Id].necropsyDate = aDate.getDate() + ' ' + monthString + ' ' + aDate.getFullYear();
                            }
                        }
                    });
                    //Get Gender & replacement Fee
                    var gCode = null;
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: 'demographics',
                        scope: this,
                        filterArray: [LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL)],
                        success: function (data) {
                            if (data && data.rows.length) {
                                var gRow = data.rows[0];
                                console.log('value of gender:' + gRow.gender);
                                gCode = gRow.gender;
                                if (gRow.prepaid && gRow.prepaid.length) {
                                    valuesMap[r.row.Id].fee = 'Animal replacement fee was paid by ' + gRow.prepaid;
                                } else {
                                    valuesMap[r.row.Id].fee = 'Animal replacement fee to be paid (not prepaid animal)';
                                }
                            }
                        }
                    });
                    if (gCode == null) {
                        //request for specify gender of the animal
                        EHR.Server.Utils.addError(errors, 'gender', 'please add gender', 'INFO');
                        console.log('no gender');
                    }
                    LABKEY.Query.selectRows({
                        schemaName: 'ehr_lookups',
                        queryName: 'gender_codes',
                        scope: this,
                        filterArray: [LABKEY.Filter.create('code', gCode, LABKEY.Filter.Types.EQUAL)],
                        success: function (data) {
                            if (data && data.rows.length) {
                                var gRow = data.rows[0];
                                valuesMap[r.row.Id].gender = gRow.meaning;
                            }
                        }
                    });


                }
                var theMsg = "";
                var recipients = [];
                for (var k in valuesMap) {
                    var obj = valuesMap[k];
                    if (obj.notified) {
                        continue;
                    }
                    theMsg += "Necropsy Number:            " + obj.necropsy + "<br> ";
                    theMsg += "Necropsy Date  :            " + obj.necropsyDate + "<br>";
                    theMsg += "Animal Number  :            " + obj.animalNumber + "<br>";
                    theMsg += "Weight:                     " + obj.weight + " kg <br>";
                    theMsg += "Sex:                        " + obj.gender + "<br>";
                    theMsg += "Date of Death:              " + obj.deathDate + "<br>";
                    theMsg += "Time of Death:              " + obj.deathTime + "<br>";
                    theMsg += "Death:                      " + obj.cause + "<br>";
                    theMsg += "Grant #:                    " + obj.enteredGrant + "<br>";
                    if (obj.cause === 'Clinical') {
                        //Clinical Deaths get the following hard-coded animal replacement fee text
                        theMsg += "Animal Replacement Fee:     " + "No Animal replacement fee to be paid (clinical death) <br>";
                    } else {
                        theMsg += "Animal Replacement Fee:     " + obj.fee + "<br>";
                    }
                    theMsg += "Manner of Death:            " + obj.manner + "<br> <br> ";
                }
                var openingLine;
                if (generateAnEmail > 1) {
                    openingLine = 'The following animals have been marked as dead:<br><br>';
                } else {
                    openingLine = 'The following animal has been marked as dead:<br><br>';
                }
                EHR.Server.Utils.sendEmail({
                    notificationType: 'Animal Death',

                    msgContent: openingLine +
                    theMsg +
                    '<p></p><a href="' + LABKEY.ActionURL.getBaseURL() + 'ehr' + LABKEY.ActionURL.getContainer() + '/animalHistory.view#inputType:multiSubject&subjects:' + helper.getPublicParticipantsModified().join(';') + '&combineSubj:true&activeReport:abstract' +
                    '">Click here to view them</a>.',
                    msgSubject: 'Death Notification',
                    recipients: recipients
                });
            }
        }
        function hasAnimalNotificationBeenSent(animalID) {
            var retValue = 0;
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'Deaths',
                filterArray: [
                    LABKEY.Filter.create('Id', animalID, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
                ],
                scope: this,
                success: function (data) {
                    if (data && data.rows && data.rows.length) {
                        console.log('No notification of the death of animal ' + animalID + ' has been created.');
                    } else {
                        console.log("Notification was sent");
                        retValue = 1;
                    }
                }
            });
            return retValue;
        }

        function addIndication(animalID) {
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'Deaths',
                filterArray: [
                    LABKEY.Filter.create('Id', animalID, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
                ],
                scope: this,
                success: function (data) {
                    if (data && data.rows && data.rows.length) {
                        console.log('No notification of the death of animal ' + animalID + ' has been created.');
                        var r = data.rows[0];
                        var obj = {
                            Id: r.Id,
                            //project: r.project,
                            date: r.date,
                            cause: r.causeofdeath,
                            manner: r.mannerofdeath,
                            necropsy: r.caseno,
                            parentid: r.objectid,
                            lsid: r.lsid,
                            enddate: r.date
                        };
                        //update the row
                        LABKEY.Query.updateRows({
                            schemaName: 'study',
                            queryName: 'Deaths',
                            scope: this,
                            rows: [obj],
                            success: function () {
                                console.log('Success updating ' + animalID + ' in death table');
                            },
                            failure: EHR.Server.Utils.onFailure
                        });
                    }
                }
            });
        }
        function verifyAssignmentUpdate(subject) {
            //Verify that animal is in no active assignments
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'Assignment',
                filterArray: [
                    LABKEY.Filter.create('Id', subject.animalNumber, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
                ],
                scope: this,
                success: function (data) {
                    if (data && data.rows && data.rows.length) {
                        console.log(data.rows.length + ' entries');
                        var row;
                        for (var idx = 0; idx < data.rows.length; idx++) {
                            row = data.rows[idx];
                            var x = subject.death.toGMTString();
                            var obj = {lsid: row.lsid, Id: subject.animalNumber, enddate: x};
                            //Update row in assignment table with an enddate
                            LABKEY.Query.updateRows({
                                schemaName: 'study',
                                queryName: 'Assignment',
                                scope: this,
                                rows: [obj],
                                success: function () {
                                    console.log('Success verifying assignments for ' + subject.animalNumber);
                                },
                                failure: EHR.Server.Utils.onFailure
                            });

                        }

                    }
                    console.log(subject.animalNumber + '  assignment termination verified');
                }
            });
        }
    });

};