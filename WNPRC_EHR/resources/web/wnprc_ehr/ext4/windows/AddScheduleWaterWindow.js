/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This is the panel that appears when hitting the 'Add Bulk' button on EHR grids.  It provides a popup to find the set of
 * distinct animal IDs based on room, case, etc.
 *
 * @cfg targetStore
 * @cfg formConfig
 */
Ext4.define('wnprc_ehr.window.AddScheduledWaterWindow', {
    extend: 'Ext.window.Window',



    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Choose Animals or Location',
            border: true,
            bodyStyle: 'padding:5px',
            width: 450,
            defaults: {
                width: 400,
                labelWidth: 140,
                border: false,
                bodyBorder: false
            },
            items: [{
                html: 'This helper allows you to pull records from the water schedule into this form.  It will identify any records matching the criteria below that have not already been marked as completed.  NOTE: it will only return records with a scheduled time that is in the past.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'datefield',
                fieldLabel: 'Date',
                value: new Date(),

                //hidden: !EHR.Security.hasPermission('Completed', 'update', {queryName: 'Blood Draws', schemaName: 'study'}),
                maxValue: (new Date()),
                itemId: 'CurDate'
            },{
                xtype: 'ehr-areafield',
                forceSelection: true,
                multiSelect: true,
                typeAhead: true,
                itemId: 'areaField'
            },{
                 xtype: 'ehr-roomfield',
                 forceSelection: true,
                 multiSelect: true,
                 itemId: 'roomField'
            },{
                xtype: 'checkcombo',
                itemId: 'assigned',
                fieldLabel: 'Assigned To',
                displayField: 'title',
                valueField: 'title',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_assigned'
                }
            },{
                xtype: 'checkcombo',
                itemId: 'frequency',
                fieldLabel: 'Frequency',
                displayField: 'altmeaning',
                valueField: 'meaning',
                store: {
                    type: 'labkey-store',
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'altmeaning',
                    sort: 'sort_order',
                    filterArray: [LABKEY.Filter.create('altmeaning', null, LABKEY.Filter.Types.NONBLANK)]
                }
            }, {
                buttons: [{
                    text: 'Submit',
                    scope: this,
                    handler: function (btn) {
                        this.getWaterSchedule();
                        this.hide();
                    }
                }, {
                    text: 'Close',
                    handler: function (btn) {
                        btn.up('window').hide();
                    }
                }]
            }]
        });

        this.callParent(arguments);
    },

    getFilterArray: function(){
        var area = EHR.DataEntryUtils.ensureArray(this.down('#areaField').getValue()) || [];
        var rooms = EHR.DataEntryUtils.ensureArray(this.down('#roomField').getValue()) || [];

        var curDate = this.down('#CurDate').getValue();
        var assignedTo =  EHR.DataEntryUtils.ensureArray(this.down('#assigned').getValue()) || [];
        var frequency = EHR.DataEntryUtils.ensureArray(this.down('#frequency').getValue()) || [];
        var dateOrdered = [];
        if (frequency[0] === 'Daily - AM'){
            frequency.push('Daily - AM/PM');
            dateOrdered.push(curDate.format('Y-m-d')+' 08:00:00');
        } else if(frequency[0] === 'Daily - PM'){
            frequency.push('Daily - AM/PM');
            dateOrdered.push(curDate.format('Y-m-d')+' 14:00:00');
            switch (curDate.getDay()){
                case 0:
                    frequency.push('Sunday - PM');
                    break;
                case 1:
                    frequency.push('Monday - PM');
                    break;
                case 2:
                    frequency.push('Tuesday - PM');
                    break;
                case 3:
                    frequency.push('Wednesday - PM');
                    break;
                case 4:
                    frequency.push('Thursday - PM');
                    break;
                case 5:
                    frequency.push('Friday - PM');
                    break;
                case 6:
                    frequency.push('Saturday - PM');
                    break;                
                default:
                    frequency.push('Daily - AM/PM');
            }
        }

        var filtersArray = [];

        filtersArray.push(LABKEY.Filter.create('date', curDate.format('Y-m-d'), LABKEY.Filter.Types.DATE_EQUAL));
        filtersArray.push(LABKEY.Filter.create('assignedToTitle', assignedTo.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        filtersArray.push(LABKEY.Filter.create('frequencyMeaning', frequency.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));
        if (frequency[0] === 'Daily - AM'){
            filtersArray.push(LABKEY.Filter.create('dateOrdered', dateOrdered[0], LABKEY.Filter.Types.EQUALS_ONE_OF));
        } else if (frequency[0] === 'Daily - PM'){
            filtersArray.push(LABKEY.Filter.create('dateOrdered', dateOrdered[0], LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL));
        }

        filtersArray.push(LABKEY.Filter.create('actionRequired',true, LABKEY.Filter.Types.EQUAL));
        filtersArray.push(LABKEY.Filter.create('qcstate','10', LABKEY.Filter.Types.EQUAL));

        if (area.length==0 && rooms.length==0){
            alert('Must provide at least one room or an area');
            return;
        }
        if (area.length)
            filtersArray.push(LABKEY.Filter.create('area', area.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (rooms.length)
            filtersArray.push(LABKEY.Filter.create('room', rooms.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));


        return filtersArray;

    },
    getWaterSchedule: function (button){
        var filtersArray = this.getFilterArray();
        if (!filtersArray || !filtersArray.length){
            return;
        }

        Ext4.Msg.wait("Loading Scheduled Water...");
        this.hide();

        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'waterScheduleCoalesced',
            parameters: {NumDays: 1, StartDate: new Date()},
            sort: 'date,Id/curlocation/room,Id/curlocation/cage,Id',
            columns: 'lsid,animalid,date,project,assignedTo,frequency,volume,provideFruit,waterSource,objectid,dataSource,dateOrdered',
            filterArray: filtersArray,
            scope: this,
            success: this.loadWater,
            failure: LDK.Utils.getErrorCallback()

        });


    },

    onTypeChange: function(field, val, oldVal){
        if (!val || !val.type)
            return;

        var method = val.type + 'Handler';
        LDK.Assert.assertTrue('Unknown handler in AddWaterWindow: ' + method, Ext4.isFunction(this[method]));

        if (Ext4.isFunction(this[method])){
            this[method]();
        }

    },

    animalHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add({
            html: 'Either type of cut/paste a list of Animal IDs into the box below.  They can be separated by either commas, spaces, or line breaks.',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'textarea',
            height: 100,
            itemId: 'subjArea',
            fieldLabel: 'Id(s)'
        });

        form.getAnimals = function(){
            //we clean up, combine subjects
            var subjectList = LDK.Utils.splitIds(this.down('#subjArea').getValue(), true);
            var curDate = this.down('#CurDate').getValue();
            var assignedTo =  EHR.DataEntryUtils.ensureArray(this.down('#assigned').getValue()) || [];
            var frequency = EHR.DataEntryUtils.ensureArray(this.down('#frequency').getValue()) || [];




            if(subjectList.length > 0){
                this.addSubjects(subjectList, curDate, assignedTo, frequency)
            }
            else {
                Ext4.Msg.alert('Error', 'Must enter at least 1 animal Id');
            }
        }
    },

    loadWater: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No scheduled water schedule were found.');
            return;
        }

       // var targetStore = this.dataEntryPanel.storeCollection.getClientStoreByName('Water Given');
        //LDK.Assert.asserNotEmpty('Unable to find targetStore in AddScheduleWaterWindow', targetStore);

        //LDK.Assert.assertNotEmpty('Unable to find targetStore in AddScheduledTreatmentsWindow', this.targetStore);

        var records = [];
        let waterRecord = new Map();
        let waterObjects = {};
        let matchingDate = '';
        let dataSource = '';
        let containsWaterOrder = new Boolean(false);
        let containsWaterAmount = new Boolean(false);
        //var performedby = this.down('#performedBy').getValue();


        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);
            let animalId = row.getValue('animalid');
            var dateCurrentTime = new Date();
            var modelDate = new Date (row.getValue('date'));
            modelDate.setHours(dateCurrentTime.getHours());
            modelDate.setMinutes(dateCurrentTime.getMinutes());

            let waterObject = {treatmentId: row.getValue('objectid'), volume: row.getValue('volume'), assignedTo: row.getValue('assignedTo'),
                                dataSource: row.getValue('dataSource'), lsid:row.getValue('lsid')};

            let previousVolume = 0;
            let previousTreatmentId = '';
            let previousDataSource = '';



            if (!containsWaterOrder){
                matchingDate = new Date(modelDate);

            }

            if (waterRecord.has(animalId) && waterRecord.get(animalId).raw.model == 'waterRecord'){  
                previousVolume = waterRecord.get(animalId).get('volume');
                previousTreatmentId = ';' + waterRecord.get(animalId).get('treatmentId');
                previousDataSource = ';' + waterRecord.get(animalId).get('dataSource');
                //waterObjects.push({treatmentId:waterRecord.get(animalId).get('treatmentId'), volume: waterRecord.get(animalId).get('volume')});
                //waterObjects[animalId].push(waterObject);
            }

            if (!waterObjects[animalId]){
                waterObjects[animalId] = [];
            }

            if (row.getValue('dataSource') == 'waterOrders' ){

                /*if ( dataSource != 'atLeastAWaterAmount'){
                    dataSource = row.getValue('dataSource');
                }*/
                //for water Orders I need to keep the date ordered from the waterschedule to change qc state
                matchingDate = row.getValue('dateOrdered');
                containsWaterOrder = true;
            }

            waterObjects[animalId].push(waterObject);

            var tempModel = this.targetStore.createModel({
                Id:                 row.getValue('animalid'),
                date:               modelDate,
                volume:             row.getValue('volume') + previousVolume,
                project:            row.getValue('project'),
                assignedto:         row.getValue('assignedTo'),
                waterSource:        row.getValue('waterSource'),
                treatmentId:        row.getValue('objectid') + previousTreatmentId,
                dataSource:         row.getValue('dataSource') + previousDataSource,
                dateOrdered:        matchingDate,
                model:              'waterRecord',
                waterObjects:       waterObjects[animalId]


            });

            tempModel.phantom = false;
            waterRecord.set(animalId,tempModel);

            if ( row.getValue('provideFruit') != 'none' && row.getValue('provideFruit') != null){
                var fruitModel = this.targetStore.createModel({
                    Id:                 row.getValue('animalid'),
                    date:               modelDate,
                    provideFruit:       row.getValue('provideFruit'),
                    project:            row.getValue('project'),
                    assignedto:         row.getValue('assignedTo'),
                    waterSource:        row.getValue('waterSource'),
                    treatmentId:        row.getValue('objectid'),
                    dataSource:         row.getValue('dataSource'),
                    dateOrdered:        row.getValue('dateOrdered'),
                    model:              'fruitRecord'

                });
                fruitModel.phantom = false;
                waterRecord.set(animalId+'fruit',fruitModel);

            }



        }, this);

        waterRecord.forEach(function (value,key) {
            records.push(value);
        })

        this.targetStore.add(records);
        Ext4.Msg.hide();
    },

    locationHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            html: 'This will return any animals currently housed in the selected location.  You can leave any of the fields blank.',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'ehr-areafield',
            multiSelect: false,
            emptyText: '',
            fieldLabel: 'Area',
            itemId: 'areaField',
            pairedWithRoomField: true,
            getRoomField: function(){
                return this.up('form').down('#roomField')
            }
        },{
            xtype: 'ehr-roomfield',
            multiSelect: true,
            emptyText: '',
            showOccupiedOnly: true,
            fieldLabel: 'Room(s)',
            itemId: 'roomField',
            listeners: {
                change: function(field){
                    var areaField = field.up('panel').down('#areaField');
                    areaField.reset();
                }
            }
        },{
            xtype: 'ehr-cagefield',
            itemId: 'cageField',
            fieldLabel: 'Cage(s)'
        }]);

        form.getAnimals = function(){
            var room = this.down('#roomField').getValue();
            room = !room || Ext4.isArray(room) ? room : [room];

            var cage = this.down('#cageField').getValue();
            if (cage){
                cage = cage.split(',');
                var cages = [];
                Ext4.Array.forEach(cage, function(c){
                    cages.push(Ext4.String.trim(c));
                }, this);
                cage = cages.join(';');
            }

            var filterArray = this.getBaseFilterArray().concat([LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)]);

            if (!Ext4.isEmpty(room))
                filterArray.push(LABKEY.Filter.create('room', room.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

            if (!Ext4.isEmpty(cage))
                filterArray.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUALS_ONE_OF));

            if (filterArray.length == 1){
                Ext4.Msg.alert('Error', 'Must choose a location');
                return;
            }

            this.doQuery({
                schemaName: 'study',
                queryName: 'housing',
                sort: 'room,cage,Id',
                filterArray: filterArray
            });
        }
    },

    /**
     * Can be overridden by subclasses, for example to return only females
     */
    getBaseFilterArray: function(){
        return [];
    },



    getAnimals: function(){
        let animalIds = this.down('#theForm').getAnimals.call(this);



    },


    doQuery: function(config){
        this.hide();
        Ext4.Msg.wait("Loading...");

        //find distinct animals matching criteria
        LABKEY.Query.selectRows(Ext4.applyIf(config, {
            sort: 'Id',
            columns: 'Id,Id/curLocation/location',
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        }));
    },

    onSuccess: function(results){
        if (!results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No matching animals were found.');
            return;
        }

        var records = [];
        var hasLocation = this.targetStore.getFields().get('Id/curLocation/location');
        Ext4.Array.forEach(results.rows, function(row){
            if(row.Id){
                var startDate = this.down('#StartDate').getValue();
                var endDate = this.down('#EndDate').getValue();
                var numberOfDays = moment.subtract(endDate,startDate).days();

                var obj = {
                    Id: row.Id
                };

                if (hasLocation){
                    obj['Id/curLocation/location'] = row['Id/curLocation/location'];
                }

                //for ()

                records.push(obj);
            }
        }, this);

        this.addSubjects(records);
    }
});

EHR.DataEntryUtils.registerGridButton('ADDSCHEDULEDWATERS', function(config){
    return Ext4.Object.merge({
        text: 'Add Scheduled Waters',
        tooltip: 'Click to add animals by location',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('wnprc_ehr.window.AddScheduledWaterWindow', {
                dataEntryPanel: grid,
                targetStore: grid.store,
                formConfig: grid.formConfig
            }).show();
        }
    }, config);
});