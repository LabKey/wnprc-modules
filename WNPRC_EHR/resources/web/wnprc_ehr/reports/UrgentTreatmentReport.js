Ext4.namespace('EHR.reports');
EHR.reports.UrgentTreatmentsReport = function (panel, tab) {
    const targetIncomplete = tab.add({xtype: 'ldk-contentresizingpanel'});
    const filterDate = panel.getFilterArray(tab).removable[0].value;
    console.log(panel.getFilterArray(tab));
    console.log(filterDate);

    const renderUrgent = (tab) => {
        const incompleteConfig = {
            schemaName: 'study',
            queryName: 'treatmentSchedule',
            viewName: 'Incomplete Treatments',
            inputController: "ehr",
            inputView: "manageTask",
            inputFormType: "Treatments",
            subjects: tab.filters.subjects.toString()
        };
        EHR.reports.waterGridCalendar(panel, tab);
        try {
            // according to the DOM spec, the mutation observer should be GC'd if/when the target node is removed
            let observer = new MutationObserver(targetIncomplete.fireEvent.bind(target, 'contentsizechange'));
            observer.observe(targetIncomplete.getEl().dom, {childList: true, subtree: true});

        }
        catch (e) {
            console.warn("Could not attach mutation observer. Resizing will rely on older APIs, may not work right");
        }

        const wpIncomplete = new LABKEY.WebPart({
            partConfig: incompleteConfig,
            partName: 'Default Grid Webpart',
            renderTo: targetIncomplete.renderTarget,
            style: 'margin-bottom: 20px;'
        });

        wpIncomplete.render();

    }

    //Location
    if (panel.getFilterArray(tab).nonRemovable.length !== 0){
        panel.resolveSubjectsFromHousing(tab,renderUrgent,this);
    }
    console.log(panel.getFilterArray(tab));





};