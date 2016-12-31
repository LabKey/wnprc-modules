/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.TaskWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            items: this.getItems(),
            buttons: this.getButtons()
        });

        this.callParent(arguments);
    },

    getItems: function(){
        return [{
            xtype: 'ehr-taskdataentrypanel',
            taskId: this.taskId
        }]
    },

    getButtons: function(){
        return [{
            text: 'Close',
            handler: function(btn){
                btn.up('window').close();
            }
        }]
    }
});