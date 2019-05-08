Ext4.define('WNPRC.form.field.CalculatedGestationDayField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.wnprc-calculatedgestationdayfield',

    fieldLabel: 'calculatedgestationday',
    emptyText: '',
    disabled: false,

    initComponent: function(){
        Ext4.apply(this, {
            listeners: {
                scope: this,
                beforerender: function(field){
                    let target = field.up('form');
                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (!!target && !target.hasListener('gestationchange_' + field.name)) {
                        field.mon(target, 'gestationchange_' + field.name, field.updateGestationDay, field, {buffer: 300});
                    }
                }
            }
        });

        this.callParent(arguments);
    },

    updateGestationDay: function(fieldName, val, oldVal) {
        let animalIdField = this.up('form').getForm().findField('Id');
        let animalId = !!animalIdField ? animalIdField.value : '';

        if (!!animalId && !!val && (val !== oldVal || !!this.value)) {
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                columns: 'species',
                filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                success: function(results) {
                    if (results.rows && results.rows.length) {
                        let row = results.rows[0];
                        LABKEY.Query.selectRows({
                            schemaName: 'wnprc',
                            queryName: 'getGestationalDay',
                            parameters: {
                                SPECIES: row.species,
                                SEARCH_COLUMN_NAME: fieldName,
                                SEARCH_VALUE: val
                            },
                            scope: this,
                            success: function(results) {
                                if (results.rows && results.rows.length) {
                                    let row = results.rows[0];
                                    this.setValue(row.gestational_day);
                                } else {
                                    this.setValue(null);
                                }
                            },
                            failure: EHR.Utils.onFailure
                        });
                    }
                },
                failure: EHR.Utils.onFailure
            });
        } else if (!!val) {
            this.setValue('');
        }
    }
});