/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * A trigger field which only allows numeric characters
 *
 * @cfg triggerToolTip
 */
Ext4.define('EHR.form.field.TriggerNumberField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-triggernumberfield',

    initComponent: function(){
        this.callParent();

        if (this.triggerToolTip){
            this.on('render', function(){
                Ext4.QuickTips.register({
                    target: this.triggerEl,
                    text: this.triggerToolTip
                });
            }, this);
        }
    },

    baseChars : "0123456789",
    autoStripChars: false,
    allowDecimals : true,
    decimalSeparator : ".",
    decimalPrecision : 2,
    allowNegative : true,

    triggerCls: 'x4-form-search-trigger',

    rawToValue: function(rawValue) {
        var value = this.fixPrecision(this.parseValue(rawValue));
        if (value === null) {
            value = rawValue || null;
        }
        return  value;
    },

    valueToRaw: function(value) {
        var me = this,
                decimalSeparator = me.decimalSeparator;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext4.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));
        value = isNaN(value) ? '' : String(value).replace('.', decimalSeparator);
        return value;
    },

    parseValue : function(value) {
        value = parseFloat(String(value).replace(this.decimalSeparator, '.'));
        return isNaN(value) ? null : value;
    },

    fixPrecision : function(value) {
        var me = this,
                nan = isNaN(value),
                precision = me.decimalPrecision;

        if (nan || !value) {
            return nan ? '' : value;
        } else if (!me.allowDecimals || precision <= 0) {
            precision = 0;
        }

        return parseFloat(Ext4.Number.toFixed(parseFloat(value), precision));
    },

    beforeBlur : function() {
        var me = this,
                v = me.parseValue(me.getRawValue());

        if (!Ext4.isEmpty(v)) {
            me.setValue(v);
        }
    }
});