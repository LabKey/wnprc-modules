/*
 * This page defines Buttons for Data Entry Tasks and Requests.
 */
(function() {
    var getReturnURL = function() {
        return LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.getParameter('returnUrl') || LABKEY.ActionURL.getParameter('returnURL') || LABKEY.ActionURL.buildURL('project', 'start');
    };

    var registerBtn = function(name, config) {
        _.extend(config, {
            itemId: name + "-formButton"
        });

        return EHR.DataEntryUtils.registerDataEntryFormButton(name, config);
    };
    var getBtn = function(name) {
        return EHR.DataEntryUtils.getDataEntryFormButton(name);
    };

    /*
     *  This button saves the form to the database, without changing QCStates
     *  at all, and stays on the same page
     */
    var SaveButtonName = "WNPRC_SAVE";
    registerBtn(SaveButtonName, {
        text:           "Save",
        successURL:     false, // don't navigate page
        disabled:       false,
        errorThreshold: "ERROR",
        tooltip:        "Save changes to this record and remain on this page.",
        handler: function(btn) {
            this.onSubmit(btn);
        }
    });

    /*
     *  This button saves the form to the database, without changing QCStates
     *  at all, and returns to whatever page sent it here.
     */
    var SaveAndExitButtonName = "WNPRC_SAVE_AND_EXIT";
    registerBtn(SaveAndExitButtonName, _.extend(getBtn(SaveButtonName), {
        text:       "Save & Exit",
        successURL: getReturnURL(),
        tooltip:    "Save changes to this record, and then leave this page."
    }));

    /*
     * This can take an existing record and change it back to a scheduled state.
     */
    var SaveAsScheduledButtonName = "WNPRC_SAVE_AS_SCHEDULED";
    registerBtn(SaveAsScheduledButtonName, _.extend(getBtn(SaveButtonName), {
        text:          "Save As Scheduled",
        targetQC:      "Scheduled",
        hideOnQCState: "Scheduled"
    }));

    /*
     * This takes all the records on the page and sets their QCState to the value
     * on the task record, should one exist.
     */
    var FixQCStateButtonName = "WNPRC_FIX_QCSTATE";
    registerBtn(FixQCStateButtonName, _.extend(getBtn(SaveButtonName), {
        text: "Fix QCState on Records",
        handler: function(btn) {
            var storeCollection = this.storeCollection;
            var taskStore = storeCollection.getServerStoreForQuery("ehr", "Tasks");
            var taskRecord = taskStore.getAt(0);

            if (taskRecord) {
                var qcstate = taskRecord.get('qcstate');

                jQuery.each(storeCollection.serverStores.getRange(), function(i, store) {
                    if (store !== taskStore) {
                        jQuery.each(store.getRange(), function(i, rec) {
                            rec.set('QCState', qcstate);
                        })
                    }
                });
            }

            this.onSubmit(btn);
        }
    }));

    /*
     * This takes a scheduled task and puts it In Progress, and then refreshes the page.
     */
    var StartTaskButtonName = "WNPRC_START_TASK";
    registerBtn(StartTaskButtonName, {
        text:              "Start Task",
        requiredQC:        "In Progress",  // Button only shows if user has permission for this QCState
        targetQC:          "In Progress",
        onlyShowOnQCState: "Scheduled",
        errorThreshold:    "ERROR",
        successURL:        false,
        tooltip:           "Set the status of this record to \"In Progress\", and refresh the page.",
        handler: function(btn) {
            this.onSubmit(btn);
        }
    });

    /*
     * This is a wrapper on the Submit For Review button to add the tooltip and change the success URL
     * to the WNPRC data entry page, instead of the EHR one.
     */
    let SubmitForReviewButtonName = "WNPRC_REVIEW";
    registerBtn(SubmitForReviewButtonName, _.extend(getBtn("REVIEW"), {
        successURL:    getReturnURL() || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
        tooltip:       "Set the status of this record to Review Required, save the record, and leave this page."
    }));

    /*
     * This is a wrapper on the Submit Final button to add the tooltip and change the success URL to
     * the WNPRC data entry page, instead of the EHR one.
     */
    var SubmitFinalButtonName = 'WNPRC_SUBMIT_FINAL';
    registerBtn(SubmitFinalButtonName, _.extend(getBtn("SUBMIT"), {
        successURL:    getReturnURL() || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
        hideOnQCState: "Scheduled",
        tooltip:       "Set the status of this record to Complete, save the record, and leave this page."
    }));

    /*
     * Prompt the user for a yes or no answer.  Resolves on "yes" and rejects with an error with a
     * message of "canceled" if "no" is selected.
     */
    var when$userConfirms = function(title, message) {
        return new Promise(function(resolve, reject) {
            Ext4.Msg.confirm(title, message, function(answer) {
                if (answer == 'yes') {
                    resolve();
                }
                else {
                    reject(new Error("canceled"));
                }
            });
        });
    };

    // For some reason, the JS parser doesn't like "study" sometimes, so we'll store it in a variable
    // to prevent the syntax highlighter from breaking
    var study = "study";

    var promptForDeathData = function(deathData) {
        /*
         * Check for demographic data
         */
        return WebUtils.API.selectRows(study, "demographics", {
            'Id~eq': deathData.deathRec.Id
        }).then(function(data) {
            if (!data || !data.rows || data.rows.length == 0) {
                throw new Error("There is no demographics record for this animal.  Please contact " +
                        "Colony Records to add one.")
            }

            return Promise.resolve(deathData)
        }).then(function(deathData) {
            var rec = deathData.record;
            var VM = {
                form: {
                    remark: ko.observable(rec.remark),
                    notAtCenter: ko.observable(rec.notAtCenter)
                }
            };

            return WNPRC.ExtUtils.loadWindow("DeathFormWindow", VM).then(function(window) {
                return window.display().then(function(VM) {
                    window.destroy();
                    return Promise.resolve(VM);
                });
            });
        });
    };

    var promptForPrenatalDeathData = function(deathData) {
        var rec = deathData.deathRec;

        // Initialize the VM
        var VM = {
            form: {
                dam:        ko.observable(rec.dam),
                gender:     ko.observable(rec.gender),
                species:    ko.observable(rec.species),
                conception: ko.observable(rec.conception),
                remark:     ko.observable(rec.remark),
                cage:       ko.observable(rec.cage),
                room:       ko.observable(rec.room),
                sire:       ko.observable(rec.sire)
            },
            errors:           ko.observableArray(),
            availableSpecies: ko.observableArray(),
            availableGenders: ko.observableArray()
        };

        // Subscribe the dam to automatically update the species, since dams should always
        // yield young of the same species.
        var updateSpeciesFromDam = function(val) {
            WebUtils.API.selectRows(study, "demographics", {
                'Id~eq': val
            }).then(function(data) {
                if (data.rows && data.rows.length > 0) {
                    VM.form.species(data.rows[0].species);
                }
            });
        };

        VM.form.dam.subscribe(updateSpeciesFromDam);
        if (VM.form.dam()) {
            updateSpeciesFromDam(VM.form.dam());
        }

        VM.errorMessage = ko.computed(function() {
            if (!(VM.form.dam() && VM.form.species() && VM.form.gender())) {
                return "You must specify a dam, species, and gender for all prenatal deaths.";
            }

            return "";
        });

        // Define a observable to disable the submit button when the user hasn't supplied all of the
        // required fields.
        VM.submitDisabled = ko.computed(function() {
            return !!VM.errorMessage();
        });

        // Grab the data needed to display the modal.
        return Promise.all([
            WNPRC.ExtUtils.loadWindow("PrenatalDeathFormWindow", VM),
            WebUtils.API.selectRows("ehr_lookups", "species"),
            WebUtils.API.selectRows("ehr_lookups", "gender_codes")
        ]).then(function(values) {
            var window = values[0];

            // Populate the selection lists with the lookup tables
            VM.availableSpecies(values[1].rows);
            VM.availableGenders(values[2].rows);

            var triggerChange = function($el) {
                $el.change();
            };

            // Apply typeahead to the dam field.
            var $damField = window.$modal.find('.dam-field').typeahead({ minLength: 4 }, {
                name: 'dams',
                source: function(q, syncCallback, cb) {
                    WebUtils.API.executeSql(study, "SELECT * FROM study.demographics WHERE gender.code = 'f' AND Id LIKE '%" + q + "%'").then(function(data) {
                        cb(data.rows);
                    });
                },
                display: function(record) {
                    return record.Id;
                },
                templates: {
                    suggestion: function(record) {
                        return '<p>' + record.Id + '</p>'
                    }
                }
            });

            $damField.on("typeahead:selected",      function() { triggerChange($damField) });
            $damField.on("typeahead:autocompleted", function() { triggerChange($damField) });

            // Apply typeahead to the sire field.
            var $sireField = window.$modal.find('.sire-field').typeahead({ minLength: 4 }, {
                name: 'sires',
                source: function(q, syncCallback, cb) {
                    WebUtils.API.executeSql(study, "SELECT * FROM study.demographics WHERE gender.code = 'm' AND Id LIKE '%" + q + "%'").then(function(data) {
                        cb(data.rows);
                    });
                },
                display: function(record) {
                    return record.Id;
                },
                templates: {
                    suggestion: function(record) {
                        return '<p>' + record.Id + '</p>'
                    }
                }
            });

            $sireField.on("typeahead:selected",      function() { triggerChange($sireField) });
            $sireField.on("typeahead:autocompleted", function() { triggerChange($sireField) });

            // Typeahead screws with the display, adding "inline-block" to the element itself, so this
            // switches it back to be full width
            $('.twitter-typeahead').css('display', '');

            return window.display().then(function(VM) {
                window.destroy();
                return Promise.resolve(VM);
            });
        });
    };


    /*
     * This promise presents the user with a modal form to edit some extra demographic information
     * for a death record.  It resolves when the user hits submit, and rejects with an error whose
     * message contains "canceled" if the user presses cancel.  If it rejects with any other error,
     * that indicates an unexpected exception.
     */

    var updateDeathTable = function(btn, callback) {
        return Promise.resolve().then(function() {
            var panel       = btn.up('ehr-dataentrypanel');
            var deathRec    = {};

            var necropsyStore = panel.storeCollection.getClientStoreByName("Necropsies");
            var necropsyRec = necropsyStore.getAt(0);

            var weightStore = panel.storeCollection.getClientStoreByName("Weight");
            var weightRec = weightStore.getAt(0);

            // Grab required info from the record
            try {
                _.extend(deathRec, {
                    Id:      necropsyRec.get('Id'),
                    date:    necropsyRec.get('timeofdeath'),
                    cause:   necropsyRec.get('causeofdeath'),
                    project: necropsyRec.get('project')
                });

                if (!deathRec.Id || !deathRec.date || !deathRec.cause || !deathRec.project) {
                    throw new Error();
                }
            }
            catch(e) {
                throw new Error("Must provide Id, project, type of death, and time of death");
            }

            // Determine whether this is a prenatal death
            var isPrenatalDeath = deathRec.Id.match(/^pd/);
            var queryName = isPrenatalDeath ? 'Prenatal Deaths' : 'Deaths';

            // Grab the weight for prenatal deaths (there is no weight column for death records).
            try {
                deathRec.weight = weightRec.get('weight');
            }
            catch(e) {
                if (isPrenatalDeath) {
                    deathRec.weight = null;
                }
            }

            // Even though weights are not in Death records, the triggered email needs
            // this field to be filled out.
            if (!isPrenatalDeath && !Ext4.isNumber(deathRec.weight)) {
                throw new Error("You must provide a weight.");
            }

            // Grab the other info.
            var getNecropsyValue = function(columnName) {
                try {
                    return necropsyRec.get(columnName);
                }
                catch(e) {
                    return "";
                }
            };
            _.extend(deathRec, {
                manner:       getNecropsyValue('mannerofdeath'),
                necropsy:     getNecropsyValue('caseno'),
                parentid:     getNecropsyValue('objectid'),
                necropsyDate: getNecropsyValue('date')
            });


            // Determine whether this is a prenatal death
            var isPrenatalDeath = deathRec.Id.match(/^pd/);
            var queryName = isPrenatalDeath ? 'Prenatal Deaths' : 'Deaths';


            var cols = ['lsid', 'Id', 'date', 'remark', 'QCState', 'taskid'];
            if (isPrenatalDeath) {
                cols.push('species', 'gender', 'dam', 'sire', 'room', 'cage', 'conception');
            }
            else {
                cols.push('tattoo', 'cause', 'manner', 'necropsy', 'remark', 'performedby', 'notAtCenter');
            }


            // Grab the weight for prenatal deaths (there is no weight column for death records).
            if (isPrenatalDeath) {
                try {
                    deathRec.weight = weightRec.get('weight');
                }
                catch(e) {
                    deathRec.weight = null;
                }
                _.extend(deathRec, {
                    dam: getNecropsyValue('dam')
                });
            }

            return Promise.all([
                Promise.resolve({
                    deathRec: deathRec,
                    queryName: queryName,
                    isPrenatalDeath: isPrenatalDeath
                }),
                WebUtils.API.selectRows('study', queryName, {'Id~eq': deathRec.Id, columns: cols })
            ]);
        }).then(function(data) {
            var deathData = data[0];
            deathData.recordExists = data[1] && data[1].rows && data[1].rows.length;
            deathData.record = deathData.recordExists ? data[1].rows[0] : {};

            if (deathData.recordExists) {
                deathData.deathRec.lsid = data[1].rows[0].lsid;

                return when$userConfirms("Update Death Record", "Death record already exists.  Do you want to update it?").then(function() {
                    return when$userConfirms("", "Do you want to resend the death notification email?").then(function () {
                        deathData.resendEmail = true;
                        return Promise.resolve(deathData);
                    })['catch'](function () {
                        return Promise.resolve(deathData);
                    });
                });
            }
            else {
                return when$userConfirms('Finalize Death', 'You are about to finalize this death record on this animal.  This will end all treatments, problems, assignments and housing. BE ABSOLUTELY SURE YOU WANT TO DO THIS BEFORE CLICKING YES.').then(function() {
                    return Promise.resolve(deathData);
                });
            }
        }).then(function(deathData) {
            return (deathData.isPrenatalDeath ? promptForPrenatalDeathData(deathData) : promptForDeathData(deathData)).then(function(VM) {
                _.extend(deathData.deathRec, ko.mapping.toJS(VM.form));

                return Promise.resolve(deathData);
            });
        }).then(function(deathData) {
            // Actually submit the record
            Ext4.Msg.wait('Saving...');
            var savePromise;
            var config = {
                extraContext: {
                    resendEmail: deathData.resendEmail
                }
            };

            if (deathData.recordExists) {
                savePromise = WebUtils.API.updateRows('study', deathData.queryName, [deathData.deathRec], config);
            }
            else {
                savePromise = WebUtils.API.insertRows('study', deathData.queryName, [deathData.deathRec], config);
            }

            return Promise.all([
                Promise.resolve(deathData),
                savePromise
            ]);
        }).then(function(data) {
            var deathData = data[0];

            // Inform the user of our success
            var verb = deathData.recordExists ? 'updated' : 'inserted';
            Ext4.Msg.hide();
            Ext4.Msg.alert("", "Successfully " + verb + " " + deathData.queryName + " from necropsy for " + deathData.deathRec.Id);

            return new Promise(function(resolve, reject) {
                Ext4.Msg.on("hide", function() {
                    resolve();
                }, null, {single: true});
            });
        });
    };

    var cancelErrorHandler = function(e) {
        if (Ext4.Msg.isVisible()) {
            Ext4.Msg.hide();
        }

        if (e && e.message != "canceled") {
            Ext4.Msg.alert("ERROR", "An error occurred: " + (e.message) ? e.message : e.exception);
        }
    };

    /*
     *  This inserts into or updates either the Prenatal Deaths or the regular Deaths table with
     *  information from the necropsy.  The insertion will cause the trigger scripts to
     *  close treatments, housing, etc., and will send a Death Notification email out.
     */
    registerBtn('FINALIZE_DEATH', {
        text:           'Finalize Death',
        requiredQC:     'In Progress',
        targetQC:       'In Progress',
        errorThreshold: 'INFO',
        successURL:     false,
        disabled:       true,
        disableOn:      'ERROR',
        tooltip:        "This starts the task and inserts into or updates either the Prenatal Deaths or the regular Deaths table with information from the necropsy.  The insertion will cause any assigned treatments, housing, etc. to be closed, and will send a Death Notification email out.",
        handler: function(btn) {
            this.saveRecords(btn).then(function() {
                return updateDeathTable(btn).then(function() {
                    window.location.reload();
                });
            })['catch'](cancelErrorHandler);
        },
        shouldHide: function(buttonConfig) {
            var taskDataEntryPanel = this;
            var necropsyStore = this.storeCollection.getServerStoreForQuery('study', 'necropsy');
            var necropsyRecord = _.isDefined(necropsyStore) ? necropsyStore.getAt(0) : undefined;

            if (_.isDefined(necropsyRecord)) {
                var Id = necropsyRecord.get('Id');

                Promise.resolve().then(function() {
                    if (Id.match(/^pd/i)) {
                        return WebUtils.API.selectRows('study', 'prenatal', {
                            'Id~eq': Id
                        });
                    }
                    else {
                        return WebUtils.API.selectRows('study', 'deaths', {
                            'Id~eq': Id
                        });
                    }
                }).then(function(data) {
                    var panel = taskDataEntryPanel;
                    var btn = panel.queryById(buttonConfig.itemId);

                    if (_.isDefined(btn)) {
                        if (data && data.rows && data.rows.length > 0) {
                            btn.hide();
                        }
                        else {
                            btn.show();
                        }
                    }
                })
            }

            // Hide until we confirm we should show.
            return true;
        }
    });

    registerBtn('UPDATE_DEATH', {
        text:           'Update Death',
        errorThreshold: 'INFO',
        successURL:     false, // don't navigate away from page.
        disabled:       true,
        disableOn:      'ERROR',
        tooltip:        "This inserts into or updates either the Prenatal Deaths or the regular Deaths table with information from the necropsy.  The insertion will cause any assigned treatments, housing, etc. to be closed, and will send a Death Notification email out.",
        handler: function(btn) {
            this.saveRecords(btn).then(function() {
                return updateDeathTable(btn)
            })['catch'](cancelErrorHandler);
        },
        shouldHide: function(buttonConfig) {
            var taskDataEntryPanel = this;
            var necropsyStore = taskDataEntryPanel.storeCollection.getServerStoreForQuery('study', 'necropsy');
            var necropsyRecord = _.isDefined(necropsyStore) ? necropsyStore.getAt(0) : undefined;

            if (_.isDefined(necropsyRecord)) {
                var Id = necropsyRecord.get('Id');

                Promise.resolve().then(function() {
                    if (Id.match(/^pd/i)) {
                        return WebUtils.API.selectRows('study', 'prenatal', {
                            'Id~eq': Id
                        });
                    }
                    else {
                        return WebUtils.API.selectRows('study', 'deaths', {
                            'Id~eq': Id
                        });
                    }
                }).then(function(data) {
                    var panel = taskDataEntryPanel;
                    var btn = panel.queryById(buttonConfig.itemId);

                    if (_.isDefined(btn)) {
                        if (data && data.rows && data.rows.length > 0) {
                            btn.show();
                        }
                        else {
                            btn.hide();
                        }
                    }
                })
            }

            // Hide until we get our callback;
            return true;
        }
    });


    /*
     *  Leaves the page without saving the form.
     */
    var CancelButtonName = "WNPRC_CANCEL";
    registerBtn(CancelButtonName, {
        text:       "Cancel",
        successURL: getReturnURL() || LABKEY.ActionURL.buildURL('wnprc_ehr', 'dataEntry.view'),
        tooltip:    "This will discard changes not yet saved to the database and exit the page.",
        handler: function(btn) {
            window.location = btn.successURL;
        }
    });


    /*
     * This is a wrapper on the Request button to allow .
     */
    var RequestButtonName = 'WNPRC_REQUEST';
    registerBtn(RequestButtonName, _.extend(getBtn("REQUEST"), {
        disableOn: 'ERROR'
    }));

    /*
     * Enable the save template button for all users.
     */
    var saveTemplateButtonName = "TEMPLATE";
    var saveTemplateButton = EHR.DataEntryUtils.getGridButton(saveTemplateButtonName);
    jQuery.each(saveTemplateButton.menu.items, function(i, item) {
        if (item.text.match(/save as template/i)) {
            delete item.hidden;
        }
    });
    EHR.DataEntryUtils.registerGridButton(saveTemplateButtonName, function(config) {
        return Ext4.apply(saveTemplateButton, config);
    });


    EHR.DataEntryUtils.registerGridButton('WNPRC_AUTO_ASSIGN_ORDER', function(config){
        return Ext4.Object.merge({
            text: 'Auto Assign Order',
            xtype: 'button',
            tooltip: 'This will automatically add order numbers to every row in this grid in the current order they display on screen',
            handler: function() {
                var self = this;
                var grid = this.up('grid');

                if (!grid) {
                    return;
                }

                var store = grid.getStore();
                if (!store) {
                    return;
                }

                Ext4.suspendLayouts();
                _.each(store.getRange(), function(rec, i) {
                    rec.set("collection_order", i * 10);
                });
                Ext4.resumeLayouts(true);
            }
        });
    });
})();