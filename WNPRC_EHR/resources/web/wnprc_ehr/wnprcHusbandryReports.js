Ext4.namespace('EHR.reports');

EHR.reports.waterGridCalendar = function (panel, tab) {
    //LABKEY.Filter.create('pregnancyid', this._pregnancyId, LABKEY.Filter.Types.CONTAINS)
    var filterArray = panel.getFilterArray(tab);
    //filterArray.add()
    //debugger;
    var title = panel.getTitleSuffix();

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var reportStartDate = new Date();
    reportStartDate.setDate(reportStartDate.getDate()-40);
    reportStartDate = reportStartDate.format(LABKEY.extDefaultDateFormat)

    var config = panel.getQWPConfig({
        title: 'Water Grid Calendar',
        schemaName: 'study',
        queryName: 'WaterScheduleCoalesced',
        parameters: {'NumDays': '180', 'StartDate': reportStartDate},
        filters: filterArray.nonRemovable,
        frame: true

    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config

    });
    
};
