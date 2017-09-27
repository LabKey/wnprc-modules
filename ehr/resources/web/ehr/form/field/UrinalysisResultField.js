/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.UrinalysisResultField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-urinalysisresultfield',

    initComponent: function(){
        this.plugins = this.plugins || [];
        this.plugins.push('ldk-usereditablecombo');

        this.store = this.store || {
            store: {
                type: 'labkey-store',
                columns: 'rowid,value,description',
                schemaName: 'ehr_lookups',
                queryName: 'urinalysis_qualitative_results',
                autoLoad: true
            }
        };

        this.store.columns = 'rowid,value,description,sort_order';
        this.store.sort = 'sort_order';

        this.callParent();
    },

    onTriggerClick: function(){
        var rec = EHR.DataEntryUtils.getBoundRecord(this);
        this.store.clearFilter();
        var testid = rec.get('testid'),
            tests,
            val = this.getValue(),
            picker = this.getPicker();

        if (rec && testid){
            this.store.filterBy(function(r){
                tests = r.get('description');
                tests = tests ? tests.split(',') : [];

                return r.get('value') == val || tests.indexOf(testid) != -1;
            }, this);

            if (this.store.getCount() == 0){
                this.store.clearFilter();
            }

            picker.refresh();
        }

        this.callParent(arguments);
    }
});