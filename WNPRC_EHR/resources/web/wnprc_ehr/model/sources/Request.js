EHR.model.DataModelManager.registerMetadata('WNPRC_Request', {
    allQueries: {
        account: {
            shownInGrid: true,
            columnConfig: {
                displayAfterColumn: 'project'
            }
        },
        //Category
        type: {
            columnConfig: {
                displayAfterColumn: "servicerequested"
            }
        },
        collectedBy: {
            columnConfig: {
                displayAfterColumn: "collectionMethod"
            }
        },
        dateReviewed: {
            hidden: true
        },
        clinremark: {
            hidden: true
        },
        reviewedBy: {
            hidden: true
        },
        servicerequested: {
            lookup: {
                queryName: 'filter_labwork' // Use the filter_labwork query to filter out disabled options.
            }
        },
        sampletype: {
            hidden: false,
            shownInGrid: true
        }
    },
    byQuery: {
        'study.necropsy': {
            grossdescription: {
                hidden: true
            },
            histologicalDescription: {
                hidden: true
            },
            patho_notes: {
                hidden: true
            },
            performedby: {
                hidden: true
            },
            pathologist: {
                hidden: true
            },
            comments: {
                hidden: false
            }
        }
    }
});