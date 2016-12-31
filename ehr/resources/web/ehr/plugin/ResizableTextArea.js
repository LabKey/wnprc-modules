/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * A plugin for Ext.form.TextArea that will allow the box to be resized by the user.
 */
Ext4.define('EHR.plugin.ResizableTextArea', {
    extend: 'Ext.AbstractPlugin',
    pluginId: 'ehr-resizabletextarea',
    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias: 'plugin.ehr-resizabletextarea',

    init: function(textArea){
        textArea.resizeDirections = textArea.resizeDirections || 's se e';
        textArea.on('afterrender', function(f){
            f.resizer = Ext4.create('Ext.resizer.Resizer', {
                target: f,
                handles: this.resizeDirections,
                dynamic: true
            });
        }, textArea);
    }
});
