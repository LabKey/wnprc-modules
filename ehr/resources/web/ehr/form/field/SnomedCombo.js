/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This creates a combobox suitable to display SNOMED results.  It is a 2-part field, where the top combo allows you to
 * select the 'snomed subset'.  When a subset is picked, the bottom combo loads that subset of codes.  This is designed as
 * a mechanism to support more managable sets of allowable values for SNOMED entry.  It is heavily tied to ehr_lookups.snomed_subsets
 * and ehr_lookups.snomed_subset_codes.
 * @param {object} config The configuation object.
 * @param {string} [config.defaultSubset] The default SNOMED subset to load
 *
 */
Ext4.define('EHR.form.field.SnomedCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-snomedcombo',

    activeSubset: null,

    initComponent: function(){
        this.getSnomedStore();
        this.activeSubset = this.defaultSubset;

        Ext4.apply(this, {
            trigger2Cls: Ext4.form.field.ComboBox.prototype.triggerCls,
            onTrigger2Click: Ext4.form.field.ComboBox.prototype.onTriggerClick,
            trigger1Cls: 'x4-form-search-trigger',
            xtype: 'labkey-combo',
            queryMode: 'local',
            name: this.name,
            snomedStore: this.snomedStore,
            displayField: 'codeAndMeaning',
            valueField: 'code',
            forceSelection: true,
            caseSensitive: false,
            anyMatch: true,
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                storeId: 'snomedStore_' + this.id,
                queryName: 'snomed_combo_list',
                columns: 'code,meaning,codeAndMeaning,categories',
                sort: 'meaning',
                maxRows: 0,
                autoLoad: true,
                listeners: {
                    scope: this,
                    delay: 100,
                    load: function(s){
                        if (this.activeSubset)
                            this.applyFilter(this.activeSubset);
                    }
                }
            }
        });

        this.callParent(arguments);

        this.on('render', function(field){
            Ext4.QuickTips.register({
                target: field.triggerEl.elements[0],
                text: 'Click to change the SNOMED subset'
            });
        }, this);
    },

    //used to prevent combo/editor from closing when toggling snomed subsets
    validateBlur: function(){
        return !this.window;
    },

    onTrigger1Click: function(){
        var cfg = this.getFilterComboCfg();
        cfg.value = this.activeSubset || cfg.value;

        this.window = Ext4.create('Ext.window.Window', {
            title: 'Choose SNOMED Subset',
            modal: true,
            closeAction: 'destroy',
            width: 410,
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'Because the entire SNOMED list is long, most SNOMED fields show a subset of the full list.  The field below can be used to change which subset is shown, or you can choose all codes.  Please note that the SNOMED field should narrow down the list of codes as you begin typing.',
                border: false,
                style: 'padding-bottom: 10px;'
            }, cfg],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');
                    var val = win.down('#filterCombo').getValue();
                    if (!val){
                        Ext4.Msg.alert('Error', 'Must choose a subset');
                        return;
                    }

                    win.close();
                    this.window = null;
                    this.applyFilter(val);
                }
            },{
                text: 'Close',
                scope: this,
                handler: function(btn){
                    var win = btn.up('window');
                    win.close();
                    this.window = null;
                }
            }]

        }).show();
    },

    ensureRecord: function(val){
        if (this.isDestroyed){
            return;
        }

        if (!this.store){
            LDK.Assert.assertNotEmpty('this.store is null in SnomedCombo.ensureRecord()', this.store);
        }

        var recIdx = this.store.findExact('code', val);
        if (recIdx == -1){
            recIdx = this.snomedStore.findExact('code', val);

            if (recIdx != -1){
                if (this.store.isLoading()){
                    var me = this;
                    this.store.on('load', function(){
                        me.ensureRecord(val);
                    }, me, {single: true});
                }
                else {
                    this.store.add(this.snomedStore.getAt(recIdx));
                }
            }
            else if (this.snomedStore.isLoading()){
                var me = this;
                me.snomedStore.on('load', function(){
                    me.ensureRecord(val);
                    //NOTE: if the value becomes NULL, it is likely because a user clicked on the combo prior to SNOMED store loading.
                    if (!me.getValue()) {
                        me.setValue(val);
                    }
                }, me, {single: true});
            }
        }
    },

    getSnomedStore: function(){
        if (this.snomedStore)
            return this.snomedStore;

        this.snomedStore = EHR.DataEntryUtils.getSnomedStore();

        if (!this.snomedStore.loading){
            if (this.activeSubset)
                this.applyFilter(this.activeSubset);
        }

        this.mon(this.snomedStore, 'load', function(){
            if (this.activeSubset)
                this.applyFilter(this.activeSubset);
        }, this);

        return this.snomedStore;
    },

    setValue: function(val){
        if (Ext4.isString(val)) {
            this.ensureRecord(val);
        }
        else if (Ext4.isArray(val) && val.length == 1 && val[0].isModel) {
            this.ensureRecord(val[0].get('code'));
        }
        else if (Ext4.isObject(val) && val.code){
            this.ensureRecord(val.code);
        }

        this.callOverridden(arguments);
    },

    getFilterComboCfg: function(){
        return {
            xtype: 'combo',
            itemId: 'filterCombo',
            emptyText: 'Pick subset...',
            typeAhead: true,
            isFormField: false,
            fieldLabel: 'Choose Subset',
            labelWidth: 120,
            width: 380,
            valueField: 'subset',
            displayField: 'subset',
            queryMode: 'local',
            initialValue: this.activeSubset,
            value: this.activeSubset,
            nullCaption: 'All',
            store: {
                type: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                sort: 'subset',
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        s.add({subset: 'All'});
                    }
                }
            }
        };
    },

    applyFilter: function(subset){
        var code = this.getValue();
        this.activeSubset = subset;

        if (this.snomedStore.loading || this.isDestroyed){
            return;
        }

        LDK.Assert.assertNotEmpty('SnomedCombo.applyFilter() called w/ a null store', this.store);
        if (!this.store){
            return;
        }

        this.store.removeAll();

        var records = [];
        if (!subset || subset == 'All'){
            records = this.snomedStore.getRange();
        }
        else {
            var re = new RegExp('(,|^)' + subset + '(,|$)');
            this.snomedStore.each(function(r){
                if (r.get('categories') && r.get('categories').match(re))
                    records.push(r);
            }, this);
        }

        this.store.add(records);
        if (code)
            this.ensureRecord(code);
    }
});
