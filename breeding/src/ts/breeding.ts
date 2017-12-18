declare const LABKEY: any;
declare const Ext4: any;
import * as $ from 'jquery';

export class Breeding {
    private PLACEHOLDER: string = 'placeholder.view?id=';

    // noinspection JSUnusedGlobalSymbols: called from HTML
    public displayPregnancyGrid(gridElementId: string, detailElementId: string) {
        // noinspection JSUnusedGlobalSymbols: 'success' is called when the query finishes
        const x = new LABKEY.QueryWebPart({
            detailsURL: `/breeding/${this.PLACEHOLDER}\${objectid}`,
            queryName: 'PregnancyInfo',
            schemaName: 'study',
            showDetailsColumn: true,
            success: () => {
                $(`a[href*='${this.PLACEHOLDER}']`).each((i, e) => {
                    const id = /id=([^&]+)&/.exec($(e).attr('href'))[1];
                    $(e).attr('href', 'javascript:void(0)')
                        .click(this.ondetailclick.bind(this, id, detailElementId));
                });
            },
            title: 'Pregnancies',
        });
        x.render(gridElementId);
        this.ondetailclick(null, detailElementId);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic: called from HTML
    public displayPregnancyDetail(webpart: { id: string | null, wrapperDivId: string }) {
        if (webpart.id) {
            // ldk-detailspanel defined in labkey/externalModules/labModules/LDK/resources/web/LDK/panel/DetailsPanel.js
            // noinspection JSUnresolvedExtXType
            Ext4.create('Ext.panel.Panel', {
                bodyStyle: 'background: transparent',
                border: false,
                frame: false,
                items: [
                    {
                        flex: 1,
                        margin: '0 10 0 0',
                        showBackBtn: false,
                        store: {
                            filterArray: [LABKEY.Filter.create('objectid', webpart.id, LABKEY.Filter.Types.EQUAL)],
                            queryName: 'PregnancyInfo',
                            schemaName: 'study',
                            viewName: '_details',
                        },
                        title: 'Pregnancy Detail',
                        xtype: 'ldk-detailspanel',
                    },
                    {
                        border: false,
                        flex: 3,
                        frame: false,
                        xtype: 'panel',
                    },
                ],
                layout: {
                    align: 'stretch',
                    type: 'hbox',
                },
                renderTo: webpart.wrapperDivId,
            });
        } else {
            $(`#${webpart.wrapperDivId}`).empty();
        }
    }

    // noinspection JSUnusedGlobalSymbols: called from HTML
    public importDatasetMetadata(target: HTMLButtonElement) {
        $(target).prop('disabled', true);
        LABKEY.Ajax.request({
            failure: () => {
                alert('E_FAIL');
                $(target).prop('disabled', false);
            },
            method: 'POST',
            scope: this,
            success: () => {
                alert('S_OK');
                $(target).prop('disabled', false);
            },
            url: LABKEY.ActionURL.buildURL('breeding', 'importDatasetMetadata'),
        });
    }

    // noinspection JSMethodCanBeStatic
    private ondetailclick(id: string | null, detailElementId: string) {
        const x = new LABKEY.WebPart({
            partConfig: {id},
            partName: 'Pregnancy Detail',
            renderTo: detailElementId,
        });
        x.render();
    }
}

// noinspection JSUnusedGlobalSymbols: invoked in the browser
export default new Breeding();
