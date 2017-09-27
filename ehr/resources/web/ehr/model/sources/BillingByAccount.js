/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('BillingByAccount', {
    allQueries: {

    },
    byQuery: {
        'onprc_billing.miscCharges': {
            project: {
                allowBlank: true
            },
            debitedaccount: {
                hidden: false,
                label: 'Alias',
                header: 'Alias',
                lookups: false
            }
        }
    }
});
