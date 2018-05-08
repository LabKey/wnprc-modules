// noinspection JSUnresolvedVariable, JSUnresolvedFunction
/**
 * Metadata for the WNPRC EHR breeding parent records (i.e., breeding encounters).
 */
EHR.model.DataModelManager.registerMetadata('Breeding', {
    byQuery: {
        'study.ultrasounds': {
            Id: {
                editorConfig: {
                    plugins: ['wnprc-animalfield']
                }
            },
            pregnancyid: {
                xtype: 'wnprc-pregnancyfield'
            }
        }
    }
});