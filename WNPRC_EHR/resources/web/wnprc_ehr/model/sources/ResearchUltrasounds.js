EHR.model.DataModelManager.registerMetadata('ResearchUltrasounds', {
    allQueries: {
        // Id: {
        //     shownInGrid: false,
        //     hidden: true
        // },
        // date: {
        //     shownInGrid: false,
        //     hidden: true
        // },
        // performedby: {
        //     shownInGrid: false,
        //     hidden: true
        // }
    },
    byQuery: {
        'study.research_ultrasounds': {
            QCState: {
                shownInGrid: false,
                hidden: true
            }
        },
        'study.ultrasound_measurements': {

        },
        'study.ultrasound_review': {
            Id: {
                parentConfig: {
                    storeIdentifier: {queryName: 'research_ultrasounds', schemaName: 'study'},
                    dataIndex: 'Id'
                },
                shownInGrid: false,
                hidden: true
            },
            QCState: {
                shownInGrid: false,
                hidden: true
            }
        }
    }
});