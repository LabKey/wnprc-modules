Ext4.namespace('EHR.reports');
EHR.reports.EveningTreatmentsReport = function (panel, tab) {

    const renderUrgent = () => {
        const target = tab.add({xtype: 'ldk-contentresizingpanel'});

        const config = {
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: 'Night Treatments',
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