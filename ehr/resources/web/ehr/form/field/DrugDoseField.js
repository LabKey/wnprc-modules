/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * A trigger field which only allows numeric characters
 */
Ext4.define('EHR.form.field.DrugDoseField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-drugdosefield',

    triggerCls: 'x4-form-search-trigger',

    triggerToolTip: 'Click to calculate amount and volume based on concentration, dose and weight',

    initComponent: function(){
        this.callParent(arguments);

        this.on('change', function(field){
            field.showWeight(null);
        }, this);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (!record){
            return;
        }

        if (!record.get('code') || !record.get('Id')){
            Ext4.Msg.alert('Error', 'Must enter the Animal Id and treatment');
            return;
        }

        Ext4.create('EHR.window.DrugAmountWindow', {
            targetStore: record.store,
            formConfig: record.sectionCfg,
            boundRecord: record
        }).show();
    },

    calculateDose: function(id, record, sc){
        Ext4.Msg.wait('Loading weight...');

        EHR.DemographicsCache.getDemographics([id], function(animalIds, data){
            this.onDemographicsLoad(id, data ? data[id] : null, record, sc)
        }, this, -1);
    },

    onDemographicsLoad: function(id, data, record, sc){
        Ext4.Msg.hide();

        var clientWeightMap = EHR.DataEntryUtils.getClientWeight(sc, [id]);
        var weight = clientWeightMap[id] || data.getMostRecentWeight();

        if (!weight){
            Ext4.Msg.alert('Error', 'Unable to find weight, cannot calculate amount');
            return;
        }

        this.showWeight(weight);
        this.getDose(record, weight);
    },

    showWeight: function(weight){
        var fc = this.up('fieldcontainer');
        //this will occur for grid cells
        if (!fc){
            return;
        }

        var target = fc.down('#' + fc.msgTargetId);
        if (!target){
            console.error('unable to find msg target');
            return;
        }

        if (weight){
            target.setValue('<span>Weight: '+weight+' kg</span>');
            target.setVisible(true);
        }
        else {
            target.setValue(null);
            target.setVisible(false);
        }
    },

    getDose: function(record, weight){
        var showWeight = true;
        if (record.get('dosage_units') && !record.get('dosage_units').match(/\/kg$/)){
            console.log('using animal as unit');
            showWeight = false;
            weight = 1;
        }
        else {

        }

        //NOTE: calculated from volume to avoid errors due to rounding
        var amount = Ext4.util.Format.round(weight * record.get('dosage'), 2);
        var vol = record.get('concentration') ? Ext4.util.Format.round(weight * record.get('dosage') / record.get('concentration'), 2) : null;

        record.set('dosage', record.get('dosage'));
        record.set('amount', amount);

        if (vol)
            record.set('volume', vol);
    }
});