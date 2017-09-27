/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param dataEntryPanel
 * @param dataEntryBtn
 * @param reviewRequiredRecipient
 */
Ext4.define('EHR.window.SubmitForReviewWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            closeAction: 'destroy',
            modal: true,
            title: 'Submit For Review',
            width: 430,
            buttons: [{
                text:'Submit',
                disabled:false,
                itemId: 'submit',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');
                    var assignedTo = win.down('#assignedTo').getValue();
                    if(!assignedTo){
                        alert('Must assign this task to someone');
                        return;
                    }

                    var taskStore = this.dataEntryPanel.storeCollection.getServerStoreForQuery('ehr', 'tasks');
                    taskStore.getAt(0).set('assignedto', assignedTo);
                    this.dataEntryPanel.storeCollection.transformServerToClient();
                    this.dataEntryPanel.onSubmit(this.dataEntryBtn);
                    win.close();
                }
            },{
                text: 'Cancel',
                scope: this,
                handler: function(btn){
                    btn.up('window').hide();
                }
            }],
            items: [{
                bodyStyle: 'padding:5px;',
                items: [{
                    html: this.reviewRecipientMsg || '',
                    border: false,
                    style: 'padding-bottom: 10px;',
                    hidden: !this.reviewRecipientMsg
                },{
                    xtype: 'ehr-usersandgroupscombo',
                    forceSelection: true,
                    fieldLabel: 'Assign To',
                    width: 400,
                    queryMode: 'local',
                    store: {
                        type: 'labkey-store',
                        schemaName: 'core',
                        queryName: 'PrincipalsWithoutAdmin',
                        columns: 'UserId,DisplayName',
                        sort: 'Type,DisplayName',
                        autoLoad: true
                    },
                    value: this.getDefaultRecipient(),
                    displayField: 'DisplayName',
                    valueField: 'UserId',
                    itemId: 'assignedTo'
                }]
            }]
        });

        this.callParent(arguments);
    },

    getDefaultRecipient: function(){
        return this.reviewRequiredRecipient;
    }
});

/**
 * Will attempt to convert all records to the QCState 'Review Required' and submit the form.
 */
EHR.DataEntryUtils.registerDataEntryFormButton('REVIEW', {
    text: 'Submit for Review',
    name: 'review',
    requiredQC: 'Review Required',
    targetQC: 'Review Required',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'reviewBtn',
    disableOn: 'ERROR',
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        Ext4.create('EHR.window.SubmitForReviewWindow', {
            dataEntryPanel: panel,
            dataEntryBtn: btn,
            reviewRequiredRecipient: panel.formConfig.defaultReviewRequiredPrincipal
        }).show();
    }
});

/**
 * Similar to REVIEW, except used in forms with only 1 animal.  Will lookup the vet assigned to that animal and default the
 * review recipient based on this.
 */
EHR.DataEntryUtils.registerDataEntryFormButton('VET_REVIEW', {
    text: 'Submit for Review',
    name: 'review',
    requiredQC: 'Review Required',
    targetQC: 'Review Required',
    errorThreshold: 'WARN',
    successURL: LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('ehr', 'enterData.view'),
    disabled: true,
    itemId: 'reviewBtn',
    disableOn: 'ERROR',
    handler: function(btn){
        var panel = btn.up('ehr-dataentrypanel');
        if (panel.storeCollection.getRemarksRec){
            var rr = panel.storeCollection.getRemarksRec();
            if (rr && rr.get('Id')){
                var animalId = rr.get('Id');
                Ext4.Msg.wait('Loading...');
                EHR.DemographicsCache.getDemographics([animalId], function(ids, ret){
                    Ext4.Msg.hide();

                    var ar = ret[animalId];
                    var recipient = panel.formConfig.defaultReviewRequiredPrincipal;
                    var msg = null;
                    if (ar){
                        var assignedVet = ar.getProperty('assignedVet');
                        if (assignedVet && assignedVet.length){
                            if (Ext4.isNumeric(assignedVet[0]['assignedVetId'])){
                                recipient = Number(assignedVet[0]['assignedVetId']);
                                msg = 'Note: this is the default vet assigned to animal ' + animalId + ', based on project assignment and housing.  You can choose to override this if needed.';
                            }
                        }
                    }

                    Ext4.create('EHR.window.SubmitForReviewWindow', {
                        dataEntryPanel: panel,
                        dataEntryBtn: btn,
                        reviewRecipientMsg: msg,
                        reviewRequiredRecipient: recipient
                    }).show();
                }, this);
            } 
        }
        else {
            Ext4.create('EHR.window.SubmitForReviewWindow', {
                dataEntryPanel: panel,
                dataEntryBtn: btn,
                reviewRequiredRecipient: panel.formConfig.defaultReviewRequiredPrincipal
            }).show();
        }
    }
});