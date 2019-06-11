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

        let id = model.get('Id');
        if (args.field === 'gest_sac_mm' || args.field === 'crown_rump_mm' || args.field === 'biparietal_diameter_mm' || args.field === 'femur_length_mm') {
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                columns: 'species',
                filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
                scope: this,
                success: function(results) {
                    if (results.rows && results.rows.length) {
                        let row = results.rows[0];
                        LABKEY.Query.selectRows({
                            schemaName: 'wnprc',
                            queryName: 'getGestationalDay',
                            parameters: {
                                SPECIES: row.species,
                                SEARCH_COLUMN_NAME: args.field,
                                SEARCH_VALUE: args.value
                            },
                            scope: this,
                            success: function(results) {
                                let theField = args.field;
                                if (theField.endsWith('_mm')) {
                                    theField = args.field.slice(0, -3);
                                }
                                theField += '_gest_day';
                                if (results.rows && results.rows.length) {
                                    let row = results.rows[0];
                                    let gd = row.gestational_day;
                                    model.set(theField, gd);
                                } else {
                                    model.set(theField, null);
                                }
                            },
                            failure: EHR.Utils.onFailure
                        });
                    }
                },
                failure: EHR.Utils.onFailure
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