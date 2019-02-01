EHR.DataEntryUtils.registerGridButton('APPENDRECORD', function (config) {
    return Ext4.Object.merge({
        itemId: 'appendRecordBtn',
        text: 'Add Record',
        tooltip: 'Click to append a row at the bottom of the grid',
        handler: function (btn) {
            const grid = btn.up('gridpanel');
            if (!grid.store) return;

            const editor = grid.getPlugin(grid.editingPluginId);
            if (editor) editor.completeEdit();

            //add a blank record in the last position
            grid.store.add([LDK.StoreUtils.createModelInstance(grid.store, null, true)]);

            if (editor) editor.startEditByPosition({
                row: (grid.store.getCount() - 1),
                column: grid.firstEditableColumn || 0
            });
        }
    }, config);
});