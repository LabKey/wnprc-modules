page = new XPages.BasePage({
    relativeURL: 'ehr/WNPRC/EHR/manageTask.view?formtype=Irregular%20Observations',
    bodyPanelElements: {
        dataEntryTable: {
            selector: ".nightwatch-test-dataEntryTable",
            elements: {
                header: { selector: ".nightwatch-test-dataEntryTable-header" }
            }
        }
    }
});

var makeFormPanel = function(title, formElements) {
    var formPanel = {
        selector: ".nightwatch-test-dataEntryTable-formPanel-" + title,
        elements: {
            header: { selector: ".nightwatch-test-class-formpanel-header" },
            footer: { selector: ".nightwatch-test-class-formpanel-footer" }
        },
        sections: {
            buttons: {
                selector: '.x-panel-bwrap',
                elements: { } // these will get added a little later
            },
            grid: {
                selector: '.nightwatch-test-class-formpanel-grid',
                elements: {
                    header:   { selector: '.x-panel-header .x-panel-header-text' },
                    metadata: { selector: '.nightwatch-test-class-grid-metadata' }
                }
            },
            form: {
                selector: ".nightwatch-test-class-formpanel-form",
                sections: formElements || {}
            }

        }
    };


    // Define the buttons
    var buttons = [
        'AddRecord', 'AddBatch', 'DeleteSelected', 'SelectAll', 'DuplicateSelected', 'BulkEdit', 'RemoveBlank'
    ];
    _.each(buttons, function(element, index, list){
        formPanel.sections.buttons.elements[element] = {
            selector: '.nightwatch-test-class-formpanel-tbarbutton-' + element
        };
    });

    return formPanel;
};


var formPanelSections = [
    "ObservationsPerAnimal",
    {
        title: "Observations Per Cage",
        formItems: {
            feces: {
                selector: ".nightwatch-test-class-formpanel-item-feces",
                elements: {
                    "bloodydiarrhea-checkbox": { selector: ".nightwatch-test-class-formpanel-input-checkbox-bloodydiarrhea"},
                    "bloodyfeces-checkbox":    { selector: ".nightwatch-test-class-formpanel-input-checkbox-bloodyfeces"   },
                    "diarrhea-checkbox":       { selector: ".nightwatch-test-class-formpanel-input-checkbox-diarrhea"      },
                    "firmstool-checkbox":      { selector: ".nightwatch-test-class-formpanel-input-checkbox-firmstool"     },
                    "mucus-checkbox":          { selector: ".nightwatch-test-class-formpanel-input-checkbox-mucus"         },
                    "softfeces-checkbox":      { selector: ".nightwatch-test-class-formpanel-input-checkbox-softfeces"     },
                    "waterydiarrhea-checkbox": { selector: ".nightwatch-test-class-formpanel-input-checkbox-waterydiarrhea"}
                }
            },
            date: {
                selector: ".nightwatch-test-class-formpanel-item-date",
                elements: {
                    "date-field": { selector: ".nightwatch-test-class-formpanel-input-date-date" },
                    "time-field": { selector: ".nightwatch-test-class-formpanel-input-date-time" }
                }
            },
            room: {
                selector: ".nightwatch-test-class-formpanel-item-room",
                elements: {
                    "room-field": { selector: ".nightwatch-test-class-formpanel-input-text" }
                }
            },
            cage: {
                selector: ".nightwatch-test-class-formpanel-item-cage",
                elements: {
                    "cage-field": { selector: ".nightwatch-test-class-formpanel-input-text"}
                }
            },
            userid: {
                selector: ".nightwatch-test-class-formpanel-item-userid",
                elements: {
                    "userid-field": { selector: ".nightwatch-test-class-formpanel-input-text" }
                }
            },
            everythingok: {
                selector: ".nightwatch-test-class-formpanel-item-everythingisok",
                elements: {

                }
            },
            remarks: {
                selector: ".nightwatch-test-class-formpanel-item-remark",
                elements: {
                    "remarks-field": { selector: ".nightwatch-test-class-formpanel-input-textarea" }
                }
            }
        }
    },
    "OKRooms"
];
_.each(formPanelSections, function(element, index, list) {
    var dataEntryTable = page.sections.bodypanel.sections.dataEntryTable;
    if ( !('sections' in dataEntryTable) ) {
        dataEntryTable.sections = {};
    }

    if (_.isString(element)){
        dataEntryTable.sections[element] = makeFormPanel(element);
    }
    else {
        element.title = element.title.replace(/\s/g,'');
        dataEntryTable.sections[element.title] = makeFormPanel(element.title, element.formItems);
    }
});

module.exports = page;