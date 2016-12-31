/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('PopulationTrendsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-populationtrendspanel',

    initComponent: function(){
        Ext4.apply(this, {
            style: 'padding: 5px',
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Population Trends By Year:</b>'
            },{
                html: '<hr>'
            },{
                xtype: 'container',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'numberfield',
                    itemId: 'minYear',
                    fieldLabel: 'Min Year'
                },{
                    xtype: 'numberfield',
                    itemId: 'maxYear',
                    fieldLabel: 'Max Year'
                },{
                    xtype: 'radiogroup',
                    itemId: 'grouping',
                    fieldLabel: 'Grouping',
                    columns: 1,
                    items: [{
                        boxLabel: 'Group By Species and Age',
                        inputValue: 'speciesAndAge'
                    },{
                        boxLabel: 'Group By Species Only',
                        inputValue: 'species',
                        checked: true
                    }]
                },{
                    xtype: 'button',
                    text: 'Reload',
                    border: true,
                    scope: this,
                    handler: function(btn){
                        Ext4.Msg.alert('', 'This section has not yet been enabled');
                    }
                }]
            }]
        });

        this.callParent(arguments);
    }
});