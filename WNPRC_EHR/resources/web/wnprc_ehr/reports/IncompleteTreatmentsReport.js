Ext4.namespace('EHR.reports');
EHR.reports.IncompleteTreatmentsReport = function (panel, tab) {

    const renderUrgent = () => {
        let filterArray = panel.getFilterArray(tab);
        let title = panel.getTitleSuffix();

        let target = tab.add({tag: 'span', style: 'padding-bottom: 20px'});
        tab.doLayout();
        let reportStartDate = new Date();
        reportStartDate.setDate(reportStartDate.getDate()-40);
        reportStartDate = reportStartDate.format(LABKEY.extDefaultDateFormat)

        let config = panel.getQWPConfig({
            title: 'Incomplete Water Treatments',
            schemaName: 'study',
            queryName: 'WaterScheduleCoalesced',
            viewName: 'Treatments',
            parameters: {'NumDays': '180', 'StartDate': reportStartDate},
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            frame: true

        });
        let configWaterTotal = panel.getQWPConfig({
            title: 'Water Below Limit (10ml/Kg)',
            schemaName: 'study',
            queryName: 'waterTotalByDateWithWeight',
            viewName: 'tooLittleWater',
            //parameters: {'NumDays': '180', 'StartDate': reportStartDate},
            filters: filterArray.nonRemovable,
            removeableFilters: filterArray.removable,
            frame: true

        });

        tab.add({
            xtype: 'ldk-querypanel',
            style: 'margin-bottom:20px;',
            queryConfig: config

        });
        tab.add({
            xtype: 'ldk-querypanel',
            style: 'margin-bottom:20px;',
            queryConfig: configWaterTotal
        })

        target = tab.add({xtype: 'ldk-contentresizingpanel'});

        config = {
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: 'Incomplete Treatments',
            columnStyles: JSON.stringify({remark: "remark-column-style"}),
            cellStyles: JSON.stringify([{
                cellColumns: ["meaning", "TimeOfDay", "frequency", "remark"],
                flagData: {
                    type: "dataset",
                    flagColumn: "meaning",
                    data: [],
                    color: "rgb(250,119,102)",
                    schemaName: "wnprc",
                    queryName: "urgent_treatments"
                }
            }]),
            filterConfig: JSON.stringify({
                subjects: tab.filters.subjects,
                date: panel.getFilterArray(tab).removable[0].value,
                filters: tab.filters,
            }),
        };
        try {
            // according to the DOM spec, the mutation observer should be GC'd if/when the target node is removed
            let observer = new MutationObserver(target.fireEvent.bind(target, 'contentsizechange'));
            observer.observe(target.getEl().dom, {childList: true, subtree: true});

        }
        catch (e) {
            console.warn("Could not attach mutation observer. Resizing will rely on older APIs, may not work right");
        }

        const wp = new LABKEY.WebPart({
            partConfig: config,
            partName: 'Default Grid Webpart',
            renderTo: target.renderTarget,
            style: 'margin-bottom: 20px;'
        });

        wp.render();
    }

    //Location
    panel.resolveSubjectsFromHousing(tab,renderUrgent,this);
};