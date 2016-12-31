/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg taskId
 * @cfg requestId
 */
Ext4.define('EHR.panel.DataEntryFormDetailsPanel', {
    extend: 'Ext.panel.Panel',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }],
            buttonAlign: 'left',
            buttons: [{
                text: 'Edit',
                disabled: true,
                hidden: true,
                scope: this,
                itemId: 'editBtn',
                handler: function(){
                    var url = window.location.href;
                    url = url.replace('dataEntryFormDetails', 'dataEntryForm');
                    window.location = url;
                }
            }]
        });

        this.callParent();

        this.loadData();
    },

    loadData: function(){
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('ehr', 'getDataEntryFormDetails', null, {
                taskId: this.taskId,
                requestId: this.requestId,
                formType: this.formType
            }),
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad, this)
        });
    },

    onLoad: function(results){
        if (results.canRead === false){
            this.removeAll();
            this.add({
                html: 'You do not have permission to read this type of form.',
                border: false
            });
            return;
        }

        var queries = [];
        var queryMap = {};
        Ext4.Array.forEach(results.form.sections, function(section){
            if (section.queries){
                Ext4.Array.forEach(section.queries, function(query){
                    var key = query.schemaName + '.' + query.queryName;
                    if (!queryMap[key]){
                        query.label = section.label;
                        query.serverStoreSort = section.serverStoreSort;
                        queries.push(query);
                        queryMap[key] = true;
                    }
                }, this);
            }
        }, this);

        var filterArray = [];

        if (this.taskId)
            filterArray.push(LABKEY.Filter.create('taskid', this.taskId, LABKEY.Filter.Types.EQUAL));
        if (this.requestId)
            filterArray.push(LABKEY.Filter.create('requestid', this.requestId, LABKEY.Filter.Types.EQUAL));

        LDK.Assert.assertTrue('No filter array applied in DataEntryFormDetailsPanel', filterArray.length > 0);

        var toAdd = [];
        Ext4.Array.forEach(queries, function(q){
            toAdd.push({
                xtype: 'panel',
                title: q.label,
                border: true,
                bodyStyle: 'padding: 5px;',
                defaults: {
                    border: false
                },
                items: [{
                    xtype: 'ldk-querypanel',
                    style: 'margin-bottom: 20px;',
                    queryConfig: {
                        schemaName: q.schemaName,
                        queryName: q.queryName,
                        filters: filterArray,
                        //note: changed to removeableSort so it will take priority over any view-based sorts
                        removeableSort: q.serverStoreSort,
                        scope: this,
                        success: this.onDataRegionLoad
                    }
                }]
            })
        }, this);

        var hasPermission = EHR.DataEntryUtils.hasPermission('Completed', 'update', results.form.permissions, null);
        if (hasPermission){
            var btn = this.down('#editBtn');
            btn.setVisible(true);
            btn.setDisabled(false);
        }

        this.removeAll();
        this.add(toAdd);
    },

    onDataRegionLoad: function(dr){
        var drEl = Ext4.get(dr.domId);
        LDK.Assert.assertNotEmpty('Unable to find dataRegion element in DataEntryFormDetailsPanel', drEl);
        var itemWidth = drEl.getSize().width + 150;
        if (itemWidth > this.getWidth()){
            this.setWidth(itemWidth + 20);
        }
    }
});
