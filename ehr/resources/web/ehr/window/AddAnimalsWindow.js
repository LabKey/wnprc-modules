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
Ext4.define('EHR.window.AddAnimalsWindow', {
    extend: 'Ext.window.Window',

    MAX_ANIMALS: 350,

    initComponent: function(){
        Ext4.apply(this, {
            title: 'Choose Animals',
            modal: true,
            closeAction: 'destroy',
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
                html: 'This helper is designed to quickly add records to the grid below.  You can look up animals in a variety of different ways.  For each animal, one record will be created.  If you check the \'Bulk Edit\' box, you will be prompted to fill out values for the other fields.  If not, one row will be created per animal with blank values.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'radiogroup',
                itemId: 'radio',
                fieldLabel: 'Choose Type',
                columns: 1,
                defaults: {
                    xtype: 'radio',
                    name: 'type'
                },
                items: [{
                    inputValue: 'animal',
                    boxLabel: 'List of Animals',
                    checked: true
                },{
                    inputValue: 'location',
                    boxLabel: 'Location'
                },{
                    inputValue: 'animalGroup',
                    boxLabel: 'Animal Group'
                },{
                    inputValue: 'project',
                    boxLabel: 'Project/Protocol'
                }],
                listeners: {
                    scope: this,
                    change: this.onTypeChange
                }
            },{
                xtype: 'checkbox',
                fieldLabel: 'Bulk Edit Values',
                helpPopup: 'If checked, you will be prompted with a screen that lets you bulk edit the records that will be created.  This is often very useful when adding many similar records.',
                itemId: 'chooseValues'
            },{
                html: '<hr>',
                style: 'padding-top: 5px;padding-bottom: 5px;'
            },{
                xtype: 'form',
                itemId: 'theForm',
                defaults: {
                    width: 400,
                    labelWidth: 140,
                    border: false
                }
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    this.getAnimals();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').hide();
                }
            }]
        });

        this.callParent(arguments);

        this.animalHandler();
    },

    onTypeChange: function(field, val, oldVal){
        if (!val || !val.type)
            return;

        var method = val.type + 'Handler';
        LDK.Assert.assertTrue('Unknown handler in AddAnimalsWindow: ' + method, Ext4.isFunction(this[method]));

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
            if(subjectList.length > 0){
                this.addSubjects(subjectList)
            }
            else {
                Ext4.Msg.alert('Error', 'Must enter at least 1 animal Id');
            }
        }
    },

    addSubjects: function(subjectList){
        if (subjectList.length && this.targetStore){
            subjectList = Ext4.Array.unique(subjectList);
            if (subjectList.length > this.MAX_ANIMALS){
                Ext4.Msg.alert('Error', 'Too many animals were returned: ' + subjectList.length);
                return;
            }

            var records = [];
            Ext4.Array.forEach(subjectList, function(s){
                records.push(this.targetStore.createModel(Ext4.isObject(s) ? s : {Id: s}));
            }, this);

            var choose = this.down('#chooseValues').getValue();
            if (choose){
                Ext4.create('EHR.window.BulkEditWindow', {
                    suppressConfirmMsg: true,
                    records: records,
                    targetStore: this.targetStore,
                    formConfig: this.formConfig
                }).show();
                this.close();
            }
            else {
                this.targetStore.add(records);
            }
        }

        if (Ext4.Msg.isVisible())
            Ext4.Msg.hide();

        this.close();
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

    animalGroupHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            html: 'This will return any animals currently assigned to the selected group.',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'ehr-animalgroupfield',
            emptyText: '',
            itemId: 'groupField'
        }]);

        form.getAnimals = function(){
            var group = this.down('#groupField').getValue();
            if (!group){
                Ext4.Msg.alert('Error', 'Must choose a group');
                return;
            }

            var filterArray = this.getBaseFilterArray().concat([
                LABKEY.Filter.create('groupId', group, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ]);

            this.doQuery({
                schemaName: 'study',
                queryName: 'animal_group_members',
                filterArray: filterArray
            });
        }
    },

    projectHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            html: 'This will return any animals currently assigned to the selected project or protocol.  Choose one or the other.',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'ehr-projectfield',
            emptyText: '',
            itemId: 'projectField',
            width: 400,
            labelWidth: 140,
            onlyIncludeProjectsWithAssignments: true
        },{
            xtype: 'ehr-protocolfield',
            emptyText: '',
            itemId: 'protocolField',
            width: 400,
            labelWidth: 140,
            onlyIncludeProtocolsWithAssignments: true
        }]);

        form.getAnimals = function(){
            var projectId = this.down('#projectField').getValue();
            var protocol = this.down('#protocolField').getValue();
            if (!projectId && !protocol){
                Ext4.Msg.alert('Error', 'Must choose a project or protocol');
                return;
            }

            if (projectId && protocol){
                Ext4.Msg.alert('Error', 'Cannot pick both a project and protocol');
                return;
            }

            var filterArray = this.getBaseFilterArray().concat([LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)]);

            if (projectId)
                filterArray.push(LABKEY.Filter.create('project', projectId, LABKEY.Filter.Types.EQUAL));

            if (protocol)
                filterArray.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL));

            this.doQuery({
                schemaName: 'study',
                queryName: 'assignment',
                filterArray: filterArray
            });
        }
    },

    getAnimals: function(){
        this.down('#theForm').getAnimals.call(this);
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
                var obj = {
                    Id: row.Id
                };

                if (hasLocation){
                    obj['Id/curLocation/location'] = row['Id/curLocation/location'];
                }

                records.push(obj);
            }
        }, this);

        this.addSubjects(records);
    }
});

EHR.DataEntryUtils.registerGridButton('ADDANIMALS', function(config){
    return Ext4.Object.merge({
        text: 'Add Batch',
        tooltip: 'Click to add a batch of animals, either as a list or by location',
        handler: function(btn){
            var grid = btn.up('gridpanel');

            Ext4.create('EHR.window.AddAnimalsWindow', {
                targetStore: grid.store,
                formConfig: grid.formConfig
            }).show();
        }
    }, config);
});