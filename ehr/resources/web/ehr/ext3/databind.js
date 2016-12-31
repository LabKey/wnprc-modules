/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace('EHR.ext.plugins');

/**
 * @name EHR.ext.plugins
 * @namespace A namespace containing various Ext plugins used in the EHR.
 *
 */

/**
 * A plugin for EHR.ext.FormPanel that will allow the panel to 'bind' to an Ext record, which allows changes on either the panel or record to alter the other.
 * @name EHR.ext.plugins.DataBind
 * @augments Ext.util.Observable
 * @description
 *
 * This plugin is adapted from the plugin found <a href="http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding">here</a>.
 * It is used heavily throughout the EHR data entry UI.  This allows the forms to consist of a store (which holds one or more records) and various
 * UI elements (FormPanel or GridPanel) which display them.  Changes made in either the store record or through the form/grid will be reflected on
 * the other side.  This allows a form to bind() or unbind() records, which lets the form toggle between many records.
 * <p>
 * This plugin creates a new param in the FormPanel called bindConfig.  This parameter is an object with the following options:<br>
 * <li>disableUnlessBound: If true, inputs in the form will be disabled unless a record is bound</li>
 * <li>bindOnChange: If true, a new record will be created and bound to the form (if no record is already bound) whenever the value of one of the fields changes</li>
 * <li>showDeleteBtn: If true, a button will be added to the bbar of the form that will delete the bound record</li>
 * <li>autoBindRecord: If true, when the store loads the form will automatically bind the first record of the store</li>
 * <li>createRecordOnLoad: If true, when the store loads a new record will be created and bound unless the store already has records</li>
 */

//this sets up listeners to automatically update the record or form based on changes in the other

EHR.ext.plugins.DataBind = Ext.extend(Ext.util.Observable, {
    init:function(o) {
        /*
         * This plugin adds a series of new methods to the bound form panel:
         */
        Ext.applyIf(o, {
            bindConfig: {
                disableUnlessBound: true,
                bindOnChange: false,
                showDeleteBtn: false,
                autoBindRecord: false,
                createRecordOnLoad: false
            },
            //private
            //returns the bound store
            getStore : function()
            {
                return this.store;
            },
            //private
            //removes the bound store and record
            removeStore: function(){
                if(!this.store) return;

                delete this.store.boundPanel;
                delete this.store;
            },
            //private
            // a helper to identify all fields that should have listeners added.
            // used because CheckboxGroups and RadioGroups are tricky to monitor correctly
            getFieldsToBind : function(){
                var fields = [];
                var findMatchingField = function(f) {
                    if (f.isFormField) {
                        if (f.dataIndex) {
                            fields.push(f);
                        } else if (f.isComposite) {
                            f.items.each(findMatchingField);
                        }
                    }
                };
                this.getForm().items.each(findMatchingField, this);
                return fields;
            },
            //private
            //This will bind the supplied record to this form.  If bound, changes in the record will be reflected in the form
            //and vise versa.
            bindRecord: function(record){
                if (!record || (this.boundRecord === record)){
                    return;
                }

                //commit the old record before loading a new one
                if(this.boundRecord){
                    this.unbindRecord();
                }

                this.boundRecord = record;
                this.boundRecord.store.boundPanel = this;

                Ext.each(this.getFieldsToBind(), function(f){
                    if (this.bindConfig.disableUnlessBound){
                        if(f.editable!==false)
                            f.setDisabled(false);
                    }
                    f.setValue(record.get(f.dataIndex));
                }, this);
//                this.updateRecord();

                //allow changes in the record to update the form
                record.store.on('update', this.updateForm, this);
                //record.store.on('validation', this.updateForm, this);
                record.store.on('validation', this.markInvalid, this, {delay: 100});

                this.fireEvent('recordchange', this, record);
            },

            //private
            //unbinds a record from the store, if present.  will disable fields if bindConfig.disableUnlessBound is true
            //fires the recordchange event
            unbindRecord: function(config)
            {
                var rec = this.boundRecord;
                if(rec){
                    this.updateRecord();
                    if(rec.store){
                        rec.store.un('update', this.updateForm, this);
                        rec.store.un('validation', this.markInvalid, this);
                    }
                    else if (config && config.store){
                        config.store.un('update', this.updateForm, this);
                        config.store.un('validation', this.markInvalid, this);
                    }

                    if(config && config.deleteRecord){
                        rec.store.deleteRecords([rec]);
                    }
                }

                this.boundRecord = undefined;

                Ext.each(this.getFieldsToBind(), function(f){
                    if (this.bindConfig.disableUnlessBound){
                        f.setDisabled(true);
                    }
                }, this);

                this.form.reset();
                this.fireEvent('recordchange', this);
            },

            //private
            //when a field changes, this updates the bound record
            updateRecord : function()
            {
                var fields = this.getFieldsToBind();

                //create a record onChange if selected
                if(!this.boundRecord && this.bindConfig.bindOnChange && this.store){
                    var values = {};
                    Ext.each(fields, function(f){
                        var val = this.getBoundFieldValue(f);
                        if(!Ext.isEmpty(val))
                            values[f.name] = val;
                    }, this);
                    var record = this.store.addRecord(values);
                    record.markDirty();
                    this.bindRecord(record);
                }

                if(!this.boundRecord)
                    return;

                values = {};
                Ext.each(fields, function(f){
                    var val = this.getBoundFieldValue(f);
                    var oldVal = this.boundRecord.get(f.dataIndex);
                    //TODO: better logic??
                    if(!(val===oldVal || String(val) == String(oldVal)))
                        values[f.dataIndex] = val;
                }, this);

                //we only fire the update event if we actually made changes
                //console.log(values);
                if(!EHR.Utils.isEmptyObj(values)){
                    this.boundRecord.beginEdit();
                    for (var i in values){
                        this.boundRecord.set(i, values[i]);
                    }
                    //the following is to prevent
                    this.awatingUpdateEvent = true;
                    this.boundRecord.endEdit();
                }

                this.markInvalid();
            },

            //private
            //when a record changes, this updates the fields on the form
            updateForm: function(s, recs, idx)
            {

                if(this.awatingUpdateEvent){
                    delete this.awatingUpdateEvent;
                    return;
                }

                Ext.each(recs, function(r){
                    if(r === this.boundRecord){
                        this.getForm().loadRecord(r);
                    }
                }, this);
            },

            //private
            //when configuring a form, this adds listeners to all fields to monitor for change events
            addFieldListeners: function()
            {
                Ext.each(this.getFieldsToBind(), function(f){
                    this.addFieldListener(f);
                }, this);
            },

            //private
            //the handler for field onChange events.  this is separated so that multiple fields in a single form are filtered into one event per panel
            onFieldChange: function(field){
                this.fireEvent('fieldchange', field);
            },

            //private
            //called to convert the value returned by the field to the value stored in the record.  this is separated because complex field
            //types like RadioGroups and CheckboxGroups.
            getBoundFieldValue: function(f){
                if (f instanceof Ext.form.RadioGroup){
                    //QUESTION: safe to make the assumption we only allow 1 checked at once?
                    return (f.getValue() ? f.getValue().inputValue : null);
                }
                else if (f instanceof Ext.form.Radio){
                    if(f.checked)
                        return f.getValue();
                    else
                        return false;
                }
                else if (f instanceof Ext.form.CheckboxGroup){
                    return f.getValueAsString();
                }
                else
                    return f.getValue();
            },

            //private
            onRecordRemove: function(store, rec, idx){
                if(this.boundRecord && rec == this.boundRecord){
                    this.unbindRecord({store: store});
                }
            },

            //private
            focusFirstField: function(){
                var firstFieldItem = this.getForm().items.first();
                if(firstFieldItem && firstFieldItem.focus){
                    //delay the focus for 500ms to make sure the field is visible
                    firstFieldItem.focus(false,500);
                }
            },

            //private
            addFieldListener: function(f){
                if(f.hasDatabindListener){
                    //console.log('field already has listener');
                    return;
                }

                if(f instanceof Ext.form.Checkbox){
                    f.on('check', this.onFieldChange, this);
                    f.on('change', this.onFieldChange, this);
                }
                else {
                    //NOTE: use buffer so groups like checkboxgroup dont fire repeated events
                    f.on('change', this.onFieldChange, this);
                }

                //NOTE: override getErrors(), so the field can be made to display server-side errors
                if(!f.oldGetErrors)
                    f.oldGetErrors = f.getErrors;

                f.getErrors = function(value){
                    var errors = this.oldGetErrors.apply(this, arguments);
                    var panel;
                    if(this.ownerCt.isXType('ehr-formpanel'))
                        panel = this.ownerCt;
                    else
                        panel = this.findParentByType('ehr-formpanel');

                    if(panel.boundRecord && panel.boundRecord.errors){
                        Ext.each(panel.boundRecord.errors, function(error){
                            if(error.field == this.name){
                                errors.push((error.severity=='INFO' ? error.severity+': ' : '')+error.message);
                            }
                        }, this);
                    }

                    //if allowBlank==true, Ext.Form.TextField will return duplicate 'Field is required' messages
                    errors = Ext.unique(errors);

                    //the form will only display the first error, so we concat them
                    if(errors.length)
                        errors = [errors.join(";<br>")];

                    return errors;
                };

                if(this.bindConfig.disableUnlessBound && !this.boundRecord && !this.bindConfig.bindOnChange)
                    f.setDisabled(true);

                f.hasDatabindListener = true;
            },

            //private
            //Configures the store with listeners to monitor record changes
            configureStore: function(){
                if (this.store)
                {
                    this.store = Ext.StoreMgr.lookup(this.store);
                    Ext.apply(this.store, {
                        boundPanel: this
                    });
                    
                    this.store.on('load', function(store, records, options)
                        {
                            // Can only contain one row of data.
                            if (records.length == 0){
                                if(this.bindConfig.createRecordOnLoad){
                                    var values = {};
                                    Ext.each(this.getFieldsToBind(), function(item){
                                        values[item.name] = this.getBoundFieldValue(item);
                                    }, this);
                                    var rec = new this.store.recordType(values);
                                    rec.markDirty();
                                    this.store.addRecord(rec);

                                    //called to force record to store's modified list
                                    this.store.afterEdit(rec);

                                    this.bindRecord(rec);
                                }
                            }
                            else {
                                //NOTE: I disabled this behavior b/c it was potentially
                                //confusing if the user loads a saved page and automatically
                                //has a previous record bound.
                                if(this.bindConfig.autoBindRecord){
                                    this.bindRecord(records[0]);
                                }
                            }
                        }, this);

                    //NOTE: this is called too late for this to matter
                    //this.store.on('beforecommit', this.updateRecord, this);

                    this.store.on('remove', this.onRecordRemove, this);
                }
            }
        });

        o.configureStore();
        o.addFieldListeners();
        o.addEvents('beforesubmit', 'recordchange', 'formchange', 'fieldchange');

        //we queue changes from all fields into a single event using buffer
        //this way batch updates of the form only trigger one record update/validation
        o.on('fieldchange', o.updateRecord, o, {delay: 20, buffer: 100});

        if(o.bindConfig.showDeleteBtn !== false){
            if(o.getBottomToolbar())

                o.getBottomToolbar().insert(0, {xtype: 'tbspacer', width: 100});

                o.getBottomToolbar().insert(0, {
                    xtype: 'button',
                    text: 'Clear Section',
                    ref: 'recordDeleteBtn',
                    scope: o,
                    disabled: true,
                    handler: function(){
                        if(this.boundRecord){
                            Ext.MessageBox.confirm(
                                'Confirm',
                                'You are about to clear this section.  This will permanently delete these values.  Are you sure you want to do this?',
                                function(val){
                                    if(val=='yes')
                                        this.unbindRecord({deleteRecord: true});
                                },
                                this
                            );
                        }
                    }
                });

            o.on('recordchange', function(form, record){
                this.getBottomToolbar().recordDeleteBtn.setDisabled(record===undefined)
            }, o);
        }

        o.on('beforesubmit', function(c){
            console.log('updating record from form beforesubmit');
            c.updateRecord();
        });

        o.on('add', function(o, c, idx){
            var findMatchingField = function(f) {
                if (f.isFormField) {
                    if (f.dataIndex) {
                        this.addFieldListener(c);
                    } else if (f.isComposite) {
                        f.items.each(findMatchingField, this);
                    }
                }
            };
            findMatchingField.call(this, c);
        }, o, {delay: 300});
    }
}); 
Ext.preg('databind', EHR.ext.plugins.DataBind);






