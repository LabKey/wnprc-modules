/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.SurgeryInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-surgeryinstructionspanel',

    initComponent: function(){
        var buttons = [];
        LDK.Assert.assertNotEmpty('No data entry panel', this.dataEntryPanel);
        var btnCfg = EHR.DataEntryUtils.getDataEntryFormButton('APPLYENCOUNTERDEFAULTS');
        if (btnCfg){
            btnCfg = this.dataEntryPanel.configureButton(btnCfg);
            if (btnCfg){
                btnCfg.text = 'Add Procedure Defaults';
                buttons.push(btnCfg);
            }
        }

        Ext4.apply(this, {
            defaults: {

            },
            bodyStyle: 'padding: 5px;',
            title: 'Instructions',
            items: [{
                html: 'This form is designed for surgery entry.  The top section contains basic information on the procedure(s).  The bottom sections can be used to enter the narrative, medications, etc.  Once you enter entered the animal(s) and procedures, use the bottom below to apply defaults to the other sections for those procedures.',
                maxWidth: Ext4.getBody().getWidth() * 0.8,
                style: 'padding-top: 10px;padding-bottom: 10px;',
                border: false
            },btnCfg]
        });

        this.callParent(arguments);
    }

});