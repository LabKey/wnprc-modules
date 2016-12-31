/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg remarkFormat
 */
Ext4.define('EHR.panel.ClinicalRemarkPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-clinicalremarkpanel',

    initComponent: function(){
        Ext4.apply(this, {
            bodyStyle: 'padding: 5px;',
            defaults: {
                labelWidth: 140,
                width: 550
            },
            items: [{
                xtype: 'xdatetime',
                itemId: 'dateField',
                fieldLabel: 'Date',
                allowBlank: false,
                name: 'date',
                value: new Date()
            },{
                xtype: 'combo',
                fieldLabel: 'Remark Format',
                isFormField: false,
                itemId: 'remarkFormat',
                displayField: 'label',
                valueField: 'label',
                store: {
                    type: 'store',
                    fields: ['label', 'fields', 'fieldLabels'],
                    data: [
                        {label: 'SOAP', fields: ['s', 'o', 'a', 'p'], fieldLabels: ['S', 'O', 'A', 'P']},
                        {label: 'P2', fields: ['p2'], fieldLabels: ['P2']},
                        {label: 'Hx', fields: ['hx'], fieldLabels: ['Hx']},
                        {label: 'Simple Remark', fields: ['remark'], fieldLabels: ['Remark']}
                    ]
                },
                value: this.remarkFormat,
                editable: false,
                listeners: {
                    scope: this,
                    change: function(field){
                        var panel = this.down('#remarkPanel');
                        panel.removeAll();
                        panel.add(this.getItems(field.store.findRecord('label', field.getValue())));
                    },
                    beforerender: function(field){
                        if (field.getValue()){
                            field.fireEvent('change', field, field.getValue());
                        }
                    }
                }
            },{
                xtype: 'container',
                itemId: 'remarkPanel'
            }]
        });

        this.store = this.getStoreCfg();

        this.callParent();
    },

    getItems: function(rec){
        var fields = rec.get('fields');
        var labels = rec.get('fieldLabels');

        var toAdd = [];
        Ext4.each(fields, function(field, idx){
            toAdd.push({
                xtype: 'textarea',
                fieldLabel: labels[idx],
                labelWidth: 140,
                name: field,
                width: 550,
                height: 60
            });
        });

        return toAdd;
    },

    getStoreCfg: function(){
        return {
            type: 'labkey-store',
            schemaName: 'study',
            queryName: 'Clinical Remarks',
            columns: 'Id,date,caseid,s,o,a,p,p2,hx,remark',
            maxRows: 0,
            autoLoad: true
        }
    }
});