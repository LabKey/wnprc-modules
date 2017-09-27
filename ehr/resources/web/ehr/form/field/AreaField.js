/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @cfg pairedWithRoomField.  Note: if true, you must implement getRoomField(), which returns the cognate ehr-roomfield
 */
Ext4.define('EHR.form.field.AreaField', {
    extend: 'Ext.ux.CheckCombo',
    alias: 'widget.ehr-areafield',

    fieldLabel: 'Area',
    nullCaption: '[Blank]',
    editable: false,
    expandToFitContent: true,
    addAllSelector: true,
    typeAhead: true,

    initComponent: function(){
        Ext4.apply(this, {
            displayField:'area',
            valueField: 'area',
            queryMode: 'local',
            store: Ext4.create('LABKEY.ext4.data.Store', {
                schemaName: 'ehr_lookups',
                queryName: 'areas',
                sort: 'area',
                filterArray: [LABKEY.Filter.create('dateDisabled', true, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            })
        });

        this.callParent(arguments);

        if (this.pairedWithRoomField)
            this.addRoomListeners();
    },


    addRoomListeners: function(){
        this.on('select', function(field, records){
            if (!records.length)
                return;

            var areas = [];
            Ext4.Array.forEach(records, function(r){
                areas.push(r.get('area'));
            }, this);

            var roomField = this.getRoomField();
            roomField.suspendEvents();
            roomField.selectByAreas(areas);
            roomField.resumeEvents();
        }, this);

        this.on('render', function(field){
            var val = field.getValue();
            val = Ext4.isArray(val) || !val ? val : [val];

            var roomField = this.getRoomField();
            roomField.suspendEvents();
            roomField.selectByAreas(val);
            roomField.resumeEvents();
        }, this);
    }
});