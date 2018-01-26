/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * User: dnicolalde
 * Date: 2/15/13
 * Time: 2:03 PM
 */
EHR.Metadata.registerMetadata('Inroom', {
    allQueries: {
        'feces':{
            hidden: true

        }
        ,taskid: {
            parentConfig: {
                storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                ,dataIndex: 'taskid'
            }
            ,hidden: true
        }

    },
    byQuery:{
        'Irregular Observations': {
            begindate: {
                hidden: false
            }
            ,performedby: {
                allowBlank: false,
                hidden: false
            }
            ,inRoom: {
                hidden: false,
                allowBlank: false,
                xtype: 'ehr-remoteradiogroup',
                defaultValue: null,
                value: null,
                includeNullRecord: false,
                formEditorConfig: {columns: 2},
                lookup: {schemaName: 'ehr_lookups', queryName: 'yes_no', displayColumn: 'value', keyColumn: 'value'}
            }
            ,menses:{
                hidden: true,
                shownInGrid: false
            }

            ,feces:{
                hidden: true,
                shownInGrid: false
            }
            ,other:{
                hidden: true,
                shownInGrid: false
             }
            ,tlocation:{
                hidden: true,
                shownInGrid: false
            }
            ,behavior:{
                hidden: true,
                shownInGrid: false
            }
            ,otherbehavior:{
                hidden: true,
                shownInGrid: false
            }
            ,breeding:{
                hidden: true,
                shownInGrid: false
            }
            ,'id/curlocation/cond': {
                hidden: true,
                shownInGrid:true
            }
        }
    }
});

/*
EHR.Metadata.topCols = 'id,date,enddate,project,account';
EHR.Metadata.bottomCols = 'remark,performedBy,qcstate,'+EHR.Metadata.hiddenCols;

EHR.Metadata.Columns = {
    'Irregular Observations': 'id/curlocation/location,'+EHR.Metadata.topCols + ',inRoom,feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'+EHR.Metadata.bottomCols,
    'In Rooms': 'id/curlocation/location,'+EHR.Metadata.topCols + ',inRoom,'+EHR.Metadata.bottomCols
}*/
