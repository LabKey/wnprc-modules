/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used for EHR remarks.  It automatically used the ResizableTextArea plugin.  Also, if this field is created
 * with a storeCfg object, a combo will be created above the store that allows the user to pick from a set of pre-defined remarks
 * stored in the specified table
 * @param config The configuration object.  Allows any parameters from the superclass as well as those defined here
 * @param {object} [config.storeCfg] This is a config object used to create a LABKEY.ext.Combobox displaying the saved remarks for this field.
 * @param {object} [config.storeCfg.schemaName] The schema from which to query saved remarks
 * @param {object} [config.storeCfg.queryName] The query from which to retrieve saved remarks
 * @param {object} [config.storeCfg.displayField] The field of this query to display in the combo
 * @param {object} [config.storeCfg.valueField] The value of the combo.  When this combo option selected, the value of this field will be used as the value of the textarea
 */
Ext4.define('EHR.form.field.RemarkField', {
    extend: 'Ext.form.TextArea',
    alias: 'widget.ehr-remarkfield',

    initComponent: function(){
        this.plugins = this.plugins || [];
        this.plugins.push('ehr-resizabletextarea');

        Ext4.apply(this, {
            grow: true
        });

        this.callParent(arguments);
    }
});