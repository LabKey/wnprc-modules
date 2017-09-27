/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.buttons.ClinicalActionsButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.ehr-clinicalactionsbutton',

    initComponent: function(){
        Ext4.apply(this, {
            text: 'Actions',
            menu: [{
                xtype: 'menu',
                plugins: [{
                    ptype: 'menuqtips'
                }]
            }],
            listeners: {
                scope: this,
                render: this.onButtonRender
            }

        });

        this.callParent(arguments);
    },

    getAnimalId: function(){
        var owner = this.up('ehr-snapshotpanel');
        LDK.Assert.assertNotEmpty('Unable to find ownerpanel from ClinicalActionsButton', owner);
        if (!owner)
            return null;

        return owner.subjectId;
    },

    onButtonRender: function(){
        EHR.Security.init({
            scope: this,
            success: this.onSecurityInit
        });
    },

    onSecurityInit: function(){
        var toAdd = [];

        toAdd.push({
            text: 'Manage Treatments',
            disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
            tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Treatment Orders'}]) ? 'You do not have permission for this action' : null,
            scope: this,
            handler: function(btn){
                var animalId = this.getAnimalId();
                if (!animalId){
                    Ext4.Msg.alert('Error', 'No Animal Selected');
                    return;
                }

                Ext4.create('EHR.window.ManageTreatmentsWindow', {
                    animalId: animalId
                }).show(btn);
            }
        });

        toAdd.push({
            text: 'Manage Cases',
            disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]),
            tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Cases'}]) ? 'You do not have permission for this action' : null,
            scope: this,
            handler: function(btn){
                var animalId = this.getAnimalId();
                if (!animalId){
                    Ext4.Msg.alert('Error', 'No Animal Selected');
                    return;
                }

                Ext4.create('EHR.window.ManageCasesWindow', {
                    animalId: animalId
                }).show();
            }
        });

        toAdd.push({
            text: 'Enter SOAP',
            disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
            tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'update', [{schemaName: 'study', queryName: 'Clinical Remarks'}]) ? 'You do not have permission for this action' : null,
            scope: this,
            handler: function(btn){
                var animalId = this.getAnimalId();
                if (!animalId){
                    Ext4.Msg.alert('Error', 'No Animal Selected');
                    return;
                }

                Ext4.create('EHR.window.ManageRecordWindow', {
                    schemaName: 'study',
                    queryName: 'clinRemarks',
                    maxItemsPerCol: 11,
                    pkCol: 'objectid',
                    pkValue: LABKEY.Utils.generateUUID().toUpperCase(),
                    extraMetaData: {
                        Id: {
                            defaultValue: animalId,
                            editable: false
                        }
                    }
                }).show();
            }
        });

        toAdd.push({
            text: 'Open Exam Form',
            disabled: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.IN_PROGRESS, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]),
            tooltip: !EHR.Security.hasClinicalEntryPermission() || !EHR.Security.hasPermission(EHR.QCStates.IN_PROGRESS, 'insert', [{schemaName: 'study', queryName: 'Clinical Remarks'}]) ? 'You do not have permission for this action' : null,
            scope: this,
            handler: function(btn){
                window.open(LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: 'Clinical Report'}), '_blank')
            }
        });

        this.menu.removeAll();
        this.menu.add(toAdd);
    }
});