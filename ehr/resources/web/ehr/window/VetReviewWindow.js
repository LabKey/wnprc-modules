/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.window.VetReviewWindow', {
    extend: 'Ext.window.Window',

    statics: {
        VET_REVIEW: 'Vet Review',

        buttonHandler: function(dataRegionName){
            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();
            if (!checked || !checked.length){
                alert('No records selected');
                return;
            }

            Ext4.create('EHR.window.VetReviewWindow', {
                dataRegionName: dataRegionName
            }).show();
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Mark Veternarian Review',
            modal: true,
            closeAction: 'destroy',
            width: 400,
            defaults: {
                border: false
            },
            bodyStyle: 'padding: 5px;',
            items: [{
                html: 'This allows you to certify that you have reviewed the selected animals.  This simply creates a note in the record with the date and your name.',
                style: 'padding-bottom: 10px;'
            }],
            buttons: [{
                text: 'Mark Reviewed',
                handler: this.onSubmit,
                scope: this
            },{
                text: 'Cancel',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);
    },

    onSubmit: function(btn){
        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        LDK.Assert.assertNotEmpty('Unable to find DataRegion in VetReviewWindow', dataRegion);

        var checked = dataRegion.getChecked();
        if (!checked.length){
            Ext4.Msg.alert('Error', 'No rows selected');
            return;
        }

        Ext4.Msg.wait('Saving...');
        LDK.Assert.assertNotEmpty('No PKs found for VetReviewWindow', checked.join(''));

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: dataRegion.queryName,
            method: 'POST',
            filterArray: [LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            scope: this,
            columns: 'objectid,Id',
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                var rows = [];
                Ext4.Array.forEach(results.rows, function(row){
                    rows.push({
                        Id: row.Id,
                        caseid: dataRegion.queryName.toLowerCase() == 'cases' ? row.objectid : null
                    });
                }, this);

                this.addReview(rows);
            }
        });
    },

    addReview: function(rows){
        LDK.Assert.assertTrue('No matching rows found in VetReviewPanel', rows.length > 0);
        if (rows.length){
            var date = new Date();
            Ext4.Array.forEach(rows, function(row){
                Ext4.apply(row, {
                    performedby: LABKEY.Security.currentUser.displayName,
                    category: EHR.window.VetReviewWindow.VET_REVIEW,
                    date: date
                });
            }, this);

            LABKEY.Query.insertRows({
                method: 'POST',
                schemaName: 'study',
                queryName: 'clinical_observations',
                rows: rows,
                failure: LDK.Utils.getErrorCallback(),
                success: this.onSuccess,
                scope: this
            });
        }
        else {
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'No matching rows found.  This may indicate a problem.  Please alert your administrator about this issue');
        }
    },

    onSuccess: function(){
        Ext4.Msg.hide();

        var dataRegion = LABKEY.DataRegions[this.dataRegionName];
        dataRegion.refresh();

        this.close();
    }
});