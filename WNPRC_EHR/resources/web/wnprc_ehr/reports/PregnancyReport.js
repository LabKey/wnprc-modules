Ext4.namespace('EHR.reports');
EHR.reports.PregnancyReport = function(panel, tab) {
    const target = tab.add({xtype: 'ldk-contentresizingpanel'});

    const observer = new MutationObserver(target.fireEvent.bind(target, 'contentsizechange'));
    observer.observe(target.getEl().dom, {childList: true, subtree: true});

    const wp = new LABKEY.WebPart({
        partConfig: {subjects: (tab.filters.subjects||[]).join(';')},
        partName: 'Breeding',
        renderTo: target.renderTarget,
        style: 'margin-bottom: 20px;'
    });
    wp.render();
};