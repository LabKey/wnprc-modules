/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.reports');

EHR.reports.waterGridCalendar = function (panel, tab) {
    var filterArray = panel.getFilterArray(tab);
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
        removeableFilters: filterArray.removable,
        frame: true

    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config,
        height: 3000

    });
    
};

EHR.reports.totalWaterByDay = function (panel, tab) {
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var reportStartDate = new Date("1947-02-10");
    reportStartDate = reportStartDate.format(LABKEY.extDefaultDateFormat);
    var reportEndDate = new Date();
    reportEndDate = reportEndDate.format(LABKEY.extDefaultDateFormat);

    var config = panel.getQWPConfig({
        title: 'Total Water By Date',
        schemaName: 'study',
        queryName: 'waterTotalByDateWithWeight',
        parameters: {'STARTTARGET': reportStartDate, 'ENDTARGETDATE': reportEndDate},
        filters: filterArray.nonRemovable,
        removeableFilters: filterArray.removable,
        frame: true

    });

    tab.add({
        xtype: 'ldk-querypanel',
        style: 'margin-bottom:20px;',
        queryConfig: config

    });

};
