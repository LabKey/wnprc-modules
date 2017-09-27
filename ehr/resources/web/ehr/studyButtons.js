/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.DatasetButtons');


/**
 * This class holds methods or factories related to buttons that appear on DataRegion button bars in the EHR.
 * It follows the convention that handlers called directly are suffixed with 'Handler'.
 * @name EHR.DatasetButtons
 * @class
 */
EHR.DatasetButtons = new function () {
    var customizers = [];

    return {

        /**
         * This is the onRender handler that should be used by all datasets.  It will modify the More Actions button and add
         * menu items.  Different items are added depending on the identity of the query and permissions of the current user.
         * These buttons are added here, as opposed to coding the XML metadata, because we needed code to run to manage these permissions.
         * If a new button or action is to be added to the More Actions button, it should be added here.
         * @param dataRegion
         */
        moreActionsHandler: function (dataRegion) {
            //first we get the permission map
            EHR.Security.init({
                success: function () {
                    // NOTE: we have deprecated all core client-side code, but allow modules to register customizers that can add buttons
                    Ext4.each(customizers, function (fn) {
                        fn.call(this, dataRegion.name);
                    }, this);
                },
                failure: LDK.Utils.getErrorCallback(),
                scope: this
            });
        },

        registerMoreActionsCustomizer: function (fn) {
            customizers.push(fn);
        },

        /**
         * This helper will find the distinct IDs from the currently selected rows, then load the animal history page filtered on these IDs.
         * @param dataRegion
         * @param dataRegionName
         * @param queryName
         * @param schemaName
         */
        historyHandler: function (dataRegion, dataRegionName, queryName, schemaName) {
            dataRegion = LABKEY.DataRegions[dataRegionName];

            var noneSelected = function () {
                Ext4.Msg.alert('Error', 'No records selected');
            };

            var processSelection = function (clause) {
                queryName = queryName || dataRegion.queryName;
                schemaName = schemaName || dataRegion.schemaName;

                var sql = "SELECT DISTINCT s.Id FROM " + schemaName + ".\"" + queryName + "\" s " + clause;

                LABKEY.Query.executeSql({
                    method: 'POST',
                    schemaName: 'study',
                    sql: sql,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function (data) {
                        var ids = new Array();
                        for (var i = 0; i < data.rows.length; i++)
                            ids.push(data.rows[i].Id);

                        LDK.Assert.assertTrue('No animals found in more actions handler.', ids.length > 0);

                        if (ids.length) {
                            var ctx = EHR.Utils.getEHRContext();
                            LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
                            if (!ctx) {
                                return;
                            }

                            var hash = 'inputType:multiSubject&showReport:1&subjects:' + ids.join(',');
                            window.location = LABKEY.ActionURL.buildURL('ehr', 'animalHistory.view#' + hash, ctx['EHRStudyContainer']);

                            //force reload if on same page
                            if (LABKEY.ActionURL.getAction() == 'animalHistory') {
                                Ext4.History.add(hash);
                                window.location.reload();
                            }
                        }
                        else {
                            Ext4.Msg.alert('Error', 'No animals were found for your selection.  Either no rows were checked or there is a bug.');
                        }
                    }
                });
            };

            LDK.DataRegionUtils.getDataRegionWhereClause(dataRegion, 's', processSelection, noneSelected);
        },

        /**
         * This button should appear on all datasets and will allow the user to load the audit history of the selected record(s).  NOTE: because LabKey's PKs
         * (lsid) are based on Id + Date, they can change.  As a result, this helper first queries the DB to find the objectId of the selected records, then loads
         * the audit table filted on "lsid LIKE objectId".  This removes the need to include Id/Date in the search.  It's awkward and slow, but will give you the
         * correct history of a record, even if the Id or date changed.
         * @param dataRegionName
         */
        showAuditHistoryHandler: function (dataRegionName) {
            var dataRegion = LABKEY.DataRegions[dataRegionName];

            var processSelection = function (selection) {

                if (selection.selected.length < 1) {
                    Ext4.Msg.alert('Error', 'No records selected');
                }
                else {
                    LABKEY.Query.selectRows({
                        schemaName: dataRegion.schemaName,
                        queryName: dataRegion.queryName,
                        columns: 'lsid,objectid,Id,Dataset/DemographicData,Dataset/DataSetId',
                        filterArray: [
                            LABKEY.Filter.create('lsid', selection.selected.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                        ],
                        scope: this,
                        success: function (data) {
                            Ext4.Msg.hide();

                            if (data.rows.length) {
                                var items = [{
                                    html: 'New browser windows or tabs should have opened to load the history of these records.  If this did not happen, please be sure popups are enabled.  You can also click the following links to view those records:',
                                    bodyStyle: 'padding: 5px;',
                                    border: false
                                }];

                                var url;
                                Ext4.Array.forEach(data.rows, function (row, idx) {
                                    var params = {
                                        schemaName: 'auditLog',
                                        'query.queryName': 'DatasetAuditEvent',
                                        'query.viewName': 'Detailed',
                                        'query.intkey1~eq': row['Dataset/DataSetId']
                                    };

                                    //NOTE: for demographics data, the objectId is not part of the LSID.  therefore the best we can do is filter on Id, even though this might have changed over the life of the record.
                                    if (row['Dataset/DemographicData']) {
                                        params['query.lsid~contains'] = row.Id;
                                    }
                                    else {
                                        params['query.lsid~contains'] = row.objectid;
                                    }

                                    url = LABKEY.ActionURL.buildURL('query', 'executeQuery', null, params);

                                    items.push({
                                        html: '<a target="_blank" href="' + url + '">' + 'Record ' + (idx + 1) + '</a>',
                                        border: false
                                    });

                                    window.open(url);
                                }, this);

                                Ext4.create('Ext.window.Window', {
                                    closeAction: 'destroy',
                                    title: 'Record History',
                                    modal: true,
                                    width: 350,
                                    bodyStyle: 'padding: 5px;',
                                    items: items,
                                    buttons: [{
                                        text: 'Close',
                                        handler: function (btn) {
                                            btn.up('window').close();
                                        }
                                    }]
                                }).show();
                            }
                            else {
                                alert('Record not found');
                            }
                        },
                        failure: LDK.Utils.getErrorCallback()
                    });
                }
            };

            Ext4.Msg.wait('Loading...');
            dataRegion.getSelected({success: processSelection});
        },

        /**
         * Button handler that allows the user to pick 2 arbitrary weights and it will calculate
         * the percent difference between the two.  Appears on weight dataRegions.
         * @param dataRegionName
         * @param menu
         */
        compareWeightsHandler: function (dataRegionName) {
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();  //TODO: update to getSelected with callback
            if (!checked || !checked.length) {
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            if (checked.length > 2) {
                Ext4.Msg.alert('Error', 'More than 2 weights are checked.  Using the first 2.', showWindow, this);
            }
            else {
                showWindow();
            }

            function showWindow() {
                Ext4.create('EHR.window.CompareWeightsWindow', {
                    dataRegionName: dataRegionName
                }).show();
            }
        },

        discardTasks: function (dataRegionName) {
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();  //TODO: update to getSelected with callback
            if (!checked || !checked.length) {
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }

            Ext4.Msg.confirm('Discard Tasks', 'You are about to permanently delete the selected tasks.  Do you want to do this?', function (val) {
                if (val == 'yes') {
                    Ext4.Msg.wait('Deleting...');
                    LABKEY.Ajax.request({
                        url: LABKEY.ActionURL.buildURL('ehr', 'discardForm', null, {taskIds: checked}),
                        success: function (response, options) {
                            Ext4.Msg.hide();
                            Ext4.Msg.alert('Success', 'Tasks discarded');
                            dataRegion.refresh();
                        },
                        failure: LDK.Utils.getErrorCallback(),
                        scope: this
                    });
                }
            }, this);
        },

        limitKinshipSelection: function (dataRegionName) {
            var dataRegion = LABKEY.DataRegions[dataRegionName];

            var noneSelected = function () {
                Ext4.Msg.alert('Error', 'No records selected');
            };

            var processSelection = function (clause) {

                //find distinct IDs
                var sql = "SELECT DISTINCT s.Id FROM " + dataRegion.schemaName + ".\"" + dataRegion.queryName + "\" s " + clause;

                LABKEY.Query.executeSql({
                    method: 'POST',
                    schemaName: 'study',
                    sql: sql,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function (data) {
                        var ids = [];
                        for (var i = 0; i < data.rows.length; i++) {
                            ids.push(data.rows[i].Id);
                        }

                        if (!ids.length) {
                            Ext4.Msg.alert('No IDs found');
                        }
                        else if (ids.length > 200) {
                            Ext4.Msg.alert('This can only be used with 200 IDs or fewer');
                        }
                        else {
                            dataRegion.addFilter(LABKEY.Filter.create('Id2', ids.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
                            dataRegion.refresh();
                        }
                    }
                });
            };

            LDK.DataRegionUtils.getDataRegionWhereClause(dataRegion, 's', processSelection, noneSelected);
        }
    }
}
