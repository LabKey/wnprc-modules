/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This plugin is used in FormPanel to facilitate binding to an Ext4 record.
 * @param {boolean} disableUnlessBound: Defaults to false
 * @param {boolean} autoCreateRecordOnChange: Defaults to true
 * @param {boolean} autoBindFirstRecord: Defaults to false
 * @param {boolean} createRecordOnLoad: Defaults to false
 */
Ext4.define('EHR.plugin.Databind', {
    extend: 'Ext.AbstractPlugin',
    pluginId: 'ehr-databind',
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function(config){
        this.mixins.observable.constructor.call(this, config);

        this.callParent(arguments);
    },

    init: function(panel){
        this.id = this.id || Ext4.id();
        this.panel = panel;

        Ext4.apply(panel, {
            bindRecord: function(rec){
                var plugin = this.getPlugin('ehr-databind');
                plugin.bindRecord.call(plugin, rec);
            },
            unbindRecord: function(){
                var plugin = this.getPlugin('ehr-databind');
                plugin.unbindRecord.call(plugin);
            },
            getBoundRecord: function(){
                return this.getForm().getRecord();
            }
        });

        //set defaults
        panel.bindConfig = panel.bindConfig || {};
        panel.bindConfig = Ext4.Object.merge({
            disableUnlessBound: false,
            autoCreateRecordOnChange: true,
            autoBindFirstRecord: false,
            createRecordOnLoad: false
        }, panel.bindConfig);

        panel.addEvents('bindrecord');
        this.addEvents('fieldvaluechange');

        this.configureStore(panel.store);
        this.addFieldListeners();

        //we queue changes from all fields into a single event using buffer
        //this way batch updates of the form only trigger one record update/validation
        this.on('fieldvaluechange', this.onFieldValueChange, this, {buffer: 100, delay: 10});

        if (panel.boundRecord)
            panel.bindRecord(panel.boundRecord);

        this.callParent(arguments);
    },

    destroy: function(){
        this.clearListeners();
        delete this.panel;

        this.callParent(arguments);
    },

    configureStore: function(store){
        store = Ext4.StoreMgr.lookup(store);

        if (!store)
            return;

        if (store.hasLoaded())
            this.onStoreLoad(store);
        else
            this.mon(store, 'load', this.onStoreLoad, this);

        this.mon(store, 'add', this.onRecordAdd, this);
        this.mon(store, 'remove', this.onRecordRemove, this);
        this.mon(store, 'datachanged', this.onDataChanged, this);
        this.mon(store, 'update', this.onRecordUpdate, this);
        this.mon(store, 'validation', this.onRecordUpdate, this);
    },

    onStoreLoad: function(store){
        if (store.getCount() == 0){
            if (this.panel.bindConfig.createRecordOnLoad){
                this.createAndBindRecord();
            }
        }
        else {
            if (this.panel.bindConfig.autoBindFirstRecord){
                this.bindRecord(store.getAt(0));
            }
        }
    },

    onDataChanged: function(store){
        this.panel.getForm().isValid();

        if (this.panel.boundRecord){
            var errors = this.panel.boundRecord.validate();
            this.panel.getForm().markInvalid(errors);
        }
    },

    onRecordRemove: function(store, rec, idx){
        var boundRecord = this.panel.getForm().getRecord();
        if (boundRecord && rec == boundRecord){
            this.unbindRecord();
        }
    },

    onRecordAdd: function(store, rec){
        var boundRecord = this.panel.getForm().getRecord();

        if (this.panel.bindConfig.autoBindFirstRecord && store.getCount()){
            LDK.Assert.assertTrue('expected only one record in store: ' + store.storeId, 1, store.getCount());
            if (boundRecord !== store.getAt(0)){
                this.bindRecord(store.getAt(0));
            }
        }
    },

    //this is the listener for record update events.  it should update the values of the form, without firing change events on those fields
    onRecordUpdate: function(store, record, operation){
        var form = this.panel.getForm();
        if (form.getRecord() && record == form.getRecord()){
            // this flag is used to skip the record update events caused by this plugin
            // NOTE: normally immediately after the form commits changes to the form, we want to ignore this event
            // however, some stores set the values of fields internally, and we dont want to lose this.  see DrugAdministrationClientStore as an example
            // this is a problem for combos, since typeahead constantly sends updates to the record, and we dont want these getting pushed back to the field
            // this causes the user to lose their typeahead value (note, partial words would be invalid).
            // therefore if we triggered the update event, do a selective reload.
            var field;
            for (var fieldName in record.data){
                field = form.findField(fieldName);
                if (field && !field.isEqual(record.data[fieldName], field.getValue())){
                    if (!field.hasFocus){
                        this.setFormField(fieldName, record.data[fieldName]);
                    }
                }
            }

            form.isValid();
        }
    },

    bindRecord: function(record){
        var form = this.panel.getForm();
        if (form.getRecord()){
            if (form.getRecord().id == record.id){
                return; //no need to reload same record
            }

            this.unbindRecord();
        }

        form.suspendEvents();
        form.loadRecord(record);
        form.resumeEvents();
        Ext4.defer(form.isValid, 100, form);

        this.panel.fireEvent('bindrecord', this.panel, record);
    },

    unbindRecord: function(){
        var form = this.panel.getForm();
        if (form.getRecord()){
            form.updateRecord(form.getRecord());
        }

        form._record = null;
        form.reset();
    },

    //this is called after the a field's change event is called
    //it should update the values in the record, cause an update event to fire on that record, but not re-trigger change events on the fields
    onFieldValueChange: function(){
        if (!this.panel || this.panel.isDestroyed || this.isDestroyed){
            return;
        }

        var form = this.panel.getForm();
        var record = form.getRecord();
        if (record){
            this.updateRecordFromForm();
        }
        else if (this.panel.bindConfig.autoCreateRecordOnChange){
            this.createAndBindRecord();
        }
    },

    createAndBindRecord: function(){
        var form = this.panel.getForm();
        var values = form.getFieldValues();
        var record = this.panel.store.model.create();

        if (EHR.debug)
            console.log('creating: ' + this.panel.store.storeId);

        //remove empty values or we risk overriding defaults
        for (var field in values){
            if (Ext4.isEmpty(values[field]))
                delete values[field];
        }

        record.set(values); //otherwise record will not be dirty
        record.phantom = true;
        this.panel.store.add(record);
        this.bindRecord(record);
    },

    addFieldListeners: function(){
        this.panel.getForm().getFields().each(this.addFieldListener, this);
    },

    addFieldListener: function(f){
        LDK.Assert.assertEmpty('field already has databind listener: ' + f.name, f.hasDatabindListener);
        if (f.hasDatabindListener){
            return;
        }

        this.mon(f, 'change', this.onFieldChange, this);
        this.mon(f, 'blur', this.onFieldChange, this);

        var form = f.up('form');
        if (form.getRecord() && this.panel.bindConfig.disableUnlessBound && !this.panel.bindConfig.autoCreateRecordOnChange)
            f.setDisabled(true);

        Ext4.override(f, {
            getErrors: function(value){
                var errors = this.callOverridden(arguments);
                var record = EHR.DataEntryUtils.getBoundRecord(this);
                if (record){
                    record.validate().each(function(e){
                        if (e.field == this.name)
                            errors.push(e.message);
                    }, this);
                }
                errors = Ext4.Array.unique(errors);

                return errors;
            }
        });

        f.hasDatabindListener = true;
    },

    //this is separated so that events from multiple fields in a single form are buffered into one event per panel
    onFieldChange: function(field){
        if (this.panel && !this.panel.isDestroyed) {
            this.fireEvent('fieldvaluechange', field);
        }
    },

    //this is used instead of BasicForm's setValues in order to minimize event firing.  updating a field during editing has the
    //unfortunate consequence of moving the cursor to the end of the text, so we want to avoid this
    setFormValuesFromRecord: function(record) {
        var values = record.data;

        if (Ext4.isArray(values)) {
            // array of objects
            Ext4.Array.forEach(values, function(val) {
                this.setFormField(val.id, val.value);
            }, this);
        } else {
            // object hash
            Ext4.iterate(values, this.setFormField, this);
        }
        return this;
    },

    setFormField: function (fieldId, val) {
        var form = this.panel.getForm();
        var field = form.findField(fieldId);
        if (!field){
            return;
        }

        var fieldVal = field.getValue();
        if (!field.isEqual(fieldVal, val)) {
            if (Ext4.isObject(fieldVal) || Ext4.isArray(fieldVal)){
                console.error(fieldVal);
            }

            //TODO: combos and other multi-valued fields represent data differently in the store vs the field.  need to reconcile here
            field.suspendEvents();
            field.setValue(val);
            field.resumeEvents();
            if (form.trackResetOnLoad) {
                field.resetOriginalValue();
            }
            //field.isValid();
        }
    },

    // updates the values in the record based on the current state of the form.
    //TODO: combos and other multi-valued fields represent data differently in the store vs the field.
    // if we need to converts objects to delimited strings or massage radiogroup values, we could do so here
    updateRecordFromForm: function(){
        var form = this.panel.getForm();
        var record = form.getRecord();
        if (record){
            form.updateRecord(record);
        }
    }
});