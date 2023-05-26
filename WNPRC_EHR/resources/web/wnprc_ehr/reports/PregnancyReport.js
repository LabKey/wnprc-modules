

Ext4.namespace('EHR.reports');
EHR.reports.PregnancyReport = function (panel, tab) {
    const React = require("react");
    const {GridPanelConfig} = require('../../../../src/client/components/GridPanelConfig');
    const configProps = require('../../../../src/client/breeding/configProps');
    const ReactDOM = require("react-dom");

    const target = tab.add({xtype: 'ldk-contentresizingpanel'});

    try {
        // according to the DOM spec, the mutation observer should be GC'd if/when the target node is removed
        const observer = new MutationObserver(target.fireEvent.bind(target, 'contentsizechange'));
        observer.observe(target.getEl().dom, {childList: true, subtree: true});
    }
    catch (e) {
        console.warn("Could not attach mutation observer. Resizing will rely on older APIs, may not work right");
    }
    /*
    const wp = new LABKEY.WebPart({
        partConfig: {subjects: (tab.filters.subjects || []).join(';')},
        partName: 'Breeding',
        renderTo: target.renderTarget,
        style: 'margin-bottom: 20px;'
    });
    wp.render();
     */
    LABKEY.App.registerApp('breedingWebpart', target => {
        ReactDOM.render(
                <GridPanelConfig
                        {...configProps}
                />,
                document.getElementById(target));
    });
    LABKEY.App.loadApp('breedingWebpart', target);
};