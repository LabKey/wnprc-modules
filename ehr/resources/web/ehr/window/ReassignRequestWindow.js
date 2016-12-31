/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataRegionName
 * @cfg queryName
 */
Ext4.define('EHR.window.ReassignRequestWindow', {
    extend: 'Ext.window.Window',

    fieldWidth: 360,
    allowBlankQCState: false,
    title: 'Reassign Requests',

    statics: {
        buttonHandler: function(dataRegionName, queryName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.create('EHR.window.ReassignRequestWindow', {
                dataRegionName: dataRegionName,
                queryName: queryName
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            width: 400,
            autoHeight: true,
            items: [{
                xtype: 'panel',
                bodyStyle: 'padding: 5px;',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'form',
                    itemId: 'theForm',
                    items: this.getFormItems()
                }]
            }],
            buttons: [{
                text:'Submit',
                itemId: 'submitBtn',
                disabled: true,
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

        this.on('render', function(){
            this.setLoading(true);
            this.loadData();
        }, this, {single: true, delay: 100});
    },

    getFormItems: function(){
        return [{
            xtype: 'combo',
            editable: false,
            forceSelection: true,
            fieldLabel: 'Charge Unit',
            width: this.fieldWidth,
            queryMode: 'local',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: this.queryName,
                columns: 'value',
                sort: 'value',
                autoLoad: true
            },
            displayField: 'value',
            valueField: 'value',
            itemId: 'chargeType',
            name: 'chargetype'
        }]
    },

    loadData: function(){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        var checkedRows = dataRegion.getChecked();
        var selectorCols = !Ext4.isEmpty(dataRegion.selectorCols) ? dataRegion.selectorCols : dataRegion.pkCols;
        LDK.Assert.assertNotEmpty('Unable to find selector columns for: ' + dataRegion.schemaName + '.' + dataRegion.queryName, selectorCols);
        this.selectorCol = selectorCols[0];

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            method: 'POST',
            schemaName: dataRegion.schemaName,
            queryName: dataRegion.queryName,
            columns: this.selectorCol + ',Id,date,requestid,taskid,qcstate,qcstate/label,qcstate/metadata/isRequest',
            filterArray: [LABKEY.Filter.create(this.selectorCol, checkedRows.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            scope: this,
            success: this.onDataLoad,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onDataLoad: function(data){
        this.setLoading(false);

        if(!data.rows || !data.rows.length){
            this.close();
            Ext4.Msg.alert('Error', 'No records found');
            return;
        }

        this.records = [];
        var errorMsgs = [];
        var hasError = false;
        Ext4.Array.forEach(data.rows, function(json){
            var r = new LDK.SelectRowsRow(json);

            if (this.hasError(r, errorMsgs)){
                hasError = true;
            }
            else {
                this.records.push(r);
            }
        }, this);

        this.down('#submitBtn').setDisabled(false);

        if (hasError){
            var errorMsg = Ext4.Array.unique(errorMsgs).join('<br>');
            Ext4.Msg.alert('Error', errorMsg);
        }

        this.down('#theForm').insert(0, {
            html: 'Total Selected: ' + this.records.length + '<br><br>',
            border: false,
            tag: 'div'
        });

    },

    hasError: function(row, errorMsgs){
        if (!row.getValue('qcstate/metadata/isRequest')){
            errorMsgs.push('One or more records is not a request and will be skipped');
            return true;
        }

        if (row.getValue('taskid')){
            errorMsgs.push('One or more records is already part of a task and will be skipped');
            return true;
        }

        return false;
    },

    onSubmit: function(){
        this.doSave(this.getRecords());
    },

    doSave: function(records){
        if (!records || !records.length)
            return;

        Ext4.Msg.wait('Saving...');
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LABKEY.Query.updateRows({
            method: 'POST',
            schemaName: dataRegion.schemaName,
            queryName: dataRegion.queryName,
            rows: records,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onUpdate
        });
    },

    getRecords: function(){
        var chargeType = this.down('#chargeType').getValue();
        if (!chargeType){
            Ext4.Msg.alert('Error', 'Must choose a value');
            return;
        }

        var toSave = [];
        Ext4.each(this.records, function(r){
            var o = {
                chargetype: chargeType
            };
            o[this.selectorCol] = r.getValue(this.selectorCol);

            toSave.push(o);
        }, this);

        if (!toSave.length){
            this.close();
            Ext4.Msg.alert('Nothing To Save', 'There are no records to save');
            return null;
        }

        return toSave;
    },

    onUpdate: function(){
        Ext4.Msg.hide();
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        dataRegion.selectNone();
        dataRegion.refresh();
        this.close();
    }
});