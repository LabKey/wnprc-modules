/*
 * Copyright (c) 2010-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * This file contains custom ext components.
 */
Ext.namespace('EHR.ext', 'EHR.ext.plugins', 'Ext.ux.form');

/**
 * Contructs a CheckboxGroup where each radio is populated from a LabKey store.
 * This is an alternative to a combobox.
 * @class
 * @augments Ext.form.CheckboxGroup
 * @param {object} config The configuation object.  Will accept all config options from Ext.form.CheckboxGroup along with those listed here.
 * @param {object} [config.store] A LABKEY.ext.Store.  Each record will be used to
 * @param {string} [config.valueField] The name of the field to use as the inputValue
 * @param {string} [config.displayField] The name of the field to use as the label
 */
EHR.ext.RemoteCheckboxGroup = Ext.extend(Ext.form.CheckboxGroup,
{
    initComponent: function()
    {
        Ext.apply(this, {
            name: this.name || Ext.id(),
            storeLoaded: false,
            items: [{name: 'placeholder', fieldLabel: 'Loading..'}],
            buffered: true,
            listeners: {
                scope: this
//                change: function(c){
//                    console.log('remote checkbox on change')
//                },
//                blur: function(c){
//                    console.log('remote checkbox on blur')
//                }
            },
            tpl : new Ext.XTemplate('<tpl for=".">' +
                  '{[values["' + this.valueField + '"] ? values["' + this.displayField + '"] : "'+ (this.lookupNullCaption ? this.lookupNullCaption : '[none]') +'"]}' +
                    //allow a flag to display both display and value fields
                    '<tpl if="'+this.showValueInList+'">{[values["' + this.valueField + '"] ? " ("+values["' + this.valueField + '"]+")" : ""]}</tpl>'+
                    '</tpl>')

        });

        if(this.value){
            this.value = [this.value];
        }

        EHR.ext.RemoteCheckboxGroup.superclass.initComponent.call(this, arguments);

        //we need to test whether the store has been created
        if(!this.store){
            console.log('EHR.ext.RemoteCheckboxGroup requires a store');
            return;
        }

        if(this.store && !this.store.events)
            this.store = Ext.create(this.store, 'labkey-store');

        if(!this.store.getCount()) {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }
        else {
            this.onStoreLoad();
        }
    }

    ,onStoreLoad : function() {
        var item;
        this.store.each(function(record, idx){
            item = this.newItem(record);

            if(this.rendered){
                this.items.add(item);
                var col = (idx+this.columns.length) % this.columns.length;
                var chk = this.panel.getComponent(col).add(item);
                this.fireEvent('add', this, chk);
            }
            else {
                this.items.push(item)
            }
        }, this);

        //remove the placeholder checkbox
        if(this.rendered) {
            var item = this.items.first();
            this.items.remove(item);
            this.panel.getComponent(0).remove(item, true);
            this.ownerCt.doLayout();
        }
        else
            this.items.remove(this.items[0]);

        this.storeLoaded = true;
        this.buffered = false;

        if(this.bufferedValue){
            this.setValue(this.bufferedValue);
        }
    }
    ,newItem: function(record){
        return new Ext.form.Checkbox({
            xtype: 'checkbox',
            boxLabel: (this.tpl ? this.tpl.apply(record.data) : record.get(this.displayField)),
            inputValue: record.get(this.valueField),
            name: record.get(this.valueField),
            disabled: this.disabled,
            readOnly: this.readOnly || false,
            listeners: {
                scope: this,
                change: function(self, val){
                    //console.log('checkbox changed');
                    this.fireEvent('change', this, this.getValue());
                },
                check: function(self, val){
                    //console.log('checkbox checked');
                    this.fireEvent('change', this, this.getValue());
                }
            }
        });

    }
    ,setValue: function(v)
    {
        //NOTE: we need to account for an initial value if store not loaded.
        if(!this.storeLoaded){
            this.buffered = true;
            this.bufferedValue = v;
        }
        else {
            EHR.ext.RemoteCheckboxGroup.superclass.setValue.apply(this, arguments);
        }
    }
    ,setReadOnly : function(readOnly){
        EHR.ext.RemoteCheckboxGroup.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(readOnly);
    }
});
Ext.reg('ehr-remotecheckboxgroup', EHR.ext.RemoteCheckboxGroup);


//EHR.ext.DisplayField = Ext.extend(Ext.form.DisplayField,
//{
//    initComponent: function()
//    {
//        this.tpl = '<div>hello</div>';
//        EHR.ext.DisplayField.superclass.initComponent.apply(this, arguments);
//    },
//    getDisplayValue: function(v){
//        if(this.lookup && this.lookups !== false){
//            return v;
//        }
//        else if(Ext.isDate(v)){
//            return this.format ? v.format(this.format) : v.format('Y-m-d H:i');
//        }
//        else
//            return v;
//    },
//
//    setRawValue : function(v){
//        if(this.htmlEncode){
//            v = Ext.util.Format.htmlEncode(v);
//        }
//        return this.rendered ? (this.el.dom.innerHTML = (Ext.isEmpty(v) ? '' : v)) : (this.value = v);
//    },
//
//    setValue: function(v){
//        this.displayValue = this.getDisplayValue(v);
//        this.data = this.displayValue;
//        EHR.ext.DisplayField.superclass.setValue.apply(this, arguments);
//    }
//});
//Ext.reg('ehr-displayfield', EHR.ext.DisplayField);


/**
 * Contructs a RadioGroup where each radio is populated from a LabKey store.
 * This is an alternative to a combobox.
 * Adapted from:
 * http://www.sencha.com/forum/showthread.php?95860-Remote-Loading-Items-Remote-Checkbox-Group-Ext.ux.RemoteCheckboxGroup&highlight=checkboxgroup+event
 * @class
 * @augments Ext.form.RadioGroup
 * @param {object} config The configuation object.  Will accept all config options from Ext.form.RadioGroup along with those listed here.
 * @param {object} [config.store] A LABKEY.ext.Store.  Each record will be used to
 * @param {string} [config.valueField] The name of the field to use as the inputValue
 * @param {string} [config.displayField] The name of the field to use as the label
 */
EHR.ext.RemoteRadioGroup = Ext.extend(Ext.form.RadioGroup,
{
    initComponent: function()
    {
        Ext.apply(this, {
            name: this.name || Ext.id(),
            storeLoaded: false,
            items: [{name: 'placeholder', fieldLabel: 'Loading..'}],
            buffered: true,
            listeners: {
                scope: this
//                change: function(c){
//                    console.log('remote radio on change')
//                },
//                blur: function(c){
//                    console.log('remote radio on blur')
//                }
            },
            tpl : new Ext.XTemplate('<tpl for=".">' +
                  '{[values["' + this.valueField + '"] ? values["' + this.displayField + '"] : "'+ (this.lookupNullCaption ? this.lookupNullCaption : '[none]') +'"]}' +
                    //allow a flag to display both display and value fields
                    '<tpl if="'+this.showValueInList+'">{[values["' + this.valueField + '"] ? " ("+values["' + this.valueField + '"]+")" : ""]}</tpl>'+
                    '</tpl>')
        });

        if(this.value!==undefined){
            this.value = [this.value];
        }

        EHR.ext.RemoteRadioGroup.superclass.initComponent.call(this, arguments);

        //we need to test whether the store has been created
        if(!this.store){
            console.log('EHR.ext.RemoteRadioGroup requires a store');
            return;
        }

        if(this.store && !this.store.events)
            this.store = Ext.create(this.store, 'labkey-store');

        if(!this.store.getCount()) {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }
        else {
            this.onStoreLoad();
        }
    },

    onStoreLoad: function(){
        var item;
        this.store.each(function(record, idx){
            item = this.newItem(record);
            //this.relayEvents(item, ['change', 'check']);

            if(this.rendered){
                this.items.add(item);
                var col = (idx+this.columns.length) % this.columns.length;
                var chk = this.panel.getComponent(col).add(item);
                this.fireEvent('add', this, chk);
            }
            else {
                this.items.push(item)
            }
        }, this);

        //remove the placeholder radio
        if(this.rendered) {
            item = this.items.first();
            this.items.remove(item);
            this.panel.getComponent(0).remove(item, true);
            this.ownerCt.doLayout();
        }
        else
            this.items.remove(this.items[0]);

        this.buffered = false;
        this.storeLoaded = true;

        if(this.initialValue!==undefined){
            //console.log('setting initial value: '+this.dataIndex+'/'+this.initialValue)
            this.setValue(this.initialValue);
        }

        if(this.readOnly)
            this.setReadOnly(true);

    },
    newItem: function(record){
        return new Ext.form.Radio({
            xtype: 'radio',
            boxLabel: (this.tpl ? this.tpl.apply(record.data) : record.get(this.displayField)),
            //NOTE: Ext is going to convert this to a string later anyway
            //be careful will null and similar values
            inputValue: record.get(this.valueField)===null ? '' : record.get(this.valueField),
            name: this.name,
            //checked: record.get(this.valueField)==this.initialValue,
            readOnly: this.readOnly || false,
            bubbleEvents: ['blur', 'change', 'check'],
            disabled: this.disabled,
            //NOTE: checkboxgroup doesnt fire change otherwise
            listeners: {
                scope: this,
                change: function(self, val){
                    //console.log('radio changed');
                    this.fireEvent('change', this, this.getValue());
                },
                check: function(self, val){
                    //console.log('radio checked');
                    this.fireEvent('change', this, this.getValue());
                }
            }
        });
    },
    setValue: function(v)
    {
        //NOTE: we need to account for an initial value if store not loaded.
        if(!this.storeLoaded){
            this.buffered = true;
            this.value = [v];
            this.bufferedValue = v;
            this.initialValue = v;
            //console.log('buffering value: '+this.dataIndex+'/'+v)
        }
        else {
            Ext.form.RadioGroup.superclass.setValue.apply(this, arguments);
        }
    },
    setReadOnly : function(readOnly){
        EHR.ext.RemoteCheckboxGroup.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(readOnly);
    }
});
Ext.reg('ehr-remoteradiogroup', EHR.ext.RemoteRadioGroup);


/*
 * Contructs a combobox containing operators as might be used in a search form.
 * @class
 * @augments Ext.form.ComboBox
 * @param {object} config The configuation object.
 * @param {string} [config.initialValue] The initial value to use in this combo.
 * @param {string} [config.meta] The metadata object for this field, as supplied by LABKEY.Query.selectRows() or similar APIs.
 */
EHR.ext.OperatorCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(config){
        this.meta = this.meta || {};
        this.meta.jsonType = this.meta.jsonType || 'string';

        if(!this.initialValue){
            switch(this.meta.jsonType){
                case 'int':
                case 'float':
                    this.initialValue = 'eq';
                    break;
                case 'date':
                    this.initialValue = 'dateeq';
                    break;
                case 'boolean':
                    this.initialValue = 'startswith';
                    break;
                default:
                    this.initialValue = 'startswith';
                    break;
            }
        }

        Ext.apply(this, {
            xtype: 'combo'
            ,valueField:'value'
            ,displayField:'text'
            ,listWidth: 200
            ,typeAhead: false
            ,mode: 'local'
            ,triggerAction: 'all'
            ,editable: false
            ,value: this.initialValue
            ,store: this.setStore(this.meta, this.initialValue)
        });

        EHR.ext.OperatorCombo.superclass.initComponent.call(this)
    },
    setStore: function (meta, value) {
        var found = false;
        var options = [];
        if (meta.jsonType)
            Ext.each(LABKEY.Filter.getFilterTypesForType(meta.jsonType, meta.mvEnabled), function (filterType) {
                if (value && value == filterType.getURLSuffix())
                    found = true;
                if (filterType.getURLSuffix())
                    options.push([filterType.getURLSuffix(), filterType.getDisplayText()]);
            });

        if (!found) {
            for (var key in LABKEY.Filter.Types) {
                var filterType = LABKEY.Filter.Types[key];
                if (filterType.getURLSuffix() == value) {
                    options.unshift([filterType.getURLSuffix(), filterType.getDisplayText()]);
                    break;
                }
            }
        }

        return new Ext.data.ArrayStore({fields: ['value', 'text'], data: options });
    }
});
Ext.reg('ehr-operatorcombo', EHR.ext.OperatorCombo);


/*
 * Contructs a combobox suitable to use with a boolean field.  It will display the strings Yes/No bound to the values true/false.
 * @class
 * @augments Ext.form.ComboBox
 */
EHR.ext.BooleanCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,listWidth: 200
            ,forceSelection: true
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: [
                    [false, 'No'],
                    [true, 'Yes']
                ]
            })
        });

        EHR.ext.BooleanCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-booleancombo', EHR.ext.BooleanCombo);


/*
 * Contructs a combobox displaying the list of saved views for a given query
 * @class
 * @augments Ext.form.ComboBox
 * @param {object} config The configuation object.
 * @param {string} [config.containerPath] The containerPath to query
 * @param {string} [config.schemaName] The schema of the query
 * @param {string} [config.queryName] The name of the query
 * @param {string} [config.initialValue] The initial value for this combobox
 */
EHR.ext.ViewCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: []
            })
        });

        EHR.ext.ViewCombo.superclass.initComponent.call(this);

        LABKEY.Query.getQueryViews({
            containerPath: this.containerPath
            ,queryName: this.queryName
            ,schemaName: this.schemaName
            ,successCallback: this.onViewLoad
            ,failure: EHR.Utils.onError
            ,scope: this
        });

    },
    onViewLoad: function(data){
        if(!data || !data.views)
            return;

        var recs = [];
        var hasDefault = false;
        Ext.each(data.views, function(s){
            if(s.hidden)
                return;

            if(!s.name)
                hasDefault = true;
            recs.push([s.name, s.name || 'Default']);
        }, this);

        if(!hasDefault)
            recs.push(['', 'Default']);

        this.store.loadData(recs);
        this.store.sort('value');

        if(this.initialValue || this.initialConfig.initialValue)
            this.setValue(this.initialValue || this.initialConfig.initialValue)
    }
});
Ext.reg('ehr-viewcombo', EHR.ext.ViewCombo);


/*
 * Contructs a combobox displaying the list of container filters, suitable for a search panel.
 * @class
 * @augments Ext.form.ComboBox
 */
EHR.ext.ContainerFilterCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,listWidth: 200
            ,forceSelection: true
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: [
                    ['', 'Current Folder Only'],
                    ['CurrentAndSubfolders', 'Current Folder and Subfolders']
                ]
            })
        });

        EHR.ext.ContainerFilterCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-containerfiltercombo', EHR.ext.ContainerFilterCombo);


/*
 * Contructs a triggerfield that is regex filtered to only accept digits (0-9).  Used in several EHR forms where a trigger button was required,
 * such as drug dose inputs.
 * @class
 * @augments Ext.form.TriggerField
 */
EHR.ext.TriggerNumberField = function(config){
    EHR.ext.TriggerNumberField.superclass.constructor.call(this, config);
};
Ext.extend(EHR.ext.TriggerNumberField, Ext.form.TriggerField, {
    baseChars : "0123456789",
/**
     * @cfg {Boolean} autoStripChars True to automatically strip not allowed characters from the field. Defaults to false
     */
    autoStripChars: false,
    allowDecimals : true,

/**
     * @cfg {String} decimalSeparator Character(s) to allow as the decimal separator (defaults to '.')
     */
    decimalSeparator : ".",

/**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,

/**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,

    // private
    initEvents : function() {
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        allowed = Ext.escapeRe(allowed);
        this.maskRe = new RegExp('[' + allowed + ']');
        if (this.autoStripChars) {
            this.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
        }

        Ext.form.NumberField.superclass.initEvents.call(this);
    }

});
Ext.reg('ehr-triggernumberfield', EHR.ext.TriggerNumberField);


/**
 * This is a RadioGroup that will either be true or null.  It was originally designed to be an option on data entry forms,
 * but the conversion between null and false proves difficult and this was never used.
 * @deprecated
 */
EHR.ext.ApproveRadio = Ext.extend(Ext.form.RadioGroup, {
    initComponent: function() {
        Ext.apply(this, {
            allowBlank: false,
            items: [{
                xtype: 'radio',
                name: this.id,
                inputValue: '',
                boxLabel: 'No',
                checked: true
            },{
                xtype: 'radio',
                name: this.id,
                inputValue: 'true',
                boxLabel: 'Yes',
                allowBlank: false
            }]
        });

        EHR.ext.ApproveRadio.superclass.initComponent.call(this, arguments);
    },
    setValue: function(v)
    {
        if(Ext.isBoolean(v)){
            v = String(v);
        }
        if(v != 'true'){
            v = '';
        }
        EHR.ext.ApproveRadio.superclass.setValue.apply(this, [v]);
    },
    getValue: function()
    {
        var val = EHR.ext.ApproveRadio.superclass.getValue.apply(this, arguments);
        if(val && val.inputValue != 'true'){
            val = null;
        }
        return val;

    }

});
Ext.reg('ehr-approveradio', EHR.ext.ApproveRadio);


/**
 * Creates a combobox which includes a special entry in the menu called 'Other'.  If selected, a popup appears allowing
 * the user to enter in a new value, not present in the list.  This value is added to the store and will be saved.
 */
EHR.ext.UserEditableCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(config){
        this.plugins = this.plugins || [];
        this.plugins.push('ehr-usereditablecombo');

        EHR.ext.UserEditableCombo.superclass.initComponent.call(this, config);
    }
});
Ext.reg('ehr-usereditablecombo', EHR.ext.UserEditableCombo);


EHR.ext.plugins.UserEditableCombo = Ext.extend(Ext.util.Observable, {
    init: function(combo) {
        if((combo instanceof Ext.form.ComboBox)){
            Ext.apply(combo, {
                onSelect: function(cmp, idx){
                    var val;
                    if(idx)
                        val = this.store.getAt(idx).get(this.valueField);

                    if(val == 'Other'){
                        Ext.MessageBox.prompt('Enter Value', 'Enter value:', this.addNewValue, this);
                    }
                    LABKEY.ext.ComboBox.superclass.onSelect.apply(this, arguments);
                },
                setValue:     function(v){
                    var r = this.findRecord(this.valueField, v);
                    if(!r){
                        this.addRecord(v, v);
                    }
                    LABKEY.ext.ComboBox.superclass.setValue.apply(this, arguments);
                },
                addNewValue: function(btn, val){
                    this.addRecord(val);
                    this.setValue(val);
                    this.fireEvent('change', this, val, 'Other');
                },
                addRecord: function(value){
                    if(!value)
                        return;

                    var data = {};
                    data[this.valueField] = value;
                    if(this.displayField!=this.valueField){
                        data[this.displayField] = value;
                    }

                    if(!this.store || !this.store.fields){
                        this.store.on('load', function(store){
                            this.addRecord(value);
                        }, this, {single: true});
                        console.log('unable to add record: '+this.store.storeId+'/'+value);
                        return;
                    }
                    this.store.add((new this.store.recordType(data)));

                    if(this.view){
                        this.view.setStore(this.store);
                        this.view.refresh()
                    }
                }
            });

            if(combo.store.fields)
                combo.addRecord('Other');
            else {
                if (!combo.store.on)
                    combo.store = Ext.ComponentMgr.create(combo.store);

                combo.store.on('load', function(){
                    combo.addRecord('Other');
                }, this);
            }
        }
    }
});
Ext.preg('ehr-usereditablecombo', EHR.ext.plugins.UserEditableCombo);


/**
 * A plugin for Ext.form.TextArea that will allow the box to be resized by the user.
 */
EHR.ext.plugins.ResizableTextArea = Ext.extend(Ext.util.Observable, {
    init: function(textArea){
        textArea.resizeDirections = textArea.resizeDirections || 's,se,e';
        textArea.on("render", function(f){
            f.resizer=new Ext.Resizable(f.getEl(),{handles:this.resizeDirections,wrap:true});
            f.resizer.on('resize',function(){delete f.anchor;});
        }, textArea);

        textArea.onResizeOld = textArea.onResize;
        textArea.onResize = function(){
            this.onResizeOld.apply(this, arguments);
            var r = this.resizer;
            var csize = r.getResizeChild().getSize();
            r.el.setSize(csize.width, csize.height);
        }
    }
});
Ext.preg('ehr-resizabletextarea', EHR.ext.plugins.ResizableTextArea);


/**
 * This creates a combobox suitable to display SNOMED results.  It is a 2-part field, where the top combo allows you to
 * select the 'snomed subset'.  When a subset is picked, the bottom combo loads that subset of codes.  This is designed as
 * a mechanism to support more managable sets of allowable values for SNOMED entry.  It is heavily tied to ehr_lookups.snomed_subsets
 * and ehr_lookups.snomed_subset_codes.
 * @param {object} config The configuation object.
 * @param {string} [config.defaultSubset] The default SNOMED subset to load
 * @param {object} [config.filterComboCfg] An Ext ComboBox config object that will be used when creating the top-combo of this field.
 *
 */
EHR.ext.SnomedCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {
        Ext.apply(this, {
            triggerAction: 'all',
            displayField: 'code/meaning',
            valueField: 'code',
            typeAhead: true,
            mode: 'local',
            listWidth: 300,
            allowAnyValue: true,
            store: new LABKEY.ext.Store({
                xtype: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subset_codes',
                columns: 'secondaryCategory,code,code/meaning,rowid',
                sort: 'secondaryCategory,code/meaning',
                storeId: ['ehr_lookups', 'snomed', 'code', 'meaning', this.queryName, (this.dataIndex || this.name)].join('||'),
                maxRows: 0,
                autoLoad: false
            }),
            tpl : function(){var tpl = new Ext.XTemplate(
                '<tpl for=".">' +
                  '<div class="x-combo-list-item">' +
                    '{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}' +
                    '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                        'values["code"]]}' +
                    '&nbsp;</div></tpl>'
            );return tpl.compile()}()
        });

        EHR.ext.SnomedCombo.superclass.initComponent.call(this, arguments);

        this.filterComboCfg = {};
    },

    onRender: function(){
        EHR.ext.SnomedCombo.superclass.onRender.apply(this, arguments);

        //if there is a storeCfg property, we render a combo with common remarks
        if(this.filterComboCfg){
            this.addCombo();
        }

    },
    addCombo: function(){
        var div = this.container.insertFirst({
            tag: 'div',
            style: 'padding-bottom: 5px;'
        });

        if(LABKEY.ActionURL.getParameter('useSnomedCodes')){
            this.defaultSubset = 'SNOMED Codes';
        }

        var config = Ext.applyIf(this.filterComboCfg, {
            xtype: 'combo',
            renderTo: div,
            width: this.width,
            disabled: this.disabled,
            emptyText: 'Pick subset...',
            typeAhead: true,
            mode: 'local',
            isFormField: false,
            boxMaxWidth: 200,
            valueField: 'subset',
            displayField: 'subset',
            triggerAction: 'all',
            initialValue: this.defaultSubset,
            value: this.defaultSubset,
            nullCaption: 'All',
            store: new LABKEY.ext.Store({
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                sort: 'subset',
                //NOTE: this can potentially be a lot of records, so we initially load with zero
                //maxRows: 0,
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        s.addRecord({subset: 'SNOMED Codes'})
                    }
                },
                nullRecord: {
                    displayColumn: 'subset',
                    nullCaption: 'All'
                }
            }),
            listeners: {
                scope: this,
                change: this.applyFilter
            }
        });

        this.filterCombo = Ext.ComponentMgr.create(config);
        if(this.defaultSubset){
            this.applyFilter(this.filterCombo, this.defaultSubset)
        }
    },

    removeStoreFilter: function(columnName, type) {
        var newFilters = [];
        if (this.store.filterArray) {
            for (var i = 0; i < this.store.filterArray.length; i++) {
                var filter = this.store.filterArray[i];
                if (filter.getColumnName() != columnName || filter.getFilterType().getURLSuffix() != type.getURLSuffix()) {
                    newFilters.push(filter);
                }
            }
        }
        this.store.filterArray = newFilters;
        return newFilters;
    },

    applyFilter: function(combo, subset){
        this.store.removeAll();
        delete this.store.baseParams['query.maxRows'];

        if(!subset || subset == 'All'){
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code,meaning';
            this.store.baseParams['query.sort'] = 'meaning';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'meaning';
                this.removeStoreFilter('primaryCategory', LABKEY.Filter.Types.EQUAL);
            }
            this.displayField = 'meaning';
        }
        else if (subset == 'SNOMED Codes'){
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code';
            this.store.baseParams['query.sort'] = 'code';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'code';
                this.removeStoreFilter('primaryCategory', LABKEY.Filter.Types.EQUAL);
            }
            this.displayField = 'code';
        }
        else {
            this.removeStoreFilter('primaryCategory', LABKEY.Filter.Types.EQUAL).push(LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL));
            this.store.baseParams['query.queryName'] = 'snomed_subset_codes';
            this.store.baseParams['query.columns'] = 'secondaryCategory,code,code/meaning,rowid';
            this.store.baseParams['query.sort'] = 'secondaryCategory,code/meaning';
            if(this.store.sortInfo){
                this.store.sortInfo.field = 'meaning';
                this.store.sortInfo.field = 'secondaryCategory,code/meaning';
            }
            this.displayField = 'code/meaning';
        }

        this.store.load();

        if(this.view)
            this.view.setStore(this.store);

    },

    setDisabled: function(val){
        EHR.ext.SnomedCombo.superclass.setDisabled.call(this, val);

        if(this.filterCombo)
            this.filterCombo.setDisabled(val);
    },
    setVisible: function(val){
        EHR.ext.SnomedCombo.superclass.setVisible.call(this, val);

        if(this.filterCombo)
            this.filterCombo.setVisible(val);
    },
    reset: function(){
        EHR.ext.SnomedCombo.superclass.reset.call(this);

        if(this.filterCombo)
            this.filterCombo.reset();
    }
//    doQuery : function(q, forceAll){
//        q = Ext.isEmpty(q) ? '' : q;
//        var qe = {
//            query: q,
//            forceAll: forceAll,
//            combo: this,
//            cancel:false
//        };
//        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
//            return false;
//        }
//        q = qe.query;
//        forceAll = qe.forceAll;
//        if(forceAll === true || (q.length >= this.minChars)){
//            if(this.lastQuery !== q){
//                this.lastQuery = q;
//                if(this.mode == 'local'){
//                    this.selectedIndex = -1;
//                    if(forceAll){
//                        this.store.clearFilter();
//                    }else{
//                        this.store.filter(this.displayField, q, this.allowAnyValue, this.caseSensitive);
//                    }
//                    this.onLoad();
//                }else{
//                    this.store.baseParams[this.queryParam] = q;
//                    this.store.load({
//                        params: this.getParams(q)
//                    });
//                    this.expand();
//                }
//            }else{
//                this.selectedIndex = -1;
//                this.onLoad();
//            }
//        }
//    }
});
Ext.reg('ehr-snomedcombo', EHR.ext.SnomedCombo);


/**
 * This field is used for EHR animal IDs.  It contains regular expression validation and fires events when the participant changes.
 * See EHR.ext.plugins.ParticipantField and EHR.ext.plugins.ParticipantFieldEvents
 */
EHR.ext.ParticipantField = Ext.extend(Ext.form.TextField,
{
    initComponent: function()
    {
        Ext.apply(this, {
            labelAlign: 'top'
            ,fieldLabel: 'Id'
            ,allowBlank: false
            ,plugins: ['ehr-participantfield']
        });

        EHR.ext.ParticipantField.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-participant', EHR.ext.ParticipantField);


/**
 * This is a plugin that supplies many of the characteristics required for an EHR ParticipantField.  It provides
 * regular expression-based validation, normalizes the case of animal IDs and adds a 'participantchange' event.
 */
EHR.ext.plugins.ParticipantField = Ext.extend(Ext.util.Observable, {
    init: function(combo) {
        Ext.apply(combo, {
            participantMap: new Ext.util.MixedCollection
            ,validationDelay: 1000
            ,validationEvent: 'blur'
            ,validator: function(val)
            {
                if (!val)
                {
                    //we let the field's allowBlank handle this
                    return true;
                }
//
                //force lowercase
                val = val.toLowerCase();

                //trim whitespace
                val = val.replace(/^\s+|\s+$/g,"");

                if(val != this.getValue())
                    this.setValue(val);

                var species;
                if (val.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)|(^rh-([0-9]{3})$)|(^rh[a-z]{2}([0-9]{2})$)/))
                    species = 'Rhesus';
                else if (val.match(/^cy([0-9]{4})$/))
                    species = 'Cynomolgus';
                else if (val.match(/^ag([0-9]{4})$/))
                    species = 'Vervet';
                else if (val.match(/^cj([0-9]{4})$/))
                    species = 'Marmoset';
                else if (val.match(/^so([0-9]{4})$/))
                    species = 'Cotton-top Tamarin';
                else if (val.match(/^pt([0-9]{4})$/))
                    species = 'Pigtail';
                else if (val.match(/^pd([0-9]{4})$/))
                    species = '';
                else if (val.match(/^test([0-9]+)$/))
                    species = 'Rhesus';
//
//                if(!species){
//                    return 'Invalid Id Format';
//                }
//
//                var row = this.participantMap.get(val);
//                if(row && !row.loading && !this.allowAnyId){
//                    if(!row.Id){
//                        return 'Id Not Found';
//                    }
//                }
//
                return true;
//
            }
        });

        combo.on('valid', function(c){
            var val = c.getRawValue();
            if (val != c.loadedId)
            {
                this.fireEvent('participantchange', this, val);
                c.loadedId = val;
            }
        }, combo);

        combo.on('invalid', function(c){
            var val = c.getRawValue();
            if (val != c.loadedId){
                this.fireEvent('participantchange', this, val);
                c.loadedId = val;
            }
        }, combo);

        combo.on('render', function(field){
            field.el.set({spellcheck: false});
        }, combo);

        combo.addEvents('participantchange');
        combo.enableBubble('participantchange');
    }
});
Ext.preg('ehr-participantfield', EHR.ext.plugins.ParticipantField);


/**
 * This is a plugin for EHR ParticipantField, although it can be added to other fields.
 * It configures a 'participantchange' event that will fire whenever the value of this field changes
 */
EHR.ext.plugins.ParticipantFieldEvents = Ext.extend(Ext.util.Observable, {
    init: function(combo) {
        combo.on('change', function(c){
            var theForm = c.findParentByType('ehr-formpanel').getForm();
            var idField = theForm.findField('Id');

            if(idField)
                idField.fireEvent('participantchange', idField);
        }, combo);
        combo.on('select', function(c){
            var theForm = c.findParentByType('ehr-formpanel').getForm();
            var idField = theForm.findField('Id');

            if(idField)
                idField.fireEvent('participantchange', idField);
        }, combo);
    }
});
Ext.preg('ehr-participantfield-events', EHR.ext.plugins.ParticipantFieldEvents);


/**
 * This field is used to diplay EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 */
EHR.ext.ProjectField = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){

        Ext.apply(this, {
            fieldLabel: 'Project'
            ,name: this.name || 'project'
            ,dataIndex: 'project'
            ,emptyText:''
            ,displayField:'project'
            ,valueField: 'project'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,forceSelection: true
            ,mode: 'remote'
            ,disabled: false
            ,plugins: ['ehr-usereditablecombo']
            ,validationDelay: 500
            //NOTE: unless i have this empty store an error is thrown
            ,store: new LABKEY.ext.Store({
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'project',
                //note: dont auto-load since we might be starting without a bound Id
                //autoLoad: true,
                listeners: {
                    scope: this,
                    // NOTE: WNPRCDataEntryTest intermittently fails when this combo fails to load
                    // this is an attempt to increase visibility on errors, if they exist
                    exception: function(proxy, request, response, error){
                        var store = this.store;
                        if (!store.loadError){
                            store.onLoadException(proxy, request, response, error);
                        }

                        if (store.loadError){
                            LDK.Utils.logToServer({
                                level: 'ERROR',
                                message: 'Error in ProjectField: ' + Ext.encode(store.loadError),
                                includeContext: true
                            });
                        }
                    }
                }
            })
            ,listeners: {
                select: function(combo, rec){
                    if(this.ownerCt.boundRecord){
                        this.ownerCt.boundRecord.beginEdit();
                        this.ownerCt.boundRecord.set('project', rec.get('project'));
                        this.ownerCt.boundRecord.set('account', rec.get('account'));
                        this.ownerCt.boundRecord.endEdit();
                    }
                }
            }
//            ,tpl: function(){var tpl = new Ext.XTemplate(
//                '<tpl for=".">' +
//                '<div class="x-combo-list-item">{[!isNaN(values["project"]) ? EHR.Utils.padDigits(values["project"], 8) : values["project"]]}' +
//                '&nbsp;</div></tpl>'
//            );return tpl.compile()}()
            ,tpl: function(){var tpl = new Ext.XTemplate(
                '<tpl for=".">' +
                '<div class="x-combo-list-item">{[values["project"] + " " + (values["protocol"] ? "("+values["protocol"]+")" : "")]}' +
                '&nbsp;</div></tpl>'
            );return tpl.compile()}()
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);

        this.mon(this.ownerCt, 'participantchange', this.getProjects, this);
    },

    makeSql: function(id, date){
        var sql = "SELECT DISTINCT a.project, a.project.account, a.project.protocol as protocol FROM study.assignment a " +
                "WHERE a.id='"+id+"' " +
                //this protocol contains tracking projects
                "AND a.project.protocol != 'wprc00' ";

        if(!this.allowAllProtocols){
            sql += ' AND a.project.protocol IS NOT NULL '
        }

        if(date)
            sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND (cast(a.enddate as date) >= '"+date.format('Y-m-d')+"' OR a.enddate IS NULL)";
        else
            sql += "AND a.enddate IS NULL ";

        if(this.defaultProjects){
            sql += " UNION ALL (SELECT project, account, project.protocol as protocol FROM ehr.project WHERE project IN ('"+this.defaultProjects.join("','")+"'))";
        }

        return sql;
    },

    getProjects : function(field, id){
        if(!id && this.ownerCt.boundRecord)
            id = this.ownerCt.boundRecord.get('Id');

        var date;
        if(this.ownerCt.boundRecord){
            date = this.ownerCt.boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        this.store.baseParams.sql = this.makeSql(id, date);
        this.store.load();
    }
});
Ext.reg('ehr-project', EHR.ext.ProjectField);


/**
 * This field is used for EHR remarks.  It automatically used the ResizableTextArea plugin.  Also, if this field is created
 * with a storeCfg object, a combo will be created above the store that allows the user to pick from a set of pre-defined remarks
 * stored in the specified table
 * @param config The configuration object.  Allows any parameters from the superclass as well as those defined here
 * @param {object} [config.storeCfg] This is a config object used to create a LABKEY.ext.Combobox displaying the saved remarks for this field.
 * @param {object} [config.storeCfg.schemaName] The schema from which to query saved remarks
 * @param {object} [config.storeCfg.queryName] The query from which to retrieve saved remarks
 * @param {object} [config.storeCfg.displayField] The field of this query to display in the combo
 * @param {object} [config.storeCfg.valueField] The value of the combo.  When this combo option selected, the value of this field will be used as the value of the textarea
 */
EHR.ext.RemarkField = Ext.extend(Ext.form.TextArea,
{
    initComponent: function(){
        this.plugins = this.plugins || [];
        this.plugins.push('ehr-resizabletextarea');

        EHR.ext.RemarkField.superclass.initComponent.call(this);
    },
    onRender: function(){
        EHR.ext.RemarkField.superclass.onRender.apply(this, arguments);

        //if there is a storeCfg property, we render a combo with common remarks
        if(this.storeCfg){
            this.addCombo();
        }

    },
    addCombo: function(){
        var div = this.container.insertFirst({
            tag: 'div',
            style: 'padding-bottom: 5px;'
        });

        this.select = Ext.ComponentMgr.create({
            xtype: 'combo',
            renderTo: div,
            emptyText: 'Common remarks...',
            width: this.width,
            disabled: this.disabled,
            isFormField: false,
            boxMaxWidth: 200,
            valueField: this.storeCfg.valueField,
            displayField: this.storeCfg.displayField,
            triggerAction: 'all',
            store: new LABKEY.ext.Store({
                schemaName: this.storeCfg.schemaName,
                queryName: this.storeCfg.queryName,
                autoLoad: true
            }),
            listeners: {
                scope: this,
                select: function(combo, rec){
                    var val = combo.getValue();
                    this.setValue(val);
                    this.fireEvent('change', this, val, this.startValue);
                    combo.reset();
                }
            }
        });
    },

    setDisabled: function(val){
        EHR.ext.RemarkField.superclass.setDisabled.call(this, val);

        if(this.select)
            this.select.setDisabled(val);
    },
    setVisible: function(val){
        EHR.ext.RemarkField.superclass.setVisible.call(this, val);

        if(this.select)
            this.select.setVisible(val);
    }
});
Ext.reg('ehr-remark', EHR.ext.RemarkField);


/**
 * This field is used for data entry on the Drug Administration dataset.  It creates a numerfield with a trigger button.
 * When this trigger is selected, the weight of the current animal is identified, along with the concentration and dosage entered
 * into the current form.  These values are combined (weight*dosage/conc) to find the volume and amount.
 */
EHR.ext.DrugDoseField = Ext.extend(EHR.ext.TriggerNumberField,
{
    initComponent: function(){
        this.triggerClass = 'x-form-search-trigger';

        EHR.ext.DrugDoseField.superclass.initComponent.call(this, arguments);
    },
    onTriggerClick: function(){
        var id, conc, dosage, conc_units;
        var parent = this.findParentByType('ehr-formpanel');
        var theForm = parent.getForm();

        var values = theForm.getFieldValues();
        conc = values.concentration;
        dosage = values.dosage;

        //note: if this form is an encounter, Id might be inherited, so we use the record as a fallback
        id = values.Id;
        if(!id && parent.boundRecord)
            id = parent.boundRecord.get('Id');

        if(!conc || !dosage || !id){
            Ext.Msg.alert('Error', 'Must supply Id, dosage and concentration');
            return
        }

        if(parent.importPanel.participantMap.get(id)){
            var weight;
            var showWeight = true;
            if(values.dosage_units && !values.dosage_units.match(/\/kg$/)){
                //console.log('using animal as unit');
                showWeight = false;
                weight = 1;
            }
            else {
                var weightStore = Ext.StoreMgr.find(function(s){
                    if(s.queryName=='Weight'){
                        var r = s.find('Id', id);
                        if(r != -1){
                            r = s.getAt(r);
                            weight = r.get('weight');
                        }
                    }
                }, this);

                if(!weight){
                    var record = parent.importPanel.participantMap.get(id);
                    weight = record['Id/availBlood/MostRecentWeight'] || record['Id/mostRecentWeight/MostRecentWeight']  || record['Id/MostRecentWeight/MostRecentWeight'];
                }

                if(weight){
                    var mt = Ext.form.MessageTargets.under;
                    var msg;
                    if(showWeight)
                        msg = 'Weight: '+weight+' kg';
                    else
                        msg = null;

                    if(mt){
                        mt.mark(this, msg);
                        function onBindChange(){
                            mt.mark(this, null);
                            this.ownerCt.doLayout();
                        }
                        parent.on('recordchange', onBindChange, this, {single: true});
                        this.ownerCt.doLayout();
                    }
                }
                else {
                    alert('Unable to find weight');
                    return;
                }
            }

            var vol = Ext4.util.Format.round(weight*dosage/conc, 2);

            //NOTE: calculated from volume to avoid errors due to rounding
            var amount = Ext4.util.Format.round(vol*conc, 2);

            theForm.findField('amount').setValue(amount);
            theForm.findField('volume').setValue(vol);
            theForm.findField('dosage').setValue(dosage);

            //we only fire 1 event b/c the databind plugin operates on the form as a whole
            var concField = theForm.findField('concentration');
            concField.setValue(conc);
            concField.fireEvent('change', conc, concField.startValue);
        }
        else {
            parent.importPanel.participantMap.on('add', this.onTriggerClick, this, {single: true})
        }
    }
});
Ext.reg('ehr-drugdosefield', EHR.ext.DrugDoseField);


//this vtype is used in date range panels
//@deprecated
Ext.apply(Ext.form.VTypes, {
    daterange : function(val, field)
    {
        var date = field.parseDate(val);
        console.log('validating');
        if (!date)
        {
            console.log('returned');
            return;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime())))
        {
            //var start = Ext.getCmp(field.startDateField);
            var start = field.startDateField;
            start.setMaxValue(date);
            //start.validate.defer(10);
            this.dateRangeMax = date;

            start.fireEvent('change', start, start.getValue(), start.startValue);
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime())))
        {
            //var end = Ext.getCmp(field.endDateField);
            var end = field.endDateField;
            end.setMinValue(date);
            //end.validate.defer(10);
            this.dateRangeMin = date;

            end.fireEvent('change', end, end.getValue());
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */

        return true;
    }
});

