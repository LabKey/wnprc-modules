/**
 * This field is used to display a list of pregnancies that the entry can be linked with.
 */
Ext4.define('WNPRC.form.field.PregnancyIdField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-pregnancyidfield',

    fieldLabel: 'pregnancyid',
    typeAhead: true,
    forceSelection: true, //NOTE: has been re-enabled, but it is important to let the field get set prior to loading
    emptyText:'',
    disabled: false,
    matchFieldWidth: false,

    initComponent: function(){
        var ctx = EHR.Utils.getEHRContext();

        this.allPregnancyStore = new LABKEY.ext4.data.Store({
            type: 'labkey-store',
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            schemaName: 'study',
            queryName: 'pregnancies',
            columns: 'lsid,date_conception,sireid',
            sort: '-date_conception',
            storeId: ['study', 'pregnancies', 'Id', 'lsid'].join('||'),
            autoLoad: true
        });

        this.trigger2Cls = Ext4.form.field.ComboBox.prototype.triggerCls;
        this.onTrigger2Click = Ext4.form.field.ComboBox.prototype.onTriggerClick;

        Ext4.apply(this, {
            displayField: 'displayString',
            valueField: 'lsid',
            queryMode: 'local',
            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: {
                type: 'labkey-store',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: '-date_conception',
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.resolvePregnancyFromStore();
                        this.getPicker().refresh();
                    }
                }
            },
            listeners: {
                scope: this,
                beforerender: function(field){
                    var target = field.up('form');
                    if (!target)
                        target = field.up('grid');

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'animalchange', field.getPregnancies, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }

                    //attempt to load for the bound Id
                    this.getPregnancies();
                }
            }
        });

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            innerTpl: this.getInnerTpl(),
            getInnerTpl: function(){
                return this.innerTpl;
            },
            style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        });

        this.callParent(arguments);
    },

    getInnerTpl: function(){
        //return ['Sire: {[values["sireid"] + " - " + values["date_conception"]]}'];
        return ['{[values["date_conception"] + " (Sire: " + values["sireid"] + ")"]}'];
    },

    trigger1Cls: 'x4-form-search-trigger',

    onTrigger1Click: function(){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            Ext4.Msg.alert('Error', 'Unable to locate associated animal Id');
            return;
        }

        var id = boundRecord.get('Id');
        if (!id){
            Ext4.Msg.alert('Error', 'No Animal Id Provided');
            return;
        }

        this.getPregnancies(id);
    },

    makeSql: function(id, newRecord = true){
        if (!id && !this.includeDefaultProjects)
            return;

        //avoid unnecessary reloading
        var key = id;
        if (this.loadedKey == key){
            return;
        }
        this.loadedKey = key;

        let sql = 'select lsid, \
                   to_char(date_conception, \'yyyy-MM-dd\') as date_conception, \
                   sireid, \
                   to_char(date_conception, \'yyyy-MM-dd\') || \' (Sire: \' || sireid || \')\' as displayString \
                   from (select p.lsid \
                               ,p.date_conception \
                               ,p.sireid \
                         from pregnancies p \
                         where p.Id = \'' + id + '\'';

        if (newRecord) {
            sql += 'and not exists (select * \
                                    from pregnancy_outcomes po \
                                    where po.pregnancyid = p.lsid)'
        }
        sql +=          'order by date_conception desc) \
                   current_pregnancies order by date_conception desc';

        sql = sql.replace(/\s+/g, ' ');

        return sql;
    },

    getPregnancies : function(id){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('PregnancyIdField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!id && boundRecord) {
            id = boundRecord.get('Id');
        }

        this.emptyText = 'Select pregnancy...';
        let sql;
        if (boundRecord) {
            sql = this.makeSql(id, boundRecord.phantom);
        } else {
            sql = this.makeSql(id, true);
        }
        if (sql){
            this.store.loading = true;
            this.store.sql = sql;
            this.store.removeAll();
            this.store.load();
        }
    },

    setValue: function(val){
        var rec;
        if (Ext4.isArray(val)){
            val = val[0];
        }

        if (val && Ext4.isPrimitive(val)){
            rec = this.store.findRecord('pregnancyid', val);
            if (!rec){
                rec = this.resolvePregnancy(val);
            }
        }

        if (rec){
            val = rec;
        }

        // NOTE: if the store is loading, Combo will set this.value to be the actual model.
        // this causes problems downstream when other code tries to convert that into the raw datatype
        if (val && val.isModel){
            val = val.get(this.valueField);
        }

        this.callParent([val]);
    },

    resolvePregnancyFromStore: function(){
        var val = this.getValue();
        if (!val || this.isDestroyed)
            return;

        LDK.Assert.assertNotEmpty('Unable to find store in PregnancyIdField', this.store);
        var rec = this.store ? this.store.findRecord('pregnancyid', val) : null;
        if (rec){
            return;
        }

        rec = this.allPregnancyStore.findRecord('pregnancyid', val);
        if (rec){
            var newRec = this.store.createModel({})
            newRec.set({
                lsid: rec.data.lsid,
                date_conception: rec.data.date_conception,
                fromClient: true
            });

            this.store.insert(0, newRec);
            return newRec;
        }
    },

    resolvePregnancy: function(val){
        if (this.allPregnancyStore.isLoading()){
            this.allPregnancyStore.on('load', function(store){
                var newRec = this.resolvePregnancyFromStore();
                if (newRec)
                    this.setValue(val);
            }, this, {single: true});
        }
        else {
            this.resolvePregnancyFromStore();
        }
    }
});