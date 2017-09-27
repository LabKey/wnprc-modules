/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @cfg containerPath
 */
Ext4.define('EHR.data.ClinicalHistoryStore', {
    extend: 'Ext.data.Store',
    alias: 'store.ehr-clinicalhistorystore',

    actionName: 'getClinicalHistory',

    constructor: function(config){
        Ext4.apply(this, {
            proxy: {
                type: 'memory'
            },
            fields: ['idfield', 'dateGroup', 'typeGroup', 'id', 'date', 'timeString', 'category', 'categoryColor', 'type', 'html', 'lsid', 'caseId', 'qcStateLabel', 'publicData', 'taskId', 'taskRowId', 'taskFormType', 'objectId', 'source']
        });

        this.actionName = config.actionName || this.actionName;

        this.callParent(arguments);
        this.model.prototype.idProperty = 'idfield';

        this.changeMode(config.sortMode || 'date');
    },

    /**
     *
     * @param config.subjectIds
     * @param config.minDate
     * @param config.maxDate
     * @param config.caseId
     * @param config.sortMode
     * @param config.checkedItems
     */
    reloadData: function(config){
        this.loading = true;
        this.removeAll();

        if (config.sortMode){
            this.changeMode(config.sortMode);
        }

        if (config.checkedItems){
            this.checkedItems = config.checkedItems;
        }

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', this.actionName, this.containerPath),
            method: 'POST',
            params: {
                subjectIds: config.subjectIds,
                caseId: config.caseId,
                minDate: config.minDate,
                maxDate: config.maxDate,
                redacted: !!this.redacted,
                includeDistinctTypes: !this.distinctTypes
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onDataLoad, this)
        });
    },

    onDataLoad: function(results){
        var toAdd = [];

        if (results.distinctTypes)
            this.distinctTypes = results.distinctTypes;

        Ext4.each(results.results, function(row){
            row.date = new Date(row.date);
            row.group = row.date.format('Y-m-d') + '_' + row.id;
            row.html = row.html ? row.html.replace(/\n/g, '<br>') : null;
            toAdd.push(this.createModel(row));
        }, this);

        this.loading = false;
        if (toAdd.length){
            this.add(toAdd);
            this.applyFilter(this.checkedItems);
        }
        else {
            this.fireEvent('datachanged', this);
        }
    },

    getDistinctTypes: function(){
        var types = {};
        if (this.distinctTypes){
            Ext4.Array.each(this.distinctTypes, function(t){
                types[t] = true;
            }, this);
        }

        this.each(function(record){
            types[record.get('type')] = true;
        }, this);

        return Ext4.Object.getKeys(types).sort();
    },

    changeMode: function(mode){
        var sorters, groupers;
        if (mode == 'date'){
            sorters = [
                {property: 'dateGroup', direction: 'DESC'},
                {property: 'timeString', direction: 'DESC'}
            ];
            groupers = [{property: 'dateGroup', direction: 'DESC'}];
        }
        else {
            sorters = [
                {property: 'typeGroup', direction: 'ASC'},
                {property: 'timeString', direction: 'DESC'}
            ];
            groupers = [{property: 'typeGroup', direction: 'ASC'}];
        }

        this.group(groupers);
        this.sort(sorters);
    },

    applyFilter: function(types){
        this.clearFilter();

        if (types && types.length){
            var regEx = new RegExp('^' + types.join('$|^') + '$');
            this.filter([{property: 'type', value: regEx}]);
        }
    }
});