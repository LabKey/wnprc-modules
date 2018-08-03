Ext4.define('WNPRC.ext.components.LinkedSurgeryProcedureField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-linkedsurgeryprocedurefield',

    initComponent: function () {
        Ext4.apply(this, {
            itemId: 'linkedRequestField',
            displayField: 'displayName',
            valueField: 'requestid',
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
                    var target = field.up('form');
                    if (!target)
                        target = field.up('grid');

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'animalchange', field.updateDropdown, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }
                    field.hide();
                }
            },
            anyMatch: true,
            caseSensitive: false
        });

        this.callParent(arguments);
    },

    updateDropdown: function (animalId) {
        var sql = this.makeSql(animalId);
        this.store.sql = sql;
        this.store.removeAll();
        this.store.load();
    },

    makeSql(animalId) {
        return 'select a.procedurename || \' at \' || a.date || \' (\' || a.Id || \')\' as displayName, a.requestid from study.surgery_procedure a where a.qcstate = 5 and a.project in (select b.project from study.assignment b where b.Id = \'' + animalId + '\')';
        //return 'select concat(concat(a.Id,\' at \'),a.date) as displayName, a.objectid from study.surgery_procedure a where a.qcstate = 5 and a.project in (select b.project from study.assignment b where b.Id = \'' + animalId + '\')';
    }
});