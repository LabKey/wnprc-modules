/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg onlyIncludeProtocolsWithAssignments
 */
Ext4.define('EHR.form.field.ProtocolField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-protocolfield',

    fieldLabel: 'IACUC Protocol',
    editable: true,
    caseSensitive: false,
    anyMatch: true,
    forceSelection: true,

    onlyIncludeProtocolsWithAssignments: false,

    initComponent: function(){
        Ext4.apply(this, {
            displayField: 'displayName',
            valueField: 'protocol',
            queryMode: 'local',
            store: this.getStoreCfg()
        });

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            innerTpl:this.getInnerTpl(),
            getInnerTpl: function(){
                return this.innerTpl;
            },
            style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        });

        this.callParent(arguments);
    },

    //can be overriden by child modules
    getInnerTpl: function(){
        return ['<span style="white-space:nowrap;">{[values["displayName"] + " " + (values["investigatorId/lastName"] ? "(" + (values["investigatorId/lastName"] ? values["investigatorId/lastName"] : "") + ")" : "")]}&nbsp;</span>'];
    },

    getStoreCfg: function(){
        var ctx = EHR.Utils.getEHRContext();

        var storeCfg = {
            type: 'labkey-store',
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            schemaName: 'ehr',
            queryName: 'protocol',
            columns: 'protocol,displayName,investigatorId/lastName',
            filterArray: [
                LABKEY.Filter.create('enddateCoalesced', '-0d', LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL)
            ],
            sort: 'displayName',
            autoLoad: true
        };

        if (this.onlyIncludeProtocolsWithAssignments){
            storeCfg.filterArray.push(LABKEY.Filter.create('activeAnimals/TotalActiveAnimals', 0, LABKEY.Filter.Types.GT));
        }

        if (this.storeConfig){
            Ext4.apply(storeCfg, this.storeConfig);
        }

        if (this.filterArray){
            storeCfg.filterArray = storeCfg.filterArray.concat(this.filterArray);
        }

        return storeCfg;
    }
});