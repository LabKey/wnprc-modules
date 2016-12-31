EHR.model.DataModelManager.registerMetadata('IrregularObservations', {
    allQueries: {
        feces: {
            xtype: 'checkcombo',
            hasOwnTpl: true,
            includeNullRecord: false,
            lookup: {
                schemaName:    'ehr_lookups',
                queryName:     'obs_feces',
                displayColumn: 'title',
                keyColumn:     'value'
            },
            editorConfig: {
                tpl:         null,
                multiSelect: true,
                separator:   ','
            },
            columnConfig: {
                width: 200
            }
        }
    }
});