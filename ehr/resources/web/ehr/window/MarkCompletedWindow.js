/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataRegionName
 * @cfg schemaName
 * @cfg queryName
 * @cfg fieldXtype
 * @cfg skipNonNull
 */
Ext4.define('EHR.window.MarkCompletedWindow', {
    extend: 'Ext.window.Window',
    pkColName: null,
    targetField: 'enddate',
    skipNonNull: true,

    statics: {
        buttonHandler: function(dataRegionName, schemaName, queryName, fieldXtype, pkColName, skipNonNull, targetField){
            var dataRegion = LABKEY.DataRegions[dataRegionName];

            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.create('EHR.window.MarkCompletedWindow', {
                dataRegionName: dataRegionName,
                schemaName: schemaName,
                queryName: queryName,
                fieldXtype: fieldXtype,
                pkColName: pkColName,
                skipNonNull: skipNonNull !== false,
                targetField: targetField || 'enddate'
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            title: 'Set End Date',
            closeAction: 'destroy',
            width: 380,
            items: [{
                bodyStyle: 'padding: 5px;',
                items: [{
                    xtype: (this.fieldXtype || 'xdatetime'),
                    fieldLabel: 'Date',
                    width: 350,
                    value: new Date(),
                    itemId: 'dateField'
                }]
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();

        LDK.Assert.assertNotEmpty('No pkColName provided to MarkCompletedWindow', this.pkColName);
    },

    onSubmit: function(btn){
        Ext4.Msg.wait('Loading...');
        var date = btn.up('window').down('#dateField').getValue();
        if (!date){
            Ext4.Msg.alert('Error', 'Must enter a date');
            return;
        }

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        var checked = dataRegion.getChecked();

        LABKEY.Query.selectRows({
            method: 'POST',
            schemaName: this.schemaName,
            queryName: this.queryName,
            columns: this.pkColName + ',' + this.targetField,
            filterArray: [
                LABKEY.Filter.create(this.pkColName, checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
            ],
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(data){
        var toUpdate = [];
        var skipped = [];
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        var date = this.down('#dateField').getValue();

        if (!data.rows || !data.rows.length){
            Ext4.Msg.hide();
            dataRegion.selectNone();
            dataRegion.refresh();
            return;
        }

        Ext4.Array.forEach(data.rows, function(row){
            if (!row[this.targetField] || !this.skipNonNull){
                var obj = {};
                obj[this.targetField] = date;
                obj[this.pkColName] = row[this.pkColName];
                toUpdate.push(obj);
            }
            else {
                skipped.push(row[this.pkColName]);
            }
        }, this);

        Ext4.Msg.hide();
        if (skipped.length){
            Ext4.Msg.alert('', 'One or more rows will be skipped because it already has an end date', function(){
                this.doUpdate(toUpdate);
            }, this);
        }
        else {
            this.doUpdate(toUpdate);
        }
    },

    doUpdate: function(toUpdate){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];

        if (toUpdate.length){
            Ext4.Msg.wait('Saving...');
            LABKEY.Query.updateRows({
                method: 'POST',
                schemaName: this.schemaName,
                queryName: this.queryName,
                rows: toUpdate,
                scope: this,
                success: function(){
                    this.close();
                    Ext4.Msg.hide();
                    dataRegion.selectNone();
                    dataRegion.refresh();
                },
                failure: LDK.Utils.getErrorCallback()
            });
        }
        else {
            Ext4.Msg.hide();
            dataRegion.selectNone();
            dataRegion.refresh();
        }
    }
});