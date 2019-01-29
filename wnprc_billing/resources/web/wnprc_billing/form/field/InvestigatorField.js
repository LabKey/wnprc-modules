/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display WNPRC Investigator.
 */
Ext4.define('WNPRC_BILLING.form.field.InvestigatorField', {
    extend: 'EHR_Billing.form.field.EHRBillingRowObserverEntryField',
    alias: 'widget.wnprc_billing-investigatorfield',

    initComponent: function() {
        if (!this.originalConfig || !this.originalConfig.lookup) {
            Ext4.Msg.alert('Error', 'Lookup not defined for combo box');
        }

        if (!this.originalConfig.lookup.schemaName) {
            Ext4.Msg.alert('Error', 'Lookup schema not defined for combo box');
        }

        if (!this.originalConfig.lookup.queryName) {
            Ext4.Msg.alert('Error', 'Lookup query not defined for combo box');
        }

        var ctx = LABKEY.moduleContext.ehr;
        this.containerPath = ctx['EHRStudyContainer'];

        Ext4.applyIf(this, {
            expandToFitContent: true,
            queryMode: 'local',
            anyMatch: true,
            schemaName: this.originalConfig.lookup.schemaName,
            queryName: this.originalConfig.lookup.queryName,
            store: {
                type: 'labkey-store',
                schemaName: this.originalConfig.lookup.schemaName,
                sql: this.makeSql(),
                sort: this.originalConfig.lookup.sort,
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.getPicker().refresh();
                    }
                }
            },
            valueField: this.valueField,
            displayField: this.displayField,
            listeners: {
                scope: this,
                beforerender: function (field) {
                    this.getOptions();
                }
            }
        });

        this.callParent(arguments);

        this.on('focus', function() {
            if (!this.observedField) {
                Ext4.Msg.alert('Error', 'Observed field not provided.');
                return;
            }

            this.getOptions();
        }, this);

    },

    makeSql: function (val) {
        //avoid unnecessary reloading
        if (val && this.loadedVal === val) {
            return;
        }
        this.loadedVal = val;

        var sql = "SELECT DISTINCT " + this.originalConfig.lookup.columns
                + " FROM " + this.schemaName + "." + this.queryName;
        if (val) {
            sql += " WHERE " + this.observerLookupField + " = '" + val + "'";
        } else {
            sql += " WHERE 1=0" ;
        }

        return sql;
    }
});