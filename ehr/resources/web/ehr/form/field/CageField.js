/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.field.CageField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.ehr-cagefield',
    fieldLabel: 'Cage',
    initComponent: function(){
        this.callParent();

        this.on('render', function(field){
            field.el.set({autocomplete: 'off'});
        });
    },

    onValueChange: Ext4.emptyFn

    //NOTE: WNPRC can override this from their module
//                    change: function(field, val){
//                        if(val && !isNaN(val)){
//                            var newVal = EHR.Utils.padDigits(val, 4);
//                            if(val != newVal)
//                                field.setValue(newVal);
//                        }
//                    }

})