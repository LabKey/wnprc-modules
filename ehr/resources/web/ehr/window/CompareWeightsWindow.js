/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataRegionName
 */
Ext4.define('EHR.window.CompareWeightsWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Weights',
            closeAction: 'destroy',
            width: 300,
            modal: true,
            items: [{
                html: 'Loading...',
                border: false
            }],
            buttonAlign: 'center',
            buttons: [{
                text: 'OK',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();
        this.loadData();
    },

    loadData: function(){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'weight',
            columns: 'Id,date,weight',
            filterArray: [
                LABKEY.Filter.create('lsid', dataRegion.getChecked().join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
            ],
            scope: this,
            maxRows: 2,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(data){
        if(!data || !data.rows){
            Ext4.Msg.alert('Error', 'No data found');
            return;
        }

        //while we currently only allow 2 rows this is written to support more
        var items = [{
            html: 'Weight 1'
        },{
            html: 'Weight 2'
        },{
            html: 'Days Between'
        },{
            html: '% Change'
        }];

        var theRow;
        Ext4.Array.forEach(data.rows, function(row, idx){
            items.push({
                html: Ext4.isEmpty(row.weight) ? 'None' : row.weight + ''
            });

            //get the next element
            var index = (idx+1) % data.rows.length;
            var weight2 = data.rows[index].weight;
            items.push({
                html: Ext4.isEmpty(weight2) ? 'None' : weight2 + ''
            });

            var date = row.date ? LDK.ConvertUtils.parseDate(row.date) : null;
            var date2 = data.rows[index].date;
            date2 = date2 ? LDK.ConvertUtils.parseDate(date2) : null;
            var d1 = Ext4.Date.clearTime(date2, true);
            var d2 = Ext4.Date.clearTime(date, true);
            var interval = Ext4.Date.getElapsed(d1, d2);
            interval = interval / (1000 * 60 * 60 * 24);
            interval = Math.floor(interval);

            var pct = Ext4.util.Format.round((((weight2-row.weight) / row.weight) * 100), 2);

            items.push({
                html: interval + ''
            });
            items.push({
                html: isNaN(pct) ? 'N/A' : pct+'%'
            });
        }, this);

        this.removeAll();
        this.add({
            layout: {
                type: 'table',
                columns: 4,
                tdAttrs: {
                    padding: 3
                }
            },
            defaults: {
                border: true,
                style: 'border-color: black;white-space:nowrap;'
            },
            items: items
        });
    }
});