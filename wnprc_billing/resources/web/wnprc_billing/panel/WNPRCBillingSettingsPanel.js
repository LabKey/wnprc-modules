/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('wnprc_billing.panel.WNPRCBillingSettingsPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function () {
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'This page provides settings and actions for the WNPRC Billing module.'
            }, {
                    xtype: 'button',
                    text: 'Load EHR Billing table definitions',
                    handler: this.createDomainHandler,
                    scope: this
            }]
        });

        this.callParent();
    },

    createDomainHandler: function () {
        LABKEY.Domain.create({
            module: "wnprc_billing",
            domainKind: "EHR_Billing",
            domainGroup: "ehr_billing",
            importData: false,
            success: function () {
                LABKEY.Utils.alert("Success","EHR Billing tables updated successfully.");
            },
            failure: function (e) {
                LABKEY.Utils.alert("Error", e.exception);
            }
        });
    }
});