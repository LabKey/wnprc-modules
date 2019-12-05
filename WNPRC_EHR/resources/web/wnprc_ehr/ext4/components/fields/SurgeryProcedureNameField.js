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
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.resolveProcedureNameFromStore();
                        this.getPicker().refresh();
                    }
                }

            },
            listeners: {
                beforerender: function (field) {
                    var target = field.up('form');
                    if (!target) {
                        target = field.up('grid');
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

    // trigger1Cls: 'x4-form-search-trigger',
    //
    // onTrigger1Click: function(){
    //     var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
    //     if (!boundRecord){
    //         Ext4.Msg.alert('Error', 'Unable to locate associated animal Id');
    //         return;
    //     }
    //
    //     var procedure_type = boundRecord.get('procedureType');
    //     if (!procedure_type){
    //         Ext4.Msg.alert('Error', 'No Procedure Type Selected');
    //         return;
    //     }
    //
    //     this.updateDropdown(procedure_type);
    // },

    updateDropdown: function (procedure_type) {
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('SurgeryProcedureNameField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!procedure_type && boundRecord)
            procedure_type = boundRecord.get('procedureType');

        this.emptyText = 'Select procedure...';

        var sql = this.makeSql(procedure_type);
        this.store.sql = sql;
        this.store.removeAll();
        this.store.load();
    },

    makeSql: function (procedure_type) {
        var sql = 'select name,displayname from wnprc.surgery_procedure_name';
        if (procedure_type && procedure_type.length > 0) {
            sql += ' where type = \'' + procedure_type.toLowerCase() + '\'';
        } else {
            sql += ' where type = \'\'';
        }
        return sql;
    },

    resolveProcedureNameFromStore: function(){
        var val = this.getValue();
        if (!val || this.isDestroyed)
            return;

        LDK.Assert.assertNotEmpty('Unable to find store in SurgeryProcedureNameField', this.store);
        var rec = this.store ? this.store.findRecord('procedureName', val) : null;
        if (rec){
            return;
        }

        rec = this.allProjectStore.findRecord('procedureName', val);
        if (rec){
            var newRec = this.store.createModel({});
            newRec.set({
                project: rec.data.project,
                account: rec.data.account,
                displayName: rec.data.displayName,
                protocolDisplayName: rec.data['protocol/displayName'],
                protocol: rec.data.protocol,
                title: rec.data.title,
                //      investigator: rec.data['investigatorId/lastName'],
                isAssigned: 0,
                fromClient: true
            });

            this.store.insert(0, newRec);

            return newRec;
        }
    }
});