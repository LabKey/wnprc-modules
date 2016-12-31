/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.field.TimeOfDayField', {
    extend: 'Ext.form.ComboBox',
    alias: 'widget.ehr-timeofdayfield',

    initComponent: function(){
        Ext4.apply(this, {
            multiSelect: true,
            fieldLabel: 'Time of Day',
            value: 'both',
            displayField: 'display',
            valueField: 'time',
            queryMode: 'local',
            store: {
                type: 'array',
                fields: ['time', 'display'],
                data: [['both', 'Both'], ['AM', 'AM'],['PM', 'PM']]
            },
            listeners: {
                change: function(field, val, oldVal){
                    val = (!val || Ext4.isArray(val)) ? val : [val];
                    oldVal = (!oldVal || Ext4.isArray(oldVal)) ? oldVal : [oldVal];

                    //if the previous selection was just 'both', and the user picks something else, we need to de-select 'both'
                    if (oldVal && oldVal.indexOf('both') != -1 && oldVal.length == 1 && val.indexOf('both') != -1 && val.length > 1){
                        val = val.remove('both');
                        this.setValue(val);
                    }
                    else if (val && val.indexOf('both') != -1 && val.length > 1 && oldVal.indexOf('both') == -1){
                        this.setValue('both');
                    }
//                            else if (val.indexOf('AM') > -1 && val.indexOf('PM') > -1){
//                                this.setValue('both');
//                            }
                }
            }
        });

        this.callParent(arguments);
    },

    getURLParam: function(){
        var val = this.getTimeValue();
        return val ? val.join(';') : null;
    },

    getTimeValue: function(){
        var timeOfDay = this.getValue();
        timeOfDay = (!timeOfDay || Ext4.isArray(timeOfDay)) ? timeOfDay : [timeOfDay];

        if (timeOfDay && timeOfDay.indexOf('both') > -1){
            return null;
        }
        else if (timeOfDay && timeOfDay.indexOf('AM') > -1 && timeOfDay.indexOf('PM') > -1){
            return null;
        }

        return timeOfDay;
    }
});
