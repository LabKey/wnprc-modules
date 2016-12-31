/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.EnterDataPanel', {
    extend: 'LDK.panel.QueryTabPanel',

    initComponent: function(){
        Ext4.apply(this, {
            items: this.getItems(),
            minHeight: 200
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
            if (form.isAvailable && form.isVisible && form.canInsert){
                formMap[form.category] = formMap[form.category] || [];
                formMap[form.category].push({
                    name: form.label,
                    url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', null, {formType: form.name})
                });
            }
        }, this);

        var sectionNames = Ext4.Object.getKeys(formMap);
        sectionNames = sectionNames.sort();

        var sections = [];
        Ext4.Array.forEach(sectionNames, function(section){
            var items = formMap[section];
            items = LDK.Utils.sortByProperty(items, 'name', false);
            sections.push({
                header: section,
                items: items
            });
        }, this);

        var tab = this.down('#enterNew');
        tab.removeAll();
        tab.add({
            xtype: 'ldk-navpanel',
            sections: sections
        });
    },

    getItems: function(){
        return [
            {
                xtype: 'panel',
                bodyStyle: 'margin: 5px;',
                title: 'Enter New Data',
                itemId: 'enterNew',
                defaults: {
                    border: false
                },
                items: [{
                    html: 'Loading...'
                }]
            },
            {
            xtype: 'ldk-querypanel',
            bodyStyle: 'margin: 5px;',
            title: 'My Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'my_tasks',
                viewName: 'Active Tasks'
            }
        },{
            xtype: 'ldk-querypanel',
            bodyStyle: 'margin: 5px;',
            title: 'All Tasks',
            queryConfig:  {
                schemaName: 'ehr',
                queryName: 'tasks',
                viewName: 'Active Tasks'
            }
        },{
            title: 'Queues',
            bodyStyle: 'margin: 5px;',
            items: [{
                xtype: 'ldk-navpanel',
                sections: [{
                    header: 'Reports',
                    renderer: function (item) {
                        return item;
                    },
                    items: [{
                        xtype: 'ldk-linkbutton',
                        text: 'Service Request Summary',
                        linkCls: 'labkey-text-link',
                        href: LABKEY.ActionURL.buildURL('ldk', 'runNotification', null, {key: 'org.labkey.onprc_ehr.notification.RequestAdminNotification'})
                    }]
                },{
                    header: 'Blood Draw Requests',
                    renderer: function(item){
                        return {
                            layout: 'hbox',
                            bodyStyle: 'padding: 2px;background-color: transparent;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: item.name + ':',
                                width: 200
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Unapproved Requests',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Approved Requests',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Scheduled Today',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Blood Draws', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                            }]
                        }
                    },
                    items: [{
                        name: 'ASB Services',
                        chargeType: 'DCM: ASB Services'
//                    },{
//                        name: 'Clinical Services',
//                        chargeType: 'DCM: Clinical Services'
                    },{
                        name: 'Colony Services',
                        chargeType: 'DCM: Colony Services'
//                    },{
//                        name: 'Surgery Services',
//                        chargeType: 'DCM: Surgery'
                    }]
                },{
                    header: 'Treatment Requests',
                    renderer: function(item){
                        return {
                            layout: 'hbox',
                            bodyStyle: 'padding: 2px;background-color: transparent;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: item.name + ':',
                                width: 200
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Unapproved Requests',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Approved Requests',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Scheduled Today',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'drug', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                            }]
                        }
                    },
                    items: [{
                        name: 'ASB Services',
                        chargeType: 'DCM: ASB Services'
//                    },{
//                        name: 'Clinical Services',
//                        chargeType: 'DCM: Clinical Services'
                    },{
                        name: 'Colony Services',
                        chargeType: 'DCM: Colony Services'
//                    },{
//                        name: 'Surgery Services',
//                        chargeType: 'DCM: Surgery'
                    }]
                },{
                    header: 'Procedure Requests',
                    renderer: function(item){
                        return {
                            layout: 'hbox',
                            bodyStyle: 'padding: 2px;background-color: transparent;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: item.name + ':',
                                width: 200
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Unapproved Requests',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Pending', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Approved Requests',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType})
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Scheduled Today',
                                linkCls: 'labkey-text-link',
                                style: 'padding-left: 5px;',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.viewName': 'Requests', 'query.QCState/Label~eq': 'Request: Approved', 'query.chargetype~eq': item.chargeType, 'query.date~dateeq': (new Date()).format('Y-m-d')})
                            }]
                        }
                    },
                    items: [{
                        name: 'ASB Services',
                        chargeType: 'DCM: ASB Services'
//                    },{
//                        name: 'Clinical Services',
//                        chargeType: 'DCM: Clinical Services'
                    },{
                        name: 'Colony Services',
                        chargeType: 'DCM: Colony Services'
//                    },{
//                        name: 'Surgery Services',
//                        chargeType: 'DCM: Surgery'
                    }]
                },{
                    header: 'Lab Tests',
                    renderer: function(item){
                        return item;
                    },
                    items: [{
                        layout: 'hbox',
                        bodyStyle: 'padding: 2px;background-color: transparent;',
                        defaults: {
                            border: false
                        },
                        items: [{
                            html: 'Clinpath:',
                            width: 200
                        },{
                            xtype: 'ldk-linkbutton',
                            text: 'Requests With Manual Results',
                            linkCls: 'labkey-text-link',
                            href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'Clinpath', 'query.mergeSyncInfo/automaticresults~eq': false})
                        },{
                            xtype: 'ldk-linkbutton',
                            text: 'Requests With Automatic Results',
                            linkCls: 'labkey-text-link',
                            href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.viewName': 'Requests', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'Clinpath', 'query.mergeSyncInfo/automaticresults~eq': true})
                        }]
                    },{
                        layout: 'hbox',
                        bodyStyle: 'padding: 2px;background-color: transparent;',
                        defaults: {
                            border: false
                        },
                        items: [{
                            html: 'SPF Surveillance:',
                            width: 200
                        },{
                            xtype: 'ldk-linkbutton',
                            text: 'All Requests',
                            linkCls: 'labkey-text-link',
                            href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'Clinpath Runs', 'query.QCState/Label~startswith': 'Request:', 'query.servicerequested/chargetype~eq': 'SPF Surveillance Lab'})
                        }]
                    }]
//                },{
//                    header: 'Procedure Requests',
//                    items: [{
//                        name: 'Surgery Services',
//                        url: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'study', 'query.queryName': 'encounters', 'query.QCState/Label~startswith': 'Request:', 'query.type~eq': 'Surgery'})
//                    }]
                },{
                    header: 'Transfer Requests',
                    renderer: function(item){
                        return {
                            layout: 'hbox',
                            bodyStyle: 'padding: 2px;background-color: transparent;',
                            defaults: {
                                border: false
                            },
                            items: [{
                                html: item.name + ':',
                                width: 200
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Unapproved Requests',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Unapproved Requests'}, item.areaFilter))
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Approved Requests',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Approved Requests'}, item.areaFilter))
                            },{
                                xtype: 'ldk-linkbutton',
                                text: 'Transfers Today',
                                linkCls: 'labkey-text-link',
                                href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, Ext4.apply({schemaName: 'onprc_ehr', 'query.queryName': 'housing_transfer_requests', 'query.viewName': 'Approved Requests', 'query.date~dateeq': (new Date()).format('Y-m-d')}, item.areaFilter))
                            }]
                        }
                    },
                    items: [{
                        name: 'Corral',
                        chargeType: 'DCM: Colony Services',
                        areaFilter: {
                            'query.room/area~eq': 'Corral'
                        }
                    },{
                        name: 'PENS/Shelters',
                        chargeType: 'DCM: ASB Services',
                        areaFilter: {
                            'query.room/area~in': 'PENS;Shelters'
                        }
                    },{
                        name: 'All Other',
                        areaFilter: {
                            'query.room/area~notin': 'Corral;PENS;Shelters'
                        }
                    }]
                }]
            }]
        }]
    }
});