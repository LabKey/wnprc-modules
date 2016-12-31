EHR.model.DataModelManager.registerMetadata('NewAnimal', {
    allQueries: {
        project: {
            allowBlank: true
        },
        account: {
            allowBlank: true
        }
    },
    byQuery: {
        'study.tb': {
            notPerformedAtCenter: {
                defaultValue: true,
                columnConfig: {
                    width: 180,
                    displayAfterColumn: "date"
                }
            },
            performedby: {
                columnConfig: {
                    displayAfterColumn: "remarks"
                }
            },
            result1: {
                defaultValue: '-'
            },
            result2: {
                defaultValue: '-'
            },
            result3: {
                defaultValue: '-'
            },
            dilution: {
                shownInGrid: true
            },
            lot: {
                shownInGrid: true
            },
            eye: {
                hidden: false,
                shownInGrid: true
            }
        },
        'study.Arrival': {
            geographic_origin: {
                columnConfig: {
                    width: 120,
                    displayAfterColumn: 'source'
                }
            },
            initialCond: {
                hidden: false
            }
        },
        'study.virologyResults': {
            account: {
                shownInGrid: true,
                columnConfig: {
                    displayAfterColumn: 'project'
                }
            },
            project: {
                columnConfig: {
                    displayAfterColumn: 'date'
                }
            }
        }
    }
});