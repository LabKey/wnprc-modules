
Ext4.namespace('EHR.reports');
EHR.reports.UrgentTreatmentsReport = function (panel, tab) {
    const target = tab.add({xtype: 'ldk-contentresizingpanel'});
    const renderUrgent = () => {
        const config = {
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: 'Incomplete Treatments',
            input: JSON.stringify({
                controller:  "ehr",
                view: "manageTask",
                formType: "Treatments",
            }),
            cellStyles: JSON.stringify([{
                cellColumns: ["meaning", "TimeOfDay", "frequency", "remark"],
                flagData: {
                    type: "dataset",
                    flagColumn: "meaning",
                    data: [],
                    color: "rgb(250,119,102)",
                    schemaName: "lists",
                    queryName: "Time sensitive treatments"
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
        EHR.reports.waterGridCalendar(panel, tab);
    }

    //Location
    panel.resolveSubjectsFromHousing(tab,renderUrgent,this);
};