/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 * @cfg {String} dataRegionName
 */
Ext4.define('EHR.window.ManageTreatmentsWindow', {
    extend: 'Ext.window.Window',

    width: 1200,
    minHeight: 50,

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Manage Treatments: ' + this.animalId,
            modal: true,
            closeAction: 'destroy',
            items: [{
                xtype: 'ehr-managetreatmentspanel',
                animalId: this.animalId,
                hideButtons: true
            }],
            buttons: this.getButtonConfig()
        });

        this.callParent(arguments);
    },

    getButtonConfig: function(){
        var buttons = EHR.panel.ManageTreatmentsPanel.getOrderTreatmentButtonConfig(this);
        buttons.push({
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        });

        return buttons;
    }
});
