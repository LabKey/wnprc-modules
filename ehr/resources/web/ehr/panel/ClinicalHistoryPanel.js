/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg subjectId
 * @cfg minDate
 * @cfg maxDate
 * @cfg maxGridHeight
 * @cfg autoLoadRecords
 * @cfg hideExportBtn
 * @cfg sortMode
 * @cfg checkedItems
 * @cfg showMaxDate
 * @cfg redacted
 * @cfg printMode
 */
Ext4.define('EHR.panel.ClinicalHistoryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-clinicalhistorypanel',

    showMaxDate: false,

    initComponent: function(){
        this.sortMode = this.sortMode || 'date';

        if (this.minDate && !Ext4.isDate(this.minDate))
            this.minDate = LDK.ConvertUtils.parseDate(this.minDate);
        if (this.maxDate && !Ext4.isDate(this.maxDate))
            this.maxDate = LDK.ConvertUtils.parseDate(this.maxDate);

        Ext4.apply(this, {
            border: false,
            items: [
                this.getGridConfig()
            ],
            listeners: {
                scope: this,
                render: function(){
                    //defer loading of data
                    if (this.autoLoadRecords){
                        store.reloadData({
                            subjectIds: [this.subjectId],
                            caseId: this.caseId,
                            minDate: this.minDate,
                            maxDate: this.maxDate,
                            checkedItems: this.checkedItems
                        });
                    }
                }
            }
        });

        this.callParent();

        var grid = this.down('grid');
        if (grid.rendered){
            grid.setLoading(true);
        }
        else {
            grid.on('afterrender', function(grid){
                if (grid.store.loading){
                    grid.setLoading(true);
                }
            }, this, {delay: 120, single: true});
        }

        if(this.subjectId || this.caseId){
            var store = this.down('#gridPanel').store;
            store.on('datachanged', function(){
                if (!store.loading){
                    var grid = this.down('grid');
                    if (grid){
                        grid.setLoading(false);
                        grid.getView().refresh();
                    }
                }
            }, this);

            store.on('exception', function(store){
                this.down('grid').setLoading(false);
            }, this);
        }
        else {
            Ext4.Msg.alert('Error', 'Must supply at least 1 subject Id or a caseId')
        }
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            border: this.printMode ? false : true,
            minHeight: 100,
            minWidth: this.width - 50,
            cls: 'ldk-grid',
            maxHeight: this.maxGridHeight,
            height: this.gridHeight,
            hideHeaders: true,
            deferEmptyText: true,
            viewConfig : {
                emptyText: this.minDate ? 'No records found since: ' + this.minDate.format('m/d/Y') : 'There are no records to display',
                deferEmptyText: true,
                enableTextSelection: true,
                border: false,
                stripeRows : true
            },
            columns: this.getColumnConfig(),
            features: [this.getGroupingFeature()],
            store: this.getStoreConfig(),
            itemId: 'gridPanel',
            width: this.width,
            subjectId: this.subjectId,
            caseId: this.caseId,
            minDate: this.minDate,
            maxDate: this.maxDate,
            tbar: this.hideGridButtons ? null : {
                border: true,
                items: [{
                    xtype: 'datefield',
                    fieldLabel: 'Min Date',
                    itemId: 'minDate',
                    labelWidth: 80,
                    width: 200,
                    value: this.minDate
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Max Date',
                    itemId: 'maxDate',
                    labelWidth: 80,
                    width: 200,
                    hidden: this.showMaxDate,
                    value: this.maxDate
                },{
                    xtype: 'button',
                    text: 'Reload',
                    handler: function(btn){
                        var panel = btn.up('ehr-clinicalhistorypanel');
                        panel.doReload();
                    }
                },{
                    text: 'Show/Hide Types',
                    scope: this,
                    handler: function(btn){
                        this.showFilterPanel();
                    }
                },{
                    text: 'Collapse All',
                    hidden: this.printMode,
                    collapsed: false,
                    handler: function(btn){
                        var grid = btn.up('grid');
                        var feature = grid.getView().getFeature('historyGrouping');

                        if (btn.collapsed){
                            feature.expandAll();
                            btn.setText('Collapse All');
                        }
                        else {
                            feature.collapseAll();
                            btn.setText('Expand All')
                        }

                        btn.collapsed = !btn.collapsed;
                    }
                },{
                    hidden: this.printMode,
                    text: (this.sortMode == 'type' ? 'Group By Date' : 'Group By Type'),
                    sortMode: this.sortMode == 'type' ? 'date' : 'type',
                    scope: this,
                    handler: function(btn){
                        //toggle the button
                        if (btn.sortMode == 'type'){
                            btn.setText('Group By Date');
                            btn.sortMode = 'date';
                            this.changeMode('type');
                        }
                        else {
                            btn.setText('Group By Type');
                            btn.sortMode = 'type';
                            this.changeMode('date');
                        }
                    }
                },{
                    text: 'Print Version',
                    hidden: this.hideExportBtn || this.printMode,
                    scope: this,
                    handler: function(btn){
                        var params = {
                            hideGridButtons: true
                        };
                        if (this.subjectId)
                            params.subjectId = [this.subjectId];
                        if (this.caseId)
                            params.caseId = this.caseId;
                        if (this.minDate)
                            params.minDate = this.minDate.format('Y-m-d');
                        if (this.maxDate)
                            params.maxDate = this.maxDate.format('Y-m-d');
                        if (this.sortMode)
                            params.sortMode = this.sortMode;
                        if (this.checkedItems && this.checkedItems.length)
                            params.checkedItems = this.checkedItems.join(';');

                        var url = LABKEY.ActionURL.buildURL('ehr', 'clinicalHistoryExport', null, params);
                        window.open(url, '_blank');
                    }
                }]
            }
        };
    },

    reloadData: function(config){
        var grid = this.down('grid');

        grid.setLoading(true);
        grid.store.reloadData({
            minDate: config.minDate,
            maxDate: config.maxDate,
            subjectIds: [this.subjectId],
            caseId: this.caseId,
            sortMode: this.sortMode,
            checkedItems: this.checkedItems
        });
    },

    doReload: function(){
        var minDateField = this.down('#minDate');
        var maxDateField = this.down('#maxDate');
        if (!minDateField.isValid()){
            Ext4.Msg.alert('Error', 'Invalid value for min date');
            return;
        }
        if (!maxDateField.isValid()){
            Ext4.Msg.alert('Error', 'Invalid value for max date');
            return;
        }

        this.minDate = minDateField.getValue();
        this.maxDate = maxDateField.getValue();

        this.reloadData({
            minDate: this.minDate,
            maxDate: this.maxDate
        });
    },

    getStoreConfig: function(){
        return {
            type: 'ehr-clinicalhistorystore',
            containerPath: this.containerPath,
            redacted: this.redacted,
            sortMode: this.sortMode
        };
    },

    getColumnConfig: function(){
        return [{
            text: 'Category',
            dataIndex: 'category',
            tdCls: 'ldk-wrap-text',
            width: 180,
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                if (record.get('categoryColor')){
                    cellMetaData.style = cellMetaData.style ? cellMetaData.style + ';' : '';
                    cellMetaData.style += 'background-color: ' + record.get('categoryColor') + ';';
                }

                return value;
            }
        },{
            text: 'Date',
            xtype: 'datecolumn',
            dataIndex: 'date',
            format: 'Y-m-d h:i',
            hidden: (this.sortMode == 'date'),
            width: 180
        },{
            text: '',
            dataIndex: 'timeString',
            hidden: (this.sortMode != 'date'),
            width: 80
        },{
            text: 'Description',
            dataIndex: 'html',
            minWidth: 300,
            tdCls: 'ldk-wrap-text',
            flex: 10
        },{
            text: 'Status',
            dataIndex: 'qcStateLabel',
            tdCls: 'ldk-wrap-text',
            width: 120,
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                if (record.get('publicData') === false){
                    cellMetaData.style = cellMetaData.style ? cellMetaData.style + ';' : '';
                    cellMetaData.style += 'background-color: yellow;';
                }

                return value == EHR.QCStates.COMPLETED ? '' : value;
            }
        },{
            text: '',
            dataIndex: 'taskId',
            width: 60,
            renderer: function(value, cellMetaData, record, rowIndex, colIndex, store){
                if (record.get('taskId')){
                    return '<a href="' + LABKEY.ActionURL.buildURL('ehr', 'dataEntryFormDetails', null, {formType: record.get('taskFormType'), taskid: record.get('taskId')}) + '" target="_blank">' + record.get('taskRowId') + '</a>';
                }

                return '';
            }
        }];
    },

    getGroupingFeature: function(){
        return Ext4.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: [
                '<div>{name:this.formatName}</div>', {
                    formatName: function(name) {
                        name = name.split('_');
                        var date = name.shift();
                        name = name.join('_');
                        return date + ' (' + name + ')';
                    }
                }
            ],
            hideGroupedHeader: true,
            startCollapsed: false,
            id: 'historyGrouping'
        });
    },

    changeMode: function(mode){
        this.sortMode = mode;
        var grid = this.down('grid');

        var columns = this.getColumnConfig();
        Ext4.Array.forEach(columns, function(col){
            if (col.dataIndex == 'date'){
                col.hidden = (mode == 'date');
            }
            else if (col.dataIndex == 'timeString'){
                col.hidden = (mode == 'type');
            }
        }, this);

        grid.on('reconfigure', function(){
            grid.store.changeMode(mode);
        }, this, {single: true});
        grid.reconfigure(null, columns);
    },

    showFilterPanel: function(){
        Ext4.create('EHR.window.ClinicalHistoryFilterWindow', {
            clinicalHistoryPanel: this
        }).show();
    },

    applyFilter: function(types){
        this.checkedItems = types;
        this.getStore().applyFilter(types);
    },

    getStore: function(){
        return this.down('grid').store;
    }
});

/**
 * @cfg clinicalHistoryPanel
 */
Ext4.define('EHR.window.ClinicalHistoryFilterWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            bodyStyle: 'padding: 5px;',
            title: 'Show/Hide Types',
            closeAction: 'destroy',
            modal: true,
            defaults: {
                border: false
            },
            items: [{
                html: 'Use the checkboxes below to toggle which types of information are shown',
                style: 'padding-bottom: 10px;'
            },{
                layout: 'hbox',
                style: 'padding-bottom: 5px;',
                items: [{
                    xtype: 'ldk-linkbutton',
                    text: '[Select None]',
                    style: 'padding: 5px;',
                    itemId: 'selectNone',
                    handler: function(field){
                        field.up('window').down('checkboxgroup').items.each(function(cb){
                            cb.setValue(false);
                        }, this);
                    }
                },{
                    xtype: 'ldk-linkbutton',
                    text: '[Select All]',
                    style: 'padding: 5px;',
                    itemId: 'selectAll',
                    handler: function(field){
                        field.up('window').down('checkboxgroup').items.each(function(cb){
                            cb.setValue(true);
                        }, this);
                    }
                }]
            },{
                xtype: 'checkboxgroup',
                columns: 2,
                itemId: 'types',
                defaults: {
                    name: 'type',
                    xtype: 'checkbox',
                    width: 220
                },
                items: this.getCheckboxes()
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();
    },

    getCheckboxes: function(){
        var types = {};
        var store = this.clinicalHistoryPanel.getStore();


        var items = [];
        Ext4.Array.each(store.getDistinctTypes(), function(type){
            items.push({
                boxLabel: type,
                inputValue: type,
                checked: (!this.clinicalHistoryPanel.checkedItems || Ext4.Array.indexOf(this.clinicalHistoryPanel.checkedItems, type) > -1)
            });
        }, this);

        return items;
    },

    onSubmit: function(){
        var types = this.down('#types').getValue().type;
        types = Ext4.isArray(types) || !types ? types : [types];
        this.clinicalHistoryPanel.applyFilter(types);
        this.close();
    }
});

