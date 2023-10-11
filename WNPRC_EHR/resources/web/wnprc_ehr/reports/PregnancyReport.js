Ext4.namespace('EHR.reports');
EHR.reports.PregnancyReport = function (panel, tab) {
    const target = tab.add({xtype: 'ldk-contentresizingpanel'});
    let config = {
        schemaName: 'study',
        queryName: 'PregnancyInfo',
        viewName: '',
        columnStyles: JSON.stringify({remark: "remark-column-style"}),
        filterConfig: JSON.stringify({
            subjects: tab.filters.subjects,
            filters: tab.filters,
        }),
    };
    try {
        // according to the DOM spec, the mutation observer should be GC'd if/when the target node is removed
        const observer = new MutationObserver(target.fireEvent.bind(target, 'contentsizechange'));
        observer.observe(target.getEl().dom, {childList: true, subtree: true});
    }
    catch (e) {
        console.warn("Could not attach mutation observer. Resizing will rely on older APIs, may not work right");
    }

    const wp = new LABKEY.WebPart({
        partConfig: config,
        partName: 'Pregnancies Webpart',
        renderTo: target.renderTarget,
        style: 'margin-bottom: 20px;'
    });
    wp.render();
};