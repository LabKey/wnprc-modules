/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @cfg pairedWithRoomField.  Note: if true, you must implement getRoomField(), which returns the cognate ehr-roomfield
 */
Ext4.define('EHR.form.field.AnimalGroupField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-animalgroupfield',

    fieldLabel: 'Animal Group',
    expandToFitContent: true,
    nullCaption: '[Blank]',
    editable: false,
    typeAhead: true,

    initComponent: function(){
        Ext4.apply(this, {
            displayField: 'name',
            valueField: 'rowid',
            queryMode: 'local',
            store: Ext4.create('LABKEY.ext4.data.Store', {
                schemaName: 'ehr',
                queryName: 'animal_groups',
                sort: 'name',
                filterArray: [LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)],
                autoLoad: true
            })
        });

        this.callParent(arguments);
    }
});