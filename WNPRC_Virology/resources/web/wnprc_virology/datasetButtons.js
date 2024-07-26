Ext4.namespace('WNPRC_Virology.ext',  'WNPRC_Virology.DatasetButtons');


WNPRC_Virology.DatasetButtons = new function() {

    return {
        /**
         * Designed to batch complete records for the vl_sample_queue list. Gathers up and saves the following data,
         * and saves it to the list:
         *   Status
         *   Experiment #
         *   Positive Control #
         *   Positive Control
         *   AVG Positive Control
         *   Efficiency
         *
         * @param dataRegionName
         */

        batchCompleteRecords: function (dataRegionName) {
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();  //TODO: update to getSelected with callback
            var checkedInt = checked.map(function (item) {
                return parseInt(item, 10);
            });
            var checkedJoin = checked.join(";");
            console.log(checkedJoin);
            if (!checked || !checked.length) {
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }
            var filt = [];
            filt.push(LABKEY.Filter.create('key', checkedJoin, LABKEY.Filter.Types.IN));
            var uniq = [];
            LABKEY.Query.selectRows({
                schemaName: 'lists',
                queryName: 'vl_sample_queue',
                filterArray: filt,
                success: function (d) {
                    //check that all records are the same animal id
                    var toUpdate = d["rows"];
                    new Ext4.Window({
                        title: 'Change Request Status',
                        width: 430,
                        autoHeight: true,
                        items: [{
                            xtype: 'form',
                            ref: 'theForm',
                            bodyStyle: 'padding: 5px;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: 'Total Records: ' + checked.length + '<br><br>',
                                tag: 'div'
                            }, {
                                xtype: 'combo',
                                fieldLabel: 'Status',
                                width: 300,
                                triggerAction: 'all',
                                mode: 'local',
                                store: new LABKEY.ext4.Store({
                                    xtype: 'labkey-store',
                                    schemaName: 'lists',
                                    queryName: 'status',
                                    columns: 'Key,Status,Active',
                                    sort: 'Key',
                                    storeId: 'lists||status',
                                    filterArray: [LABKEY.Filter.create('Active', true, LABKEY.Filter.Types.EQUALS)],
                                    //filterArray: [LABKEY.Filter.create('label', 'Request', LABKEY.Filter.Types.STARTS_WITH)],
                                    autoLoad: true
                                }),
                                displayField: 'Status',
                                valueField: 'Key',
                                ref: 'qcstate',
                                id: 'change-vl-qcstate',
                                allowBlank: false
                            }, {
                                xtype: 'numberfield',
                                ref: 'experiment',
                                fieldLabel: 'Experiment #',
                                width: 300,
                                id: 'enter-experiment-number',
                                allowBlank: false
                            }, {
                                xtype: 'numberfield',
                                ref: 'positivecontrol',
                                fieldLabel: 'Positive Control #',
                                width: 300,
                                id: 'enter-positive-control',
                                allowBlank: false
                            }, {
                                xtype: 'textfield',
                                ref: 'vlpositivecontrol',
                                fieldLabel: 'Positive Control',
                                width: 300,
                                id: 'enter-vlpositive-control',
                                allowBlank: false
                            }, {
                                xtype: 'textfield',
                                ref: 'avgvlpositivecontrol',
                                fieldLabel: 'AVG Positive Control',
                                width: 300,
                                id: 'enter-avgvlpositive-control',
                                allowBlank: false
                            }, {
                                xtype: 'numberfield',
                                ref: 'efficiency',
                                fieldLabel: 'Efficiency',
                                width: 300,
                                id: 'efficiency',
                                allowBlank: false,
                                allowDecimals: true
                            }
                            ]
                        }],
                        buttons: [{
                            text: 'Submit',
                            disabled: false,
                            formBind: true,
                            ref: '../submit',
                            scope: this,
                            handler: function (o) {
                                var statusStore = Ext4.StoreMgr.get('lists||status').data.items;
                                var statusStoreObj = {};
                                for (var k = 0; k < statusStore.length; k++){
                                    statusStoreObj[statusStore[k].data.Key] = statusStore[k].data.Status;
                                }
                                var win = o.up('window');
                                var form = win.down('form');
                                var qc = form.getForm().findField('change-vl-qcstate').getValue();
                                var num = form.getForm().findField('enter-experiment-number').getValue();
                                var positive_control = form.getForm().findField('enter-positive-control').getValue();
                                var vl_positive_control = form.getForm().findField('enter-vlpositive-control').getValue();
                                var avg_vl_positive_control = form.getForm().findField('enter-avgvlpositive-control').getValue();
                                var efficiency = form.getForm().findField('efficiency').getValue();

                                if ((num == null ||
                                        num == "" ||
                                        positive_control == null ||
                                        positive_control == "" ||
                                        vl_positive_control == null ||
                                        vl_positive_control == "" ||
                                        avg_vl_positive_control == null ||
                                        avg_vl_positive_control == "" ||
                                        efficiency == null ||
                                        efficiency == "" )
                                        && statusStoreObj[qc] == "09-complete-email-RSEHR") {
                                    alert ('Cannot complete record without an experiment number, positive control or efficiency value');
                                    return;
                                }

                                Ext4.Msg.wait('Loading...');

                                //update qc status
                                Ext4.each(toUpdate, function (row) {
                                    row.Status = qc;
                                    row.experimentNumber = parseInt(num);
                                    row.positive_control = parseInt(positive_control);
                                    row.vl_positive_control = vl_positive_control;
                                    row.avg_vl_positive_control = avg_vl_positive_control;
                                    row.efficiency = parseFloat(efficiency);
                                }, this);

                                if (toUpdate.length) {
                                    LABKEY.Query.updateRows({
                                        schemaName: 'lists',
                                        queryName: 'vl_sample_queue',
                                        rows: toUpdate,
                                        scope: this,
                                        success: function () {
                                            dataRegion.selectNone();
                                            dataRegion.refresh();
                                            Ext4.Msg.hide();
                                        },
                                        failure: function (e) {
                                            alert (e.exception);
                                        }
                                    });

                                }
                            }
                        }, {
                            text: 'Close',
                            handler: function (o) {
                                o.ownerCt.ownerCt.close();
                            }
                        }]
                    }).show();


                },
                failure: function () {

                }
            });

        },
        downloadRecordsToCSV: function (dataRegionName) {
            let filt = [];
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            var checkedJoin = checked.join(";");
            console.log(checkedJoin);
            if (!checked || !checked.length) {
                Ext4.Msg.alert('Error', 'No records selected');
                return;
            }
            filt.push(LABKEY.Filter.create('key', checkedJoin, LABKEY.Filter.Types.IN));

            function replaceSampleTypeCasing(sampleType) {
                switch(sampleType) {
                    case 'plasma':
                        return 'Plasma';
                    case 'urine':
                        return 'Urine';
                    case 'other_fluid':
                        return 'Other-fluid';
                    case 'tissue':
                        return 'Tissue'
                    default:
                        return sampleType;
                }
            }

            LABKEY.Query.selectRows({
                schemaName: 'lists',
                queryName: 'vl_sample_queue',
                viewName: 'Samples_for_isolation',
                filterArray: filt,
                requiredVersion: 22.11,
                success: function (response) {
                    let csvRows = [];

                    //header
                    csvRows.push(["RNA isolation"]);
                    csvRows.push(["Name: _____________________________________________________"]);
                    csvRows.push(["Date: _____________________________________________________"]);
                    csvRows.push(["Expt #: ___________________________________________________"]);
                    csvRows.push(["Maxwell kit lot #: ________________________________________"]);
                    csvRows.push(["Instrument: _______________________________________________"]);
                    csvRows.push([""]);
                    csvRows.push(["#", "ID", "Date", "Type", "Comments", "Plasma Freezer", "RNA Freezer"]);

                    // sample data
                    response.rows.forEach(function (row, index){
                       let rowData = row.data;
                       let csvRowItem = [
                           (index+1).toString(), rowData.Id.value,
                           new Date(rowData.Sample_date.formattedValue).toISOString().split('T')[0], //only get yyyy-mm-dd part
                           replaceSampleTypeCasing(rowData.Sample_type.value),
                           rowData.Submitter_comments.value,
                           "________      ",
                           "________"
                       ];
                       csvRows.push(csvRowItem);
                    });
                    csvRows.push([(response.rows.length+1).toString(), "PosControl", "", "Plasma", "", "________      ", "________"]);
                    csvRows.push([(response.rows.length+2).toString(), "NegControl", "", "Water", "", "________      ", "________"]);

                    // footer
                    csvRows.push([""]);
                    csvRows.push(["qPCR expt #"]);
                    csvRows.push(["Reagents: "]);
                    csvRows.push(["Assay: __________________________________________________"]);
                    csvRows.push(["Primer/hexamer mix: _____________________________________"]);
                    csvRows.push(["Probe: __________________________________________________"]);
                    csvRows.push(["RNase out: ______________________________________________"]);
                    csvRows.push(["DEPC water: _____________________________________________"]);
                    csvRows.push(["Transcript: _____________________________________________"]);
                    csvRows.push(["Carrier RNA: _____________________________________________"]);
                    csvRows.push(["Taqman fast mix: ________________________________________"]);
                    csvRows.push(["Instrument: _____________________________________________"]);
                    csvRows.push(["QC info entered: ________________________________________"]);
                    csvRows.push(["Charges entered: ________________________________________"]);
                    csvRows.push(["VL sample tracker: ______________________________________"]);

                    let csvContent = csvRows.map(e => e.join(",")).join("\n");
                    let encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
                    // create a link to download the file
                    let link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    let currentDate = new Date();
                    // we need to get the UTC offset since toISOString() always uses zero UTC offset, and could
                    // put us in the wrong day if we do not calculate the current timezone offset when getting the current date
                    const offset = currentDate.getTimezoneOffset()
                    let theDate = new Date(currentDate.getTime() - (offset*60*1000)).toISOString().split('T')[0]
                    link.setAttribute("download", "vl_sample_queue_" + theDate + ".csv");
                    document.body.appendChild(link);

                    //this will download the file
                    link.click();
                },
                failure: function (e) {
                    alert('Unable to download file, '+ e.exception);
                }
            });

        },

    }
}
