(function() {
    WNPRC_EHR.initQCStates();

    var idFilterConfig = {
        'Id~startswith': 'x'
    };

    var selectAllTestAnimals = function() {
        return Promise.all([
            WebUtils.API.selectRows('study', 'demographics', _.extend({columns: ['Id', 'date']}, idFilterConfig)),
            WebUtils.API.selectRows('study', 'necropsy', idFilterConfig)
        ]);
    };

    var deleteAllTestAnimals = function() {
        return selectAllTestAnimals().then(function(results) {
            return Promise.all(results.filter(function(data) {
                return data && data.rows && data.rows.length > 0;
            }).map(function(data) {
                return WebUtils.API.deleteRows('study', data.queryName, data.rows);
            }));
        });
    };

    var assertAllTestAnimalsAreDeleted = function(assert) {
        return deleteAllTestAnimals().then(selectAllTestAnimals).then(function(results) {
            _.each(results, function(data) {
                assert.equal(data.rows.length, 0, "All test animals from " + data.schemaName + "." + data.queryName + " successfully deleted");
            });
        });
    };

    var Type = {
        WARN: "WARN",
        ERROR: "ERROR",
        INFO: "INFO"
    };

    QUnit.module("Triggers", {
        before: function(assert) {
            var done = assert.async();

            // Ensure that the QC store is loaded ahead of time.
            WNPRC_EHR.qc.when$QCStoreLoads().then(function() {
                done();
            });
        }
    }, function(hooks) {
        QUnit.module("Necropsy Requests", {
            before: function(assert) {
                var done = assert.async();
                var insertSuccessful = true;

                return assertAllTestAnimalsAreDeleted(assert).then(function() {
                    return WebUtils.API.insertRows('study', 'demographics', [
                        {
                            Id: "xr0001",
                            date: WebUtils.API.formatDateForDB(moment().subtract(1, 'year')),
                            gender: 'm'
                        },
                        {
                            Id: "xr0002",
                            date: WebUtils.API.formatDateForDB(moment().subtract(1, 'year')),
                            gender: 'f'
                        }
                    ]);
                }).catch(function() {
                    insertSuccessful = false;
                }).then(function() {
                    assert.ok(insertSuccessful, "Demographics record insert was successful");
                    done();
                });
            },

            after: function(assert) {
                var done = assert.async();

                return assertAllTestAnimalsAreDeleted(assert).then(function() {
                    done();
                });
            }
        }, function(hooks) {
            QUnit.test("Dam", function(assert) {
                var done = assert.async();

                var testRecords = {};
                var addTestRecord = function(rec) {
                    // Generate an objectid
                    var objectid = LABKEY.Utils.generateUUID();

                    // Assign it to a record
                    rec.record.objectid = objectid;

                    // Add the record to our index;
                    testRecords[objectid] = rec;
                };

                addTestRecord({
                    title: "Prevents requests from being submitted for < 10 days in the future",
                    record: {
                        Id: "xr0001",
                        date: WebUtils.API.formatDateForDB(moment().add(1, 'day')),
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Request: Pending")
                    },
                    type: Type.ERROR,
                    regex: /less than 10 days/
                });

                addTestRecord({
                    title: "Forces a dam on prenatal necropsies",
                    record: {
                        Id: "xpd0001",
                        date: WebUtils.API.formatDateForDB(moment().add(11, 'days')),
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Request: Pending"),
                        is_prenatal_necropsy: true
                    },
                    type: Type.ERROR,
                    regex: /dam is required/i
                });

                addTestRecord({
                    title: "Forces a dam on prenatal necropsies to be female",
                    record: {
                        Id: "xpd0002",
                        date: WebUtils.API.formatDateForDB(moment().add(11, 'days')),
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Request: Pending"),
                        is_prenatal_necropsy: true,
                        dam: 'xr0001'
                    },
                    type: Type.ERROR,
                    regex: /female/i
                });

                addTestRecord({
                    title: "Allows a record with a date 11 days out.",
                    record: {
                        Id: "xr0003",
                        date: WebUtils.API.formatDateForDB(moment().add(11, 'days')),
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Request: Pending")
                    },
                    shouldPass: true
                });

                addTestRecord({
                    title: "Allows any pathologist in records before 2013",
                    record: {
                        Id: "xr0003",
                        date: WebUtils.API.formatDateForDB(moment('2012-01-01')),
                        performedby: "someoneWhoClearlyDoesntExist",
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Review Required")
                    },
                    shouldPass: true
                });


                addTestRecord({
                    title: "Allows any prosector in records before 2013",
                    record: {
                        Id: "xr0003",
                        date: WebUtils.API.formatDateForDB(moment('2012-01-01')),
                        assistant: "someoneWhoClearlyDoesntExist",
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Review Required")
                    },
                    shouldPass: true
                });

                addTestRecord({
                    title: "Disallows any pathologist in records after 2013",
                    record: {
                        Id: "xr0003",
                        date: WebUtils.API.formatDateForDB(moment('2013-01-02')),
                        performedby: "someoneWhoClearlyDoesntExist",
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Review Required")
                    },
                    type: Type.ERROR,
                    regex: /is not a user/i
                });

                addTestRecord({
                    title: "Disallows any prosector in records after 2013",
                    record: {
                        Id: "xr0003",
                        date: WebUtils.API.formatDateForDB(moment('2013-01-02')),
                        assistant: "someoneWhoClearlyDoesntExist",
                        QCState: WNPRC_EHR.qc.getQCValueFromLabel("Review Required")
                    },
                    type: Type.ERROR,
                    regex: /is not a user/i
                });

                // Generate the records to insert
                var recsToInsert = _.values(testRecords).map(function(r) {
                    return r.record;
                });

                var requestFailed = true;
                WebUtils.API.insertRows('study', 'necropsy', recsToInsert).then(function(data) {
                    requestFailed = false;
                }).catch(function(errorData) {
                    // Index the returned errors by objectid
                    var errorIndex = {};
                    _.each(errorData.errors, function(errorObj) {
                        errorIndex[errorObj.row.objectid] = errorObj;
                    });

                    // Iterate over each test
                    $.each(testRecords, function(objectid, test) {
                        // If the record should be accepted, ensure that there's no error for that record
                        if (test.shouldPass) {
                            var passed = !(objectid in errorIndex);
                            assert.ok(passed, test.title);
                        }
                        // If the record was supposed to be rejected, make sure that there's an error for that
                        // record that matches what we expect to see.
                        else {
                            var errorobj = errorIndex[objectid];

                            var matchingError = _.find(errorobj.errors, function(err) {
                                if (test.regex && !test.regex.test(err.message)) {
                                    return false;
                                }
                                else if (test.type && err.message.indexOf(test.type) !== 0) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            });

                            assert.ok(matchingError, test.title);
                        }
                    });
                }).finally(function() {
                    assert.ok(requestFailed, "Trigger prevented inserts.");
                    done();
                });
            })
        });
    });
})();