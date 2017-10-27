/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.ns('WNPRC.BillingUtils');

WNPRC.BillingUtils = new function(){


    return {
        isBillingAdmin: function () {
            // var ctx = LABKEY.getModuleContext('wnprc_billing');
            // if (!ctx)
            //     return false;

            return true; //TODO: check for billing admin permission - requires creating permission classes - see ONPRC_Billing's BillingUtils.js
        }
    }
};