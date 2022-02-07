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
                                    columns: 'Key,Status',
                                    sort: 'Key',
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
                                var win = o.up('window');
                                var form = win.down('form');
                                var qc = form.getForm().findField('change-vl-qcstate').getValue();
                                var num = form.getForm().findField('enter-experiment-number').getValue();
                                var positive_control = form.getForm().findField('enter-positive-control').getValue();
                                var vl_positive_control = form.getForm().findField('enter-vlpositive-control').getValue();
                                var avg_vl_positive_control = form.getForm().findField('enter-avgvlpositive-control').getValue();
                                var efficiency = form.getForm().findField('efficiency').getValue();

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
                                        failure: EHR.Utils.onError
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

    }
}
