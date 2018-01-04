declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

export class Breeding {
    private static readonly PLACEHOLDER: string = 'placeholder.view?id=';

    private static navigate(key: string, value: string | null) {
        if (window.history && window.history.pushState) {
            const state = window.history.state || {};
            if (state[key] !== value) {
                state[key] = value;
                const uri = URI(document.location);
                if (value === null) {
                    uri.removeQuery(key);
                } else {
                    uri.setQuery(key, value);
                }
                window.history.pushState(state, document.title, uri.href());
            }
        }
    }

    private gridElementId: string;
    private detailElementId: string;

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

    // noinspection JSUnusedGlobalSymbols: called from HTML
    public render(gridElementId: string, detailElementId: string) {
        window.onpopstate = this.onpopstate.bind(this, window.onpopstate);
        this.detailElementId = detailElementId;
        this.gridElementId = gridElementId;
        this.renderGrid(URI(document.location).query(true) as PregnancyState);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic: called from HTML
    public renderDetail(webpart: WebPartConfig) {
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

    private ondetailclick(id: string | null) {
        Breeding.navigate('id', id);
        this.renderWebpart(id);
    }

    private onpopstate(oldhandler: (PopStateEvent) => void, evt: PopStateEvent) {
        this.renderGrid(evt.state);
        this.renderWebpart(null);
        if (oldhandler) {
            oldhandler(evt);
        }
    }

    private renderGrid(state: PregnancyState) {
        // noinspection JSUnusedGlobalSymbols: 'success' is called when the query finishes
        const x = new LABKEY.QueryWebPart({
            detailsURL: `/breeding/${Breeding.PLACEHOLDER}\${objectid}`,
            queryName: 'PregnancyInfo',
            schemaName: 'study',
            showDetailsColumn: true,
            success: (dr) => {
                Breeding.navigate('viewName', dr.viewName);
                $(`a[href*='${Breeding.PLACEHOLDER}']`).each((i, e) => {
                    const id = /id=([^&]+)&/.exec($(e).attr('href'))[1];
                    $(e).attr('href', 'javascript:void(0)')
                        .click(this.ondetailclick.bind(this, id));
                });
                this.renderWebpart(state.id);
            },
            title: 'Pregnancies',
            viewName: state.viewName || '',
        });
        x.render(this.gridElementId);
    }

    private renderWebpart(id: string | null) {
        const x = new LABKEY.WebPart({
            partConfig: {id},
            partName: 'Pregnancy Detail',
            renderTo: this.detailElementId,
        });
        x.render();
    }
}

// noinspection JSUnusedGlobalSymbols: invoked in the browser
export default new Breeding();

interface PregnancyState {
    id: string | null;
    viewName: string | null;
}

interface WebPartConfig {
    id: string | null;
    wrapperDivId: string;
}
