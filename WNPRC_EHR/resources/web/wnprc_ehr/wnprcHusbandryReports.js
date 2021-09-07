Ext4.namespace('EHR.reports');

EHR.reports.waterGridCalendar = function (panel, tab) {
    var filterArray = panel.getFilterArray(tab);
    //debugger;
    var title = panel.getTitleSuffix();

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var curDate = new Date();
    curDate = curDate.format(LABKEY.extDefaultDateFormat)

    var config = panel.getQWPConfig({
        title: 'Water Grid Calendar',
        schemaName: 'study',
        queryName: 'WaterScheduleCoalesced',
        parameters: {'NumDays': '180', 'StartDate': curDate},
        filters: filterArray.nonRemovable,
        frame: true

    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config

    });
    
};
