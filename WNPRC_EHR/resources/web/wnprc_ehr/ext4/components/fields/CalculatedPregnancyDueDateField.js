Ext4.define('WNPRC.form.field.CalculatedPregnancyDueDateField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.wnprc-calculatedpregnancyduedatefield',

    fieldLabel: 'calculatedpregnancyduedate',
    emptyText: '',
    disabled: false,

    initComponent: function(){
        Ext4.apply(this, {
            listeners: {
                scope: this,
                beforerender: function(field){
                    let target = field.up('form');
                    if (!!target && !target.hasListener('pregnancydatechange_' + field.name)) {
                        field.mon(target, 'pregnancydatechange_' + field.name, field.updatePregnancyDueDate, field, {buffer: 300});
                    }
                }
            }
        });

        this.callParent(arguments);
    },

    updatePregnancyDueDate: function(fieldName, val, oldVal) {
        let theForm = this.up('form').getForm();
        let animalIdField = theForm.findField('Id');
        let animalId = !!animalIdField ? animalIdField.value : '';

        if (!!animalId && !!val && (val !== oldVal)) {
            let gestationPeriod = 165; //Rhesus
            if (animalId.startsWith('cy')) {
                //Cynomolgus
                gestationPeriod = 165;
            } else if (animalId.startsWith('cj')) {
                //Marmoset
                gestationPeriod = 144;
            }

            switch (fieldName) {
                case 'date_conception': {
                    theForm.findField('date_due').setValue(Ext4.Date.add(val, Ext4.Date.DAY, gestationPeriod));
                    break;
                }
                case 'date_due': {
                    theForm.findField('date_conception').setValue(Ext4.Date.add(val, Ext4.Date.DAY, -gestationPeriod));
                    break;
                }
                case 'breedingencounterid': {
                    LABKEY.Query.selectRows({
                        schemaName: 'study',
                        queryName: 'breeding_encounters',
                        columns: 'date,enddate',
                        filterArray: [
                            LABKEY.Filter.create('lsid', val, LABKEY.Filter.Types.EQUALS)
                        ],
                        scope: this,
                        success: function(data) {
                            if (data.rows && data.rows.length) {
                                var row = data.rows[0];
                                var early = LDK.ConvertUtils.parseDate(row.date, 'Y/m/d H:i:s');
                                //Conception can occur up to 3 days after the breeding window has ended
                                var late = Ext4.Date.add(LDK.ConvertUtils.parseDate(row.enddate, 'Y/m/d H:i:s'), Ext4.Date.DAY, 3);
                                theForm.findField('date_conception_early').setValue(early);
                                theForm.findField('date_conception_late').setValue(late);
                                theForm.findField('date_due_early').setValue(Ext4.Date.add(early, Ext4.Date.DAY, gestationPeriod));
                                theForm.findField('date_due_late').setValue(Ext4.Date.add(late, Ext4.Date.DAY, gestationPeriod));
                            }
                        },
                        failure: EHR.Utils.onFailure
                    });
                    break;
                }
            }
        }
    }
});