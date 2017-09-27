/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 * @cfg {String} taskId
 * @cfg {String} caseId
 * @cfg {String} encounterId
 * @cfg {String} mode
 * @cfg {String} remarkFormat
 */
Ext4.define('EHR.panel.EnterRemarkPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-enterremarkpanel',
    minWidth: 580,
    itemId: 'remarksPanel',

    statics: {
        getButtonConfig: function(scope){
            return [{
                xtype: 'button',
                text: 'Submit',
                scope: scope,
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
                handler: function(btn){
                    this.down('#remarksPanel').doSubmit(EHR.QCStates.COMPLETED);
                }
            },{
                xtype: 'button',
                text: 'Submit For Review',
                scope: scope,
                disabled: !EHR.Security.hasPermission(EHR.QCStates.REVIEW_REQUIRED, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
                handler: function(btn){
                    this.down('#remarksPanel').doSubmit(EHR.QCStates.REVIEW_REQUIRED);
                }
            }];
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            items: this.getItemsCfg(),
            taskId: this.taskId || LABKEY.Utils.generateUUID().toUpperCase(),
            buttons: this.hideButtons ? null : this.getButtonConfig(this)
        });

        this.callParent();
    },

    getItemsCfg: function(){
        if (this.mode == 'Behavior'){
            return this.getBehaviorItems();
        }
        else if (this.mode == 'Surgery'){
            return this.getSurgeryItems();
        }
        else if (this.mode == 'Clinical'){
            return this.getClinicalItems();
        }
        else {
            Ext4.Msg.alert('Error', 'Unknown remark type: ' + this.mode);
            LDK.Utils.logToServer({
                message: 'Unknown mode in EnterRemarkPanel: ' + this.mode
            })
        }
    },

    getBaseItems: function(remarkFormat){
        return [{
            xtype: 'ehr-clinicalremarkpanel',
            remarkFormat: this.remarkFormat || 'Simple Remark',
            animalId: this.animalId,
            taskId: this.taskId
        },{
            xtype: 'ehr-observationspanel',
            title: 'Observations',
            animalId: this.animalId,
            taskId: this.taskId
        }];
    },

    getBehaviorItems: function(){
        return this.getBaseItems();
    },

    getSurgeryItems: function(){
        return this.getBaseItems();
    },

    getClinicalItems: function(){
        return this.getBaseItems();
    },

    getDateValue: function(){
        return this.down('#dateField').getValue();
    },

    doSubmit: function(qcstate){
        var values = {
            Id: this.animalId,
            date: this.getDateValue(),
            taskId: this.taskId,
            caseId: this.caseId,
            encounterId: this.encounterId,
            performedby: LABKEY.Security.currentUser.displayName,
            QCStateLabel: qcstate
        };

        //Ext4.Msg.alert('Not enabled', 'This is not enabled yet');

        var commands = [];

        var remarkForm = this.down('ehr-clinicalremarkpanel');
        var remark = remarkForm.getForm().getValues();
        Ext4.apply(remark, values);
        commands.push(this.getCommand('study', 'Clinical Remarks', [remark]));

        var obsForm = this.down('ehr-observationspanel');
        var obsRecords = [];
        obsForm.store.each(function(r){
            var d = Ext4.apply({}, r.data);
            delete d.QCState;

            Ext4.apply(d, values);

            obsRecords.push(d);
        }, this);
        commands.push(this.getCommand('study', 'Clinical Observations', obsRecords));

        console.log(commands);
    },

    getCommand: function(schemaName, queryName, rows){
        return {
            command: 'insertWithKeys',
            schemaName: schemaName,
            queryName: queryName,
            rows: rows
        }
    }
});