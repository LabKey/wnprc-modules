Ext4.define('WNPRC.ext.components.SurgeryProcedureNameField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-surgeryprocedurenamefield',

    initComponent: function () {
        Ext4.apply(this, {
            displayField: 'displayname',
            valueField: 'name',
            queryMode: 'local',
            forceSelection: true,
            matchFieldWidth: true,
            store: {
                type: 'labkey-store',
                schemaName: 'wnprc',
                sql: this.makeSql(),
                sort: 'name',
                autoLoad: true

            },
            listeners: {
                beforerender: function (field) {
                    var target = field.up('form');
                    if (!target)
                        target = field.up('grid');

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'procedurechange', field.updateDropdown, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }
                }
            },
            anyMatch: true,
            caseSensitive: false
        });

        this.callParent(arguments);
    },

    updateDropdown: function (room_type) {
        var sql = this.makeSql(room_type);
        this.store.sql = sql;
        this.store.removeAll();
        this.store.load();
    },

    makeSql(room_type) {
        var sql = 'select name,displayname from wnprc.surgery_procedure_name';
        console.log('room_type: ' + room_type);
        if (room_type && room_type.length > 0) {
            sql += ' where type = \'' + room_type.toLowerCase() + '\'';
        } else {
            sql += ' where type = \'\'';
        }
        return sql;
    }
});