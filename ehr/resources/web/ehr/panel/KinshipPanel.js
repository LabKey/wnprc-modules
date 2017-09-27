/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg filterArray
 */
Ext4.define('EHR.panel.KinshipPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-kinshippanel',

    initComponent: function(){
        Ext4.apply(this, {
            minHeight: 400,
            border: false,
            style: 'padding: 5px;'
        });

        this.callParent();

        var me = this;

        this.add({
            xtype: 'tabpanel',
            style: 'margin-bottom: 20px',
            items: [{
                xtype: 'panel',
                id: 'rawDataPanel',
                title: 'Raw Data',
                items: [{
                    xtype: 'checkbox',
                    fieldLabel: 'Only Show IDs In My Selection',
                    margin: '10 0 10 10',
                    checked: false,
                    id: 'limitRawDataToSelection',
                    labelWidth: 210,
                    listeners: {
                        change: function(check, value){me.onRawDataCheckChange.call(me, check, value);}
                        },
                    scope: this
                    },
                    this.getQWPConfig()
                ]},
                {
                xtype: 'panel',
                itemId: 'matrixPanel',
                title: 'Matrix',
                style: 'padding: 10px;',
                items: [{
                    xtype: 'panel',
                    border: false,
                    style: 'margin-bottom: 30px;',
                    items: [{
                        xtype: 'checkbox',
                        fieldLabel: 'Only Show IDs In My Selection',
                        checked: true,
                        margin: '0 0 5 0',
                        itemId: 'limitToSelection',
                        labelWidth: 210
                    },{
                        xtype: 'ldk-numberfield',
                        margin: '0 0 5 0',
                        fieldLabel: 'Minimum Coefficient',
                        itemId: 'minCoefficient',
                        labelWidth: 210
                    }],
                    buttonAlign: 'left',
                    buttons: [{
                        text: 'Reload',
                        margin: '10 10 0 0',
                        scope: this,
                        handler: this.refreshMatrix
                        },{
                        text: 'Export',
                        scope: this,
                        handler: this.exportMatrixToCSV
                    }]
                }]
            }]
        });

        this.loadData();
    },

    loadData: function(){
        //Ext4.Msg.wait('Loading...');
        LABKEY.Query.selectRows({
            containerPath: this.containerPath,
            schemaName: 'ehr',
            queryName: 'kinship',
            filterArray: this.filterArray,
            columns: 'id,id2,coefficient',
            requiredVersion: 9.1,
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: this.onDataLoad
        });
    },

    onRawDataCheckChange: function(check, value){

        check.disable();
        if(value == true)
        {
            this.filterArray.push(LABKEY.Filter.create('id2', this.filterArray[0].getValue(), this.filterArray[0].getFilterType()));
        }
        else if(this.filterArray.length > 1)
        {
            this.filterArray = [this.filterArray[0]];
        }

        var panel = Ext4.getCmp('rawDataPanel');
        panel.remove(Ext4.getCmp('rawDataGrid'));
        panel.insert(this.getQWPConfig());
    },

    onDataLoad: function(results){
        if (Ext4.Msg.isVisible()){
            Ext4.Msg.hide();
        }
        var target = this;
        if (!target){
            console.log('target panel not present in callback of kinship report.  This may indicate the layout changed before load');
            return;
        }

        if (!this.rendered){
            console.log('not rendered');
        }

        if (!this.isVisible()){
            console.log('not visible');
        }

        this.results = results;
        this.refreshMatrix();
    },

    exportMatrixToCSV: function(){
        if(Ext4.isDefined(this.export)) {
            var date = new Date().format('Y-m-d_H-i-s');
            LABKEY.Utils.convertToTable({
                fileNamePrefix: "kinship_matrix_" + date,
                rows: this.export,
                delim: 'COMMA'
            });
        }

    },

    refreshMatrix: function(){
        var target = this.down('#matrixPanel');
        var cr = target.down('ldk-contentresizingpanel');
        if (cr){
            target.remove(cr);
        }

        target.add({
            xtype: 'ldk-contentresizingpanel',
            itemId: 'matrixArea',
            overflowX: 'auto',
            listeners: {
                scope: this,
                afterrender: function(panel){
                    Ext4.fly(panel.renderTarget).update(this.getMatrixHtml());
                }
            }
        });
    },

    getMatrixHtml: function(){
        var limitToSelection = this.down('#limitToSelection').getValue();
        var minCoefficient = this.down('#minCoefficient').getValue();

        var idMap = {};
        var primaryIds = [];
        var distinctIds = [];
        Ext4.Array.forEach(this.results.rows, function(r){
            var sr = new LDK.SelectRowsRow(r);
            distinctIds.push(sr.getValue('Id'));
            primaryIds.push(sr.getValue('Id'));

            if (minCoefficient && minCoefficient > sr.getValue('coefficient')){
                return;
            }

            if (!limitToSelection){
                distinctIds.push(sr.getValue('Id2'));
            }

            idMap[sr.getValue('Id')] = idMap[sr.getValue('Id')] || {};
            idMap[sr.getValue('Id')][sr.getValue('Id2')] = sr.getValue('coefficient');

            idMap[sr.getValue('Id2')] = idMap[sr.getValue('Id2')] || {};
            idMap[sr.getValue('Id2')][sr.getValue('Id')] = sr.getValue('coefficient');
        }, this);

        var distinct = Ext4.unique(distinctIds);
        distinct.sort();

        primaryIds = Ext4.unique(primaryIds);
        primaryIds.sort();

        if (distinct.length == 0 && primaryIds.length == 0) {
            return 'No kinship values to show';
        }

        var html = '<table id="matrix-table" border="1" style="border-collapse: collapse;"><tr><td></td>';
        this.export = [];
        this.export.push([' ']);
        Ext4.Array.forEach(distinct, function(id){
            this.export[0].push(id);
            html += '<td>' + id + '</td>';
        }, this);
        html += '</tr>';

        var i = 1, idKin;
        Ext4.Array.forEach(primaryIds, function(id){
            this.export.push([]);
            this.export[i].push(id);
            html += '<tr><td>' + id + '</td>';
            Ext4.Array.forEach(distinct, function(id2){
                idKin = (idMap[id][id2] === undefined ? ' ' : idMap[id][id2])
                this.export[i].push(idKin);
                html += '<td>' + idKin + '</td>';
            }, this);
            html += '</tr>';
            i++;
        }, this);

        html += '</table>';

        return html;
    },

    getQWPConfig: function(){
        return {
            xtype: 'ldk-querypanel',
            style: 'margin: 5px;',
            id: 'rawDataGrid',
            queryConfig: {
                frame: 'none',
                containerPath: this.containerPath,
                schemaName: 'ehr',
                queryName: 'kinship',
                filterArray: this.filterArray,
                failure: function() {Ext4.getCmp('limitRawDataToSelection').enable();LDK.Utils.getErrorCallback()},
                success: function() {Ext4.getCmp('limitRawDataToSelection').enable()}
            }
        }
    }
});