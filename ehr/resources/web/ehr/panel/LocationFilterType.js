/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.LocationFilterType', {
    extend: 'LDK.panel.AbstractFilterType',
    alias: 'widget.ehr-locationfiltertype',

    searchOptions: {
        area: true,
        room: true,
        cage: true
    },

    initComponent: function(){
        this.items = this.getItems();

        this.callParent();
    },

    statics: {
        filterName: 'roomCage',
        label: 'Current Location'
    },

    getItems: function(){
        var toAdd = [], searchItems = [];
        var ctx = this.filterContext;

        toAdd.push({
            width: 200,
            html: 'Search By Location:<br><i>(Note: when you select an area, the corresponding rooms will be selected in the room field.)</i>'
        });

        if(this.searchOptions.area) {
            searchItems.push({
                xtype: 'ehr-areafield',
                itemId: 'areaField',
                fieldLabel: 'Area(s)',
                pairedWithRoomField: true,
                getRoomField: function(){
                    return this.up('panel').down('#roomField');
                },
                value: ctx.area ? ctx.area.split(',') :  null
            })
        }

        if(this.searchOptions.room) {
            searchItems.push({
                xtype: 'ehr-roomfield',
                itemId: 'roomField',
                fieldLabel: 'Room',
                value: ctx.room ? ctx.room.split(',') :  null,
                listeners: {
                    change: function(field){
                        var areaField = field.up('panel').down('#areaField');
                        areaField.reset();
                    }
                }
            })
        }

        if(this.searchOptions.cage) {
            searchItems.push({
                xtype: 'ehr-cagefield',
                itemId: 'cageField',
                fieldLabel: 'Cage',
                value: ctx.cage
            })
        }

        toAdd.push({
            xtype: 'panel',
            defaults: {
                border: false,
                width: 200,
                labelWidth: 90,
                labelAlign: 'top'
            },
            keys: [{
                key: Ext4.EventObject.ENTER,
                handler: this.tabbedReportPanel.onSubmit,
                scope: this.tabbedReportPanel
            }],
            items: searchItems
        });

        return toAdd;
    },

    getFilters: function(){
        var obj = {};

        if(this.down('#areaField'))
            obj.area = this.down('#areaField').getValue();
        if(this.down('#roomField'))
            obj.room = this.down('#roomField').getValue();
        if(this.down('#cageField'))
            obj.cage = this.down('#cageField').getValue();

        for (var key in obj){
            if (Ext4.isArray(obj[key]))
                obj[key] = obj[key].join(',')
        }

        return obj;
    },

    getFilterArray: function(tab, subject){
        var filterArray = {
            removable: [],
            nonRemovable: []
        };
        var area, room, cage;

        var areaFieldName = tab.report.areaFieldName;
        var roomFieldName = tab.report.roomFieldName;
        var cageFieldName = tab.report.cageFieldName;

        if (!areaFieldName || !roomFieldName || !cageFieldName){
            Ext4.Msg.alert('Error', 'This report does provide an area, room and cage field');
            return;
        }

        var roomField = this.down('#roomField');
        if(roomField) {
            room = roomField.getValue();
            if (Ext4.isArray(room)) {
                room = room.join(';');
            }
        }

        var cageField = this.down('#cageField');
        if(cageField) {
            cage = cageField.getValue();
        }

        var areaField = this.down('#areaField');
        if(areaField) {
            area = areaField.getValue();
            if (Ext4.isArray(area)) {
                area = area.join(';');
            }
        }

        //rooms always relate to a specific area.  if we're filtering on room, omit the area
        if(area && !room){
            filterArray.nonRemovable.push(LABKEY.Filter.create(areaFieldName, area, LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(room){
            filterArray.nonRemovable.push(LABKEY.Filter.create(roomFieldName, room, LABKEY.Filter.Types.EQUALS_ONE_OF));
        }

        if(cage){
            filterArray.nonRemovable.push(LABKEY.Filter.create(cageFieldName, cage, LABKEY.Filter.Types.EQUAL));
        }

        return filterArray;
    },

    validateReport: function(report){
        var areaFieldName = report.areaFieldName;
        var roomFieldName = report.roomFieldName;
        var cageFieldName = report.cageFieldName;

        if (!areaFieldName || !roomFieldName || !cageFieldName){
            return 'This report cannot be used with the selected filter type, because the report does not contain area, room and/or cage fields';
        }

        return null;
    },

    checkValid: function(){
        if(!this.down('#roomField').getValue() && !this.down('#areaField').getValue()){
            alert('Error: Must Enter A Room or Area');
            return false;
        }

        return true;
    },

    getTitle: function(){
        var title = [];
        var area, room, cage;

        var roomField = this.down('#roomField');
        if(roomField) {
            room = roomField.getValue();
            if (Ext4.isArray(room)) {
                if (room.length < 8)
                    room = 'Room: ' + room.join(', ');
                else
                    room = 'Multiple rooms selected';
            }
        }

        var cageField = this.down('#cageField');
        if(cageField)
            cage = cageField.getValue();

        var areaField = this.down('#areaField');
        if(areaField) {
            area = areaField.getValue();
            area = Ext4.isArray(area) ? area.join(', ') : area;
        }

        //see note in getFilterArray() about area/room
        if (area && !room)
            title.push('Area: ' + area);

        if (room)
            title.push(room);

        if (cage)
            title.push('Cage: ' + cage);

        return title.join(', ');
    }
});