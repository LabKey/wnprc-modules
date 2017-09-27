/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @cfg allowDragDropReorder
 */
Ext4.define('EHR.grid.Panel', {
    extend: 'LDK.grid.Panel',
    alias: 'widget.ehr-gridpanel',

    initComponent: function(){
        if (!this.store){
            alert('Must provide a storeConfig');
            return;
        }

        this.configureColumns();
        this.sortColumns();

        Ext4.apply(this, {
            cls: 'ldk-grid',
            clicksToEdit: 1,
            selModel: {
                mode: 'MULTI'
            },
            defaults: {
                border: false
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: this.getTbarButtons()
            }]
        });

        if (this.allowDragDropReorder) {
            this.viewConfig = this.viewConfig || {};
            this.viewConfig.plugins = this.viewConfig.plugins || [];
            this.viewConfig.plugins.push({
                ptype: 'gridviewdragdrop',
                pluginId: 'gridViewDragDrop'
            });
        }

        this.callParent();
        this.addEvents('animalchange', 'storevalidationcomplete');
        this.enableBubble('animalchange');

        this.getSelectionModel().on('selectionchange', function(sm, models){
            if (models.length != 1)
                return;

            var id = models[0].get('Id');
            this.fireEvent('animalchange', id);
        }, this);

        // the intention of the following is to avoid redrawing the entire grid, which is expensive, when we have
        // single row changes, or more importantly single row changes that only involve validation/tooltip error message differences
        this.on('storevalidationcomplete', this.onStoreValidationComplete, this, {buffer: 100, delay: 20});
        this.store.on('datachanged', function(s){
            this.needsRefresh = true;
            this.fireEvent('storevalidationcomplete');
        }, this);
        this.store.on('validation', this.onStoreValidation, this);

        var width = 20;
        Ext4.Array.forEach(this.columns, function(col){
            if (col.width){
                if (!col.hidden)
                    width += col.width;
            }
            else {
                console.log('no width');
            }
        }, this);

        this.minWidth = width;
        if (this.dataEntryPanel){
            this.dataEntryPanel.updateMinWidth(this.minWidth);
        }

    },

    pendingChanges: {},

    onStoreValidation: function(store, record){
        var key = store.storeId + '||' + record.internalId;

        this.pendingChanges[key] = {
            store: store,
            record: record
        };

        this.fireEvent('storevalidationcomplete');
    },

    onStoreValidationComplete: function(){
        //NOTE: if actively editing, dont update the grid.  defer until either edit or cancel
        if (this.editingPlugin.editing){
            //console.log('defer grid refresh: ' + this.store.storeId);

            var callback = function(){
                this.mun(this.editingPlugin, 'edit', callback, this);
                this.mun(this.editingPlugin, 'canceledit', callback, this);

                this.onStoreValidationComplete();
            };

            this.mon(this.editingPlugin, 'edit', callback, this, {single: true, delay: 100});
            this.mon(this.editingPlugin, 'canceledit', callback, this, {single: true, delay: 100});

            return;
        }

        var keys = Ext4.Object.getKeys(this.pendingChanges);
        if (this.needsRefresh || keys.length > 5){
            //console.log('grid refresh: ' + this.store.storeId);
            this.getView().refresh();
        }
        else if (!keys.length){
            console.log('no changes, skipping refresh');
        }
        else {
            Ext4.Array.forEach(keys, function(key){
                var obj = this.pendingChanges[key];

                //console.log('updating row: ' + key);
                this.getView().onUpdate(obj.store, obj.record);
            }, this);
        }

        this.needsRefresh = false;
        this.pendingChanges = {};
    },

    configureColumns: function(){
        if (this.columns)
            return;

        this.columns = [];

        if (this.formConfig.allowRowEditing !== false){
            this.columns.push({
                xtype: 'actioncolumn',
                editable: false,
                width: 40,
                icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
                tooltip: 'Edit',
                renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                    var errors = record.validate();
                    if (errors && !errors.isValid()){
                        cellMetaData.tdCls = 'labkey-grid-cell-invalid';

                        var messages = [];
                        errors.each(function(m){
                            var meta = store.getFields().get(m.field) || {};
                            messages.push((meta.caption || m.field) + ': ' + m.message);
                        }, this);

                        messages = Ext4.Array.unique(messages);
                        if (messages.length){
                            messages.unshift('Errors:');
                            cellMetaData.tdAttr = " data-qtip=\"" + Ext4.util.Format.htmlEncode(messages.join('<br>')) + "\"";
                        }
                    }
                    return value;
                },
                rowEditorPlugin: this.getRowEditorPlugin(),
                handler: function(view, rowIndex, colIndex, item, e, rec) {
                    var sm = view.getSelectionModel();

                    if (sm instanceof Ext4.selection.CellModel){
                        sm.setCurrentPosition({
                            view: view,
                            row: rowIndex,
                            column: colIndex
                        });
                    }

                    this.rowEditorPlugin.editRecord(rec);
                }
            });
        }

        var firstEditableColumn = -1;
        Ext4.each(this.formConfig.fieldConfigs, function(field, idx){
            var tableConfig = EHR.model.DataModelManager.getTableMetadata(field.schemaName, field.queryName, this.formConfig.configSources);
            var cfg = Ext4.apply({}, field);
            cfg = EHR.model.DefaultClientModel.getFieldConfig(cfg, this.formConfig.configSources);

            if(cfg.shownInGrid === false){
                return;
            }

            var colCfg = EHR.DataEntryUtils.getColumnConfigFromMetadata(cfg, this);
            if (colCfg){
                if (cfg.jsonType == 'date' && cfg.extFormat){
                    if (Ext4.Date.formatContainsHourInfo(cfg.extFormat)){
                        colCfg.editor.xtype = 'xdatetime';
                    }
                }

                if (!colCfg.hidden)
                    colCfg.tdCls = 'ldk-wrap-text';

                if (firstEditableColumn == -1 && colCfg.editable !== false){
                    firstEditableColumn = 1 + idx;
                }
                this.columns.push(colCfg);
            }
        }, this);

        if (firstEditableColumn != -1){
            this.firstEditableColumn = firstEditableColumn;
        }
    },

    sortColumns: function() {
        var self = this;
        var columnsWithAbsoluteIndex = [];
        var columnsWithRelativePlacements = [];
        var holdingTank = [];

        // Sort the fields into three categories
        jQuery.each(this.columns, function(index, value) {
            if (value.columnConfig && ('columnIndex' in value.columnConfig) ) {
                columnsWithAbsoluteIndex.push(value);
            }
            else if (value.columnConfig && ('displayAfterColumn' in value.columnConfig) ) {
                columnsWithRelativePlacements.push(value);
            }
            else {
                holdingTank.push(value);
            }
        });

        // Start out by assigning all of the fields without configuration
        this.columns = holdingTank;

        // Sort the columns that have an absolute index so that we go in ascending order
        columnsWithAbsoluteIndex.sort(function(a,b) {
            if      (a.columnConfig.columnIndex < b.columnConfig.columnIndex) { return -1 }
            else if (a.columnConfig.columnIndex > b.columnConfig.columnIndex) { return  1 }
            else                                                              { return  0 }
        });

        // Insert each of the fields with absolute
        jQuery.each(columnsWithAbsoluteIndex, function(index, value) {
            self.columns.splice(value.columnConfig.columnIndex, 0, value);
        });

        // Now go through and insert all of the relatively placed fields
        //   TODO: This seems really inefficient.  Think of doing something like generating an index, sorting
        //         by reverse index order and then inserting each.  By going from highest index to lowest index
        //         we would prevent our insertions from screwing up the indices of the yet to be added fields.
        //         I think this is the most efficient, because it only requires iterating over the list of
        //         columns once.
        jQuery.each(columnsWithRelativePlacements, function(index, value) {
            var found = false;
            jQuery.each(self.columns, function(index, curColVal) {
                if (curColVal.dataIndex === value.displayAfterColumn) {
                    self.columns.splice(index + 1, 0, value);
                    found = true;
                    return false; // break/short circuit
                }
            });

            // If we didn't find the field we were looking for, just add it to the end.
            if ( !found ) {
                console.warn("Couldn't find column name for relative placement: ", value.displayAfterColumn);
                self.columns.push(value);
            }
        });
    },

    getRowEditorPlugin: function(){
        if (this.rowEditorPlugin)
            return this.rowEditorPlugin;

        this.rowEditorPlugin = Ext4.create('EHR.plugin.RowEditor', {
            cmp: this
        });

        return this.rowEditorPlugin;
    },

    getFilterArray: function(){
        return [LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL)]
    },

    getTbarButtons: function(){
        var buttons = [];

        if (this.formConfig.tbarButtons){
            Ext4.each(this.formConfig.tbarButtons, function(btn){
                if (Ext4.isString(btn)){
                    buttons.push(EHR.DataEntryUtils.getGridButton(btn));
                }
                else {
                    buttons.push(btn);
                }
            }, this);
        }

        if (this.formConfig.tbarMoreActionButtons){
            var moreActions = [];
            Ext4.each(this.formConfig.tbarMoreActionButtons, function(btn){
                if (Ext4.isString(btn)){
                    moreActions.push(EHR.DataEntryUtils.getGridButton(btn));
                }
                else {
                    moreActions.push(btn);
                }
            }, this);

            if (moreActions.length){
                buttons.push({
                    text: 'More Actions',
                    menu: moreActions
                });
            }
        }

        return buttons;
    }
});