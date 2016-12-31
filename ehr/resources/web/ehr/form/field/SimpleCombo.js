/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.SimpleCombo', {
    extend: 'LABKEY.ext4.ComboBox',
    alias: 'widget.ehr-simplecombo',

    initComponent: function(){
        Ext4.apply(this, {
            triggerAction: 'all',
            queryMode: 'local',
            typeAhead: true,
            store: {
                type: 'labkey-store',
                containerPath: this.containerPath,
                schemaName: this.schemaName,
                queryName: this.queryName,
                viewName: this.viewName,
                columns: this.columns,
                sort: this.sortFields || null,
                filterArray: this.filterArray,
                autoLoad: true
            }
        });

        this.callParent();
    }
});