/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.NecropsyInstructionsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-necropsyinstructionspanel',

    initComponent: function(){
        LDK.Assert.assertNotEmpty('No data entry panel', this.dataEntryPanel);

        var buttons = [];
        Ext4.Array.forEach(['APPLYFORMTEMPLATE_ENCOUNTER', 'COPYFROMCASE', 'ENTERDEATH'], function(name){
            var btnCfg = EHR.DataEntryUtils.getDataEntryFormButton(name);
            if (btnCfg){
                btnCfg = this.dataEntryPanel.configureButton(btnCfg);
                if (btnCfg){
                    buttons.push(btnCfg);
                }
            }
        }, this);

        Ext4.apply(this, {
            defaults: {

            },
            bodyStyle: 'padding: 5px;',
            title: 'Instructions',
            items: [{
                html: 'This form is designed for necropsy entry.  The top section contains basic information on the necropsy.  This includes the final remarks, which will appear visible in the animal record.  ' +
                        'The bottom sections can be used to enter other comments, tissues, diagnoses, etc.  The buttons below may be useful for entry.  You can use the \'Apply Form Template\' button to add defaults to each section, or the \'Copy From Necropsy\' button to copy data from a previous case.  Manage of the animal death record is separate from the necropsy form, and can be accomplished using the \'Enter Death\' button below.',
                maxWidth: Ext4.getBody().getWidth() * 0.8,
                style: 'padding-top: 10px;padding-bottom: 10px;',
                border: false
            }, {
                layout: 'hbox',
                border: false,
                defaults: {
                    style: 'margin: 5px;'
                },
                items: buttons
            }]
        });

        this.callParent(arguments);
    }

});