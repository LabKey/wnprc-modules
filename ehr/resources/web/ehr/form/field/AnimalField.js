/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.AnimalField.js', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.ehr-animalfield',

    initComponent: function(){
        //TODO: regex validation and events

        this.callParent();

        this.addEvents('animalchange');
        this.enableBubble('animalchange');

        this.on('change', function(field, val, oldVal){
            this.fireEvent('animalchange', val);
        }, this, {buffer: 200});
    },

    //NOTE: modules can override this method to enfore alternate rules
    getRegExValidator: function(){
        return '';
    }
});