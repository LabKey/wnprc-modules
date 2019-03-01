/**
 * @external Ext4
 */
/**
 * @typedef {Object} Component
 * @prop {Function} define
 * @prop {Function} getSelectionModel
 * @prop {Function} mon
 */
(function () {
    /**
     * Edit event handler. Updates the estimated due date of the passed row based on any changes to the conception date.
     *
     * @param sender
     * @param {{field, originalValue, value}} args
     * @this Component
     * @private
     */
    function _onEdit(sender, args) {

        // short-circuit if the value did not actually change
        if (args.originalValue === args.value) {
            return;
        }

        // get the model for the selected/active row
        const model = this.getSelectionModel().getSelection()[0];

        var id = model.get('Id');
        var species;
        var gd;
        if (args.field === 'beats_per_minute' || args.field === 'crown_rump_mm' || args.field === 'head_circumference_mm' || args.field === 'femur_length_mm' || args.field === 'biparietal_diameter_mm') {
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                columns: 'species',
                filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                success: function(results) {
                    if (results.rows && results.rows.length) {
                        var row = results.rows[0];
                        console.log('Species: ' + row.species + ', Search Column: ' + args.field + ', Search Value: ' + args.value);
                        LABKEY.Query.selectRows({
                            schemaName: 'study',
                            queryName: 'getGestationalDay',
                            parameters: {
                                SPECIES: row.species,
                                SEARCH_COLUMN_NAME: args.field,
                                SEARCH_VALUE: args.value
                            },
                            scope: this,
                            success: function(results) {
                                if (results.rows && results.rows.length) {
                                    var row = results.rows[0];
                                    gd = row.gestational_day;
                                    var theField = args.field;
                                    if (theField.endsWith('_mm')) {
                                        theField = args.field.slice(0, -3);
                                    }
                                    theField += '_gest_day';
                                    model.set(theField, gd);
                                }
                            },
                            failure: function(errors) {
                                console.log(errors);
                            }
                        });
                    }
                },
                failure: function(errors) {
                    console.log(errors);
                }
            });
        }
    }

    function getSpecies(id) {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            columns: 'species',
            filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: function(results) {
                if (results.rows && results.rows.length) {
                    var row = results.rows[0];
                    return row.species;
                }
            },
            failure: function(error) {
                return false;
            }
        });
    }

    Ext4.define('WNPRC.grid.UltrasoundGridPanel', {
        extend: 'WNPRC.grid.AppendRecordGridPanel',
        alias: 'widget.wnprc-ultrasoundgridpanel',

        initComponent: function () {
            this.callParent(arguments);
            this.mon(this, 'edit', _onEdit, this);
        }
    });
})();