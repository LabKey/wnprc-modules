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
        },
        enddate:{
            hidden: true,
            allowBlank: false
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