Ext4.namespace('EHR.reports');
EHR.reports.UrgentTreatmentsReport = function (panel, tab) {
    const target = tab.add({xtype: 'ldk-contentresizingpanel'});

    const renderUrgent = () => {

        const incompleteConfig = {
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: 'Incomplete Treatments',
            inputController: "ehr",
            inputView: "manageTask",
            inputFormType: "Treatments",
            subjects: tab.filters.subjects,
            date: panel.getFilterArray(tab).removable[0].value,
            filters: JSON.stringify(tab.filters),
        };
        EHR.reports.waterGridCalendar(panel, tab);
        try {
            // according to the DOM spec, the mutation observer should be GC'd if/when the target node is removed
            let observer = new MutationObserver(target.fireEvent.bind(target, 'contentsizechange'));
            observer.observe(target.getEl().dom, {childList: true, subtree: true});

        }
        catch (e) {
            console.warn("Could not attach mutation observer. Resizing will rely on older APIs, may not work right");
        }

        const wp = new LABKEY.WebPart({
            partConfig: incompleteConfig,
            partName: 'Default Grid Webpart',
            renderTo: target.renderTarget,
            style: 'margin-bottom: 20px;'
        });

        wp.render();
        tab.setHeight(1000);
    }

    //Location
    panel.resolveSubjectsFromHousing(tab,renderUrgent,this);
};