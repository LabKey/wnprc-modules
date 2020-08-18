EHR.model.DataModelManager.registerMetadata('ResearchUltrasounds', {
    allQueries: {

    },
    byQuery: {
        'study.research_ultrasounds': {
            QCState: {
                shownInGrid: false,
                hidden: true
            },
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            }
        },
        'study.ultrasound_measurements': {

        },
        'study.ultrasound_review': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            QCState: {
                shownInGrid: false,
                hidden: true
            }
        },
        'study.restraints': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            date: {
                shownInGrid: false,
                hidden: true
            },
            project: {
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