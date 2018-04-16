EHR.model.DataModelManager.registerMetadata('Default', {
    allQueries: {
        account: {
            shownInGrid: true,
            columnConfig: {
                displayAfterColumn: 'project'
            }
        },
        project: {
            xtype: 'wnprc-projectentryfield'
        }
    },
    byQuery: {
        'ehr.protocol' :{
            protocol: {
                hidden: false
            },
            contacts:{
                xtype: 'wnprc-multiselectfield',
                displayField: 'DisplayName',
                valueField: 'DisplayName',
                delimiter: ',',
                lookup: {
                    schemaName:    'core',
                    queryName:     'PrincipalsWithoutAdmin',
                    displayColumn: 'DisplayName',
                    keyColumn:     'DisplayName'
                },
                hidden: false,
                shownInGrid: true,
                columnConfig: {
                    width: 150
                }
            },
            project_type  :{
                hidden: true,
                shownInGrid: false
            },
            investigatorId :{
                hidden: true,
                shownInGrid: false
            },
            title :{
                hidden: false,
                shownInGrid: true,
                columnConfig: {
                    width: 350
                },
                width: 480
            },
            usda_level:{
                hidden: true,
                shownInGrid: false
            },
            external_id:{
                hidden: true,
                shownInGrid: false
            },
            last_modification:{
                shownInGrid:true
            },
            enddate:{
                shownInGrid:true,
                hidden: false
            },
            pdf:{
                shownInGrid: true,
                hidden: false
            }
        },
        'ehr.requests':{
            requestid:{
                hidden : true
            }
        },
        'wnprc.vvc' :{
            rowid:{
                hidden: true
            },
            date:{
                xtype: 'datefield',
                extFormat: 'Y-m-d',
                allowBlank: false,
                hidden: false,
                setInitialValue: function(v) {
                    var date = (new Date());
                    date.setHours(12);
                    date.setMinutes(00);
                    return v || date;
                }


            },
            dateapproved:{
                hidden: true
            },
            protocol:{
                columnConfig: {
                    width: 350
                },
                lookup:{
                    schemaName:    'ehr',
                    queryName:     'protocol_title',
                    displayColumn: 'protocolTitle',
                    keyColumn:     'protocol'
                }

            },
            description :{
                xtype: 'textarea',
                hidden: false,
                helpPopup: 'Please provide a brief summary of what you wish to be amended. Indicate which section(s) of ' +
                'the protocol will be changed (e.g. substances, nonsurgical procedures, surgery).',
                resizable: true

            },
            rationale:{
                hidden: false,
                helpPopup: 'Please provide a brief explanation why these changes will be made.'

            },
            date:{
                //hidden:true
            },
            requestid: {
                hidden : true
            },
            QCState:{
                allowBlank: false,
                noDuplicateByDefault: true,
                allowSaveInTemplate: false,
                allowDuplicateValue: false,
                noSaveInTemplateByDefault: true,
                facetingBehaviorType: "AUTO",
                shownInGrid: false,
                hidden: false,
                editorConfig: {
                    editable: false,
                    listWidth: 200,
                    disabled: true
                },
                columnConfig: {
                    width: 70
                }
            }
        }
    }
});

/*
 * Override the default "Add" record button for Ext4 Data Grids to add the record to the start of the grid,
 * rather than the bottom.
 */
(function() {
    // Don't execute this if DataEntryUtils.js hasn't been loaded.
    if (!EHR || !EHR.DataEntryUtils) {
        return;
    }

    var AddRecordButton = EHR.DataEntryUtils.getGridButton('ADDRECORD');

    AddRecordButton.handler = function(btn) {
        var grid = btn.up('gridpanel');
        if (!grid.store || !grid.store.hasLoaded()){
            console.log('no store or store hasnt loaded');
            return;
        }

        var cellEditing = grid.getPlugin(grid.editingPluginId);
        if (cellEditing)
            cellEditing.completeEdit();

        var model = grid.store.createModel({});
        grid.store.insert(0, [model]); //add a blank record in the first position
        var recIdx = grid.store.indexOf(model);

        var firstEditableColumn = _.find(grid.columns, function(col) {
            return col.editable == true;
        });
        var firstEditableColumnIndex = _.indexOf(grid.columns, firstEditableColumn);

        firstEditableColumnIndex = (firstEditableColumnIndex != -1) ? firstEditableColumnIndex - 1 : grid.firstEditableColumn;
        firstEditableColumnIndex = (firstEditableColumnIndex < grid.columns - 1) ? firstEditableColumnIndex : 0;

        if (cellEditing && recIdx > -1){
            cellEditing.startEditByPosition({row: recIdx, column: firstEditableColumnIndex});
        }
    };

    EHR.DataEntryUtils.registerGridButton('ADDRECORD', function(config) {
        return Ext4.Object.merge(AddRecordButton, config);
    });
})();