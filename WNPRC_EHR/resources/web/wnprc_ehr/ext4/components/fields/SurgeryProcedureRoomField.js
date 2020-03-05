Ext4.define('WNPRC.ext.components.SurgeryProcedureRoomField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-surgeryprocedureroomfield',

    initComponent: function () {
        Ext4.apply(this, {
            displayField: 'displayname',
            valueField: 'room',
            queryMode: 'local',
            forceSelection: true,
            matchFieldWidth: true,
            store: {
                type: 'labkey-store',
                schemaName: 'wnprc',
                sql: this.makeSql(),
                sort: 'room',
                autoLoad: true

            },
            listeners: {
                beforerender: function (field) {
                    var isForm = true;
                    var target = field.up('form');
                    if (!target) {
                        target = field.up('grid');
                        isForm = false;
                    }

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'procedurechange', field.updateDropdown, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }
                    this.updateDropdown();
                }
            },
            anyMatch: true,
            caseSensitive: false
        });

        this.callParent(arguments);
    },

    updateDropdown: function (procedure_category) {
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('SurgeryProcedureRoomField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!procedure_category && boundRecord)
            procedure_category = boundRecord.get('procedureCategory');

        this.emptyText = 'Select room...';


        var sql = this.makeSql(procedure_category);
        this.store.sql = sql;
        this.store.removeAll();
        this.store.load();
    },

    makeSql: function (room_type) {
        var sql = 'select room,displayname from wnprc.procedure_rooms';
        if (room_type && room_type.length > 0) {
            if (room_type === 'surgery') {
                sql += ' where type = \'' + room_type.toLowerCase() + '\'';
            }
        }
        return sql;
    }
});