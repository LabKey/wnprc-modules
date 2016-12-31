/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.grid.plugin.ClinicalObservationsCellEditing', {
    extend: 'LDK.grid.plugin.CellEditing',
    alias: 'plugin.clinicalobservationscellediting',

    constructor: function(config){
        this.observationTypesStore = EHR.DataEntryUtils.getObservationTypesStore();

        this.callParent(arguments);
    },

    getEditor: function(record, column) {
        var dataIndex = column ? column.dataIndex : null;
        if (dataIndex != 'observation'){
            return this.callParent(arguments);
        }

        var category = record.get('category');
        if (!category){
            return false;
        }

        var store = this.observationTypesStore;

        //note: we allow the process to proceed even if we cant find the category.  this is to support situations where we have saved records using a no-longer supported category
        var rec = store.findRecord('value', category);
        LDK.Assert.assertNotEmpty('Unable to find observation types record matching category: [' + category + '].  store count: ' + store.getCount() + ', loading: ' + store.isLoading(), rec);

        var me = this,
                editors = me.editors,
                editorId = column.getItemId() + '||' + category,
                editor = editors.getByKey(editorId),
                editorOwner = me.grid.ownerLockable || me.grid;

        if (!editor || editor.obsCategory != category){
            var config = rec && rec.get('editorconfig') ? Ext4.decode(rec.get('editorconfig')) : null;
            config = config || {
                xtype: 'textfield'
            };

            editor = Ext4.create('Ext.grid.CellEditor', {
                obsCategory: category,
                floating: true,
                editorId: editorId,
                field: config
            });

            //NOTE: essential for keyboard navigation
            if (editor && !editor.hasCellEditOverrides){
                this.applyEditorOverrides(editor);
            }

            editorOwner.add(editor);
            editor.on({
                scope: me,
                specialkey: me.onSpecialKey,
                complete: me.onEditComplete,
                canceledit: me.cancelEdit
            });
            column.on('removed', me.cancelActiveEdit, me);

            me.editors.add(editor);
        }

        editor.grid = me.grid;

        // Keep upward pointer correct for each use - editors are shared between locking sides
        editor.editingPlugin = me;

        return editor;
    }
});