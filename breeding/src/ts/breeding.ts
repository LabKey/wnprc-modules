declare const Ext4: any;
declare const LABKEY: any;

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
    public displayPregnancyDetail(webpart: WebPartConfig) {
        if (webpart.id) {
            // noinspection JSUnresolvedExtXType: defined in resources/web/breeding/extjs/
            Ext4.create('WNPRC.breeding.PregnancyDetailPanel', {
                minHeight: 300,
                renderTo: webpart.wrapperDivId,
                store: {
                    filterArray: [LABKEY.Filter.create('objectid', webpart.id, LABKEY.Filter.Types.EQUAL)],
                    queryName: 'PregnancyInfo',
                    schemaName: 'study',
                    viewName: '_details',
                },
                title: 'Pregnancy Detail',
            });
        } else {
            $(`#${webpart.wrapperDivId}`).empty();
        }
    }

    // noinspection JSUnusedGlobalSymbols: called from HTML
    public importDatasetMetadata(target: HTMLButtonElement) {
        $(target).prop('disabled', true);
        // noinspection JSUnusedGlobalSymbols: called by the request handler
        LABKEY.Ajax.request({
            failure: (error) => {
                LABKEY.Utils.onError(error);
                $(target).prop('disabled', false);
            },
            method: 'POST',
            scope: this,
            success: () => {
                $(target).prop('disabled', false);
            },
            url: LABKEY.ActionURL.buildURL('breeding', 'importDatasetMetadata'),
        });
    }

    // noinspection JSMethodCanBeStatic: called from HTML, we don't want static
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

interface WebPartConfig {
    id: string | null;
    wrapperDivId: string;
}
