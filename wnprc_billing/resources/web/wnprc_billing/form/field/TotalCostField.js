/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('WNPRC_Billing.form.field.TotalCostField', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.wnprc_billing-totalcostfield',
    editable: false,
    hideTrigger: true,
    keyNavEnabled: false,
    mouseWheelEnabled: false
});