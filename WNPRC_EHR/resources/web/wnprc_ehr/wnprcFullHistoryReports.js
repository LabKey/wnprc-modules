Ext4.namespace('EHR.reports');

EHR.reports.wnprcFullHistory = function (panel, tab) {
    var filterArray = panel.getFilterArray(tab);
    var title = panel.getTitleSuffix();
    var animalIds= tab.filters.subjects;

    var target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
    tab.doLayout();
    var reportEndDate = new Date();
    reportEndDate = reportEndDate.format(LABKEY.extDefaultDateFormat)

    var config = panel.getQWPConfig({
        title: 'Full History - '+animalIds,
        schemaName: 'study',
        queryName: 'wnprcFullHistory',
        parameters: {'STARTTARGET': '1947-02-10', 'ENDTARGETDATE': reportEndDate},
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
