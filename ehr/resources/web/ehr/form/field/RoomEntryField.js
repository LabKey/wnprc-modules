/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg idFieldIndex The name of the field holding the Animal ID
 */
Ext4.define('EHR.form.field.RoomEntryField', {
    extend: 'LABKEY.ext4.ComboBox',
    alias: 'widget.ehr-roomentryfield',

    caseSensitive: false,
    anyMatch: true,
    displayField: 'room',
    forceSelection: true,

    idFieldIndex: 'Id',
    cageFieldIndex: null,

    initComponent: function(){
        var ctx = EHR.Utils.getEHRContext();

        this.trigger2Cls = Ext4.form.field.ComboBox.prototype.triggerCls;
        this.onTrigger2Click = Ext4.form.field.ComboBox.prototype.onTriggerClick;

        Ext4.apply(this, {
            valueField: 'room',
            queryMode: 'local',
            store: {
                type: 'labkey-store',
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: 'ehr_lookups',
                queryName: 'rooms',
                columns: 'room,area',
                sort: 'sort_order',
                filterArray: [LABKEY.Filter.create('datedisabled', null, LABKEY.Filter.Types.ISBLANK)],
                autoLoad: true
            },
            plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                allowChooseOther: false
            })]
        });

        this.on('render', function(){
            Ext4.QuickTips.register({
                target: this.triggerEl.elements[0],
                text: 'Click to lookup the room/cage based on the animal Id'
            });
        }, this);

        this.callParent(arguments);
    },

    trigger1Cls: 'x4-form-search-trigger',

    onTrigger1Click: function(){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            Ext4.Msg.alert('Error', 'Unable to locate associated animal Id');
            return;
        }

        var id = boundRecord.get(this.idFieldIndex);
        if (!id){
            Ext4.Msg.alert('Error', 'No Animal Id Provided');
            return;
        }

        this.getLocation(id, true);
    },

    getLocation: function(id, showMsg){
        if (!id)
            return;

        Ext4.Msg.wait('Loading...');
        EHR.DemographicsCache.getDemographics([id], function(animalIds, data){
            this.onDemographicsLoad(id, data ? data[id] : null, showMsg)
        }, this, -1);
    },

    onDemographicsLoad: function(id, data, showMsg){
        Ext4.Msg.hide();

        if (!data){
            if (showMsg)
                Ext4.Msg.alert('', 'Animal Not Found');
            return;
        }

        if (!data.getCurrentRoom()){
            if (showMsg)
                Ext4.Msg.alert('', 'Current housing not found for: ' + id);

            return;
        }

        var vals = {};
        vals[this.name] = data.getCurrentRoom();

        if (this.cageFieldIndex){
            vals[this.cageFieldIndex] = data.getCurrentCage();
        }

        EHR.DataEntryUtils.setSiblingFields(this, vals);
        this.setValue(data.getCurrentRoom());
    }
});