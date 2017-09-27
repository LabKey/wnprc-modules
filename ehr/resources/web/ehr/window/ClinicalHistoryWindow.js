/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 */
Ext4.define('EHR.window.ClinicalHistoryWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.ehr-clinicalhistorywindow',

    statics: {
        showClinicalHistory: function(objectId, Id, date, el){
            var ctx = EHR.Utils.getEHRContext();
            LDK.Assert.assertNotEmpty('EHRContext not loaded.  This might indicate a ClientDependency issue', ctx);
            if (!ctx){
                return;
            }

            Ext4.create('EHR.window.ClinicalHistoryWindow', {
                subjectId: Id,
                containerPath: ctx['EHRStudyContainer']
            }).show(el);
        }
    },

    initComponent: function(){
        if (!EHR.Security.hasLoaded()){
            console.log('EHR.Security.init() has not been called.  Cannot show insert UI');
        }

        Ext4.QuickTips.init({
            constrainPosition: true
        });

        Ext4.apply(this, {
            title: 'Clinical History: ' + this.subjectId,
            bodyStyle: 'padding: 3px;',
            width: 1260,
            modal: true,
            closeAction: 'destroy',
            items: this.getItems(),
            buttons: this.getButtonCfg()
        });

        this.callParent(arguments);
    },

    getButtonCfg: function(){
        var ret = [{
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        },{
            text: 'Full Screen',
            scope: this,
            handler: function(btn){
                window.open(LABKEY.ActionURL.buildURL('ehr', 'animalHistory', this.containerPath) + '#subjects:' + this.subjectId + '&inputType:singleSubject&showReport:1&activeReport:clinicalHistory', '_blank');
                btn.up('window').close();
            }
        }];

        if (EHR.Security.hasLoaded()){
            ret.push({
                text: 'Actions',
                menu: EHR.panel.ClinicalManagementPanel.getActionMenu(this.subjectId, true)
            });
        }

        return ret;
    },

    getItems: function(){
        return [{
            xtype: 'ehr-smallformsnapshotpanel',
            showActionsButton: false,
            subjectId: this.subjectId,
            hideHeader: true,
            style: 'padding: 5px;'
        },{
            xtype: 'tabpanel',
            items: [{
                xtype: 'ehr-clinicalhistorypanel',
                title: 'History',
                border: true,
                width: 1230,
                gridHeight: 400,
                height: 400,
                autoLoadRecords: true,
                autoScroll: true,
                subjectId: this.subjectId,
                containerPath: this.containerPath,
                minDate: this.minDate || Ext4.Date.add(new Date(), Ext4.Date.YEAR, -2)
            },{
                xtype: 'ehr-weightgraphpanel',
                title: 'Weights',
                subjectId: this.subjectId,
                containerPath: this.containerPath,
                width: 1230,
                border: true
            }]
        }];
    }
});