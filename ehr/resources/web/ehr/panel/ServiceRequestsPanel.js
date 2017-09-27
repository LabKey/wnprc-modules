/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.ServiceRequestsPanel', {
    extend: 'Ext.tab.Panel',

    minHeight: 300,

    initComponent: function(){
        Ext4.apply(this, {
            items: this.getItems()
        });

        this.loadData();

        this.callParent();
    },

    loadData: function(){
        EHR.Utils.getDataEntryItems({
            includeFormElements: false,
            scope: this,
            success: this.onLoad
        });
    },

    onLoad: function(results){
        var formMap = {};
        Ext4.each(results.forms, function(form){
            if (form.canInsert && form.category == 'Requests'){
                formMap[form.category] = formMap[form.category] || [];
                formMap[form.category].push({
                    name: form.label,
                    url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: form.name})
                });
            }
        }, this);

        var sections = [];
        for (var i in formMap){
            var items = formMap[i];
            items = LDK.Utils.sortByProperty(items, 'name', false);

            if (items.length){
                sections.push({
                    header: i,
                    items: items
                });
            }
        }

        var tab = this.down('#enterNew');
        tab.removeAll();

        if (sections.length){
            tab.add({
                xtype: 'ldk-navpanel',
                sections: sections
            });
        }
        else {
            tab.add({
                html: 'You do not have permission to submit any types of requests.  Please contact your administrator if you believe this is an error.',
                border: false
            });
        }
    },

    getItems: function(){
        return [{
//            xtype: 'ldk-querypanel',
//            title: 'My Requests',
//            style: 'padding: 5px;',
//            queryConfig:  {
//                schemaName: 'ehr',
//                queryName: 'my_requests'
//            }
//        },{
//            xtype: 'ldk-querypanel',
//            title: 'All Requests',
//            style: 'padding: 5px;',
//            queryConfig:  {
//                schemaName: 'ehr',
//                queryName: 'requests'
//            }
//        },{
            xtype: 'panel',
            style: 'padding: 5px;',
            title: 'New Request',
            itemId: 'enterNew',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        },{
            xtype: 'ldk-querypanel',
            title: 'My Pending Blood Requests',
            style: 'padding: 5px;',
            queryConfig:  {
                schemaName: 'study',
                queryName: 'blood',
                viewName: 'Requests',
                removeableFilters: [
                    LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                ]
            }
        },{
            xtype: 'ldk-querypanel',
            title: 'My Pending Treatment Requests',
            queryConfig:  {
                schemaName: 'study',
                queryName: 'drug',
                viewName: 'Requests',
                removeableFilters: [
                    LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                ]
            }
        },{
            xtype: 'ldk-querypanel',
            title: 'My Pending Labwork Requests',
            queryConfig:  {
                schemaName: 'study',
                queryName: 'Clinpath Runs',
                viewName: 'Requests',
                removeableFilters: [
                    LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                ]
            }
        },{
            xtype: 'ldk-querypanel',
            title: 'My Pending Procedure Requests',
            queryConfig:  {
                schemaName: 'study',
                queryName: 'encounters',
                viewName: 'Requests',
                removeableFilters: [
                    LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                ]
            }
        },{
            xtype: 'ldk-querypanel',
            title: 'My Pending Transfer Requests',
            queryConfig:  {
                schemaName: 'onprc_ehr',
                queryName: 'housing_transfer_requests',
                //viewName: 'Requests',
                removeableFilters: [
                    LABKEY.Filter.create('requestid/createdby/DisplayName', LABKEY.Security.currentUser.displayName, LABKEY.Filter.Types.EQUAL),
                    LABKEY.Filter.create('QCState/Label', 'Request', LABKEY.Filter.Types.STARTS_WITH)
                ]
            }
        }]
    }
});