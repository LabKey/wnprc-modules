/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.window.ManageCasesWindow', {
    extend: 'Ext.window.Window',

    width: 1100,
    minHeight: 50,

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Manage Cases: ' + this.animalId,
            modal: true,
            closeAction: 'destroy',
            items: [{
                xtype: 'ehr-managecasespanel',
                animalId: this.animalId,
                hideButtons: true
            }],
            buttons: this.getButtonConfig()
        });

        this.callParent(arguments);
    },

    getButtonConfig: function(){
        var buttons = EHR.panel.ManageCasesPanel.getButtonConfig();
        buttons.push({
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        });

        return buttons;
    }
});
