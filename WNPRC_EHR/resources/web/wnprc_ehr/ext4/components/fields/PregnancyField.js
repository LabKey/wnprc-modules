/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('WNPRC.ext.components.fields.PregnancyField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-pregnancyfield',
    constructor: function() {
        console.log('constructing pregnancy field');
        this.callParent(arguments);
    },
    initComponent: function () {
        console.log('initializing pregnancy field');
        this.callParent(arguments);
    }
});