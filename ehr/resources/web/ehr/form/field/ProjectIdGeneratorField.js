/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.ProjectIdGeneratorField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-projectgeneratorfield',

    triggerCls: 'x4-form-search-trigger',

    initComponent: function(){
        Ext4.apply({
            triggerToolTip: 'Click to populate with the next available project'
        });

        this.callParent(arguments);
    },

    onTriggerClick: function(){
        Ext4.create('Ext.window.Window', {
            targetField: this,
            title: 'Assign Project Id',
            bodyStyle: 'padding: 5px;',
            modal: true,
            width: 350,
            closeAction: 'destroy',
            items: [{
                html: 'This helper will identify the next available project ID.  If you enter a 4-digit prefix, it will find the next number in this series.  If you leave this blank, it will find the next highest project number.',
                style: 'padding-bottom: 10px;',
                border: false
            },{
                xtype: 'textfield',
                width: 320,
                fieldLabel: 'Prefix',
                itemId: 'prefix'
            }],
            buttons: [{
                text: 'Submit',
                handler: function(btn){
                    var win = btn.up('window');
                    var prefix = win.down('#prefix').getValue();
                    //using the name not like 'A%' filter is a hack, but we have bad historic data
                    var sql = "SELECT name FROM ehr.project WHERE name is not null AND name NOT LIKE 'A%' " + (prefix ? " AND displayName LIKE '" + prefix + "%'" : "") + " ORDER BY displayName_sortValue DESC LIMIT 1";

                    Ext4.Msg.wait('Loading...');
                    LABKEY.Query.executeSql({
                        schemaName: 'ehr',
                        sql: sql,
                        maxRows: 1,
                        scope: this,
                        error: LDK.Utils.getErrorCallback(),
                        success: function(results){
                            Ext4.Msg.hide();

                            if (results && results.rows && results.rows.length){
                                var val = results.rows[0].name;
                                if (prefix){
                                    var suffix = val.split('-');
                                    suffix = suffix.length == 2 ? suffix[1] : 0;
                                    LDK.Assert.assertTrue('The latest project suffix was not numeric: ' + suffix, Ext4.isNumeric(suffix));
                                    if (!Ext4.isNumeric(suffix)){
                                        Ext4.Msg.alert('Error', 'The value was not a number: ' + suffix);
                                        return;
                                    }
                                    else {
                                        suffix = Number(suffix);
                                        suffix++;
                                        val = prefix + '-' + EHR.Utils.padDigits(suffix, 2);
                                    }
                                }
                                else {
                                    val = results.rows[0].name;
                                    val = val.split('-');
                                    val = val[0];
                                    LDK.Assert.assertTrue('The latest project was not numeric: ' + val, Ext4.isNumeric(val));
                                    if (!Ext4.isNumeric(val)){
                                        Ext4.Msg.alert('Error', 'The latest project name was not a number');
                                        return;
                                    }
                                    else {
                                        val = Number(val);
                                        val++;

                                        val = EHR.Utils.padDigits(val, 4);
                                    }
                                }

                                win.targetField.setValue(val);
                                win.close();
                            }
                            else {
                                Ext4.Msg.alert('None Found', 'No matching projects were found');
                            }
                        }
                    });
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        }).show();
    }
});