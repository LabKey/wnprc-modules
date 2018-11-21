EHR.model.DataModelManager.registerMetadata('NecropsyTask', {
    byQuery: {
        'study.necropsy': {
            comments: {
                hidden: false,
                editable: false,
                label: "Requester Comments"
            },
            causeofdeath:{
                lookup: {
                    filterArray: [LABKEY.Filter.create('date_disabled', null, LABKEY.Filter.Types.ISBLANK)]
                }
            }
        },
        'study.drug': {
            date: {
                shownInGrid: true,
                hidden: false
            },
            code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            },
            enddate: {
                hidden: false,
                shownInGrid: true
            },
            project: {
                shownInGrid: false,
                hidden: true
            },
            account: {
                shownInGrid: false,
                hidden: true
            },
            concentration: {
                shownInGrid: true
            },
            restraintTime: {
                hidden: true,
                shownInGrid: false
            },
            restraint: {
                getInitialValue: function(value, record) {
                    return "Chemical";
                },
                shownInGrid: true
            },
            restraintDuration: {
                getInitialValue: function(value, record) {
                    return "<30 min";
                },
                shownInGrid: true
            }
        },
        'study.Alopecia': {
            cause: {
                hidden: true
            },
            other: {
                hidden: true
            },
            project: {
                hidden: true
            },
            account: {
                hidden: true
            },
            QCState: {
                hidden: true
            }
        }
    }
});