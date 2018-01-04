declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

export class Breeding {
    /**
     * Placeholder value for the details link. Replaced by a JavaScript click handler
     * @type {string}
     */
    private static readonly DETAIL_PLACEHOLDER: string = '__DETAIL__.view?id=';

    /**
     * Sets the browser state and updates the URL in order to enable linking and using the back/forward buttons
     * @param {string} key
     * @param {string | null} value
     */
    private static updateBrowserState(key: keyof PregnancyState, value: string | null) {
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

    /**
     * HTML id attribute for the element in which to render the grid
     */
    private gridElementId: string;

    /**
     * HTML id attribute for the element in which to render the details
     */
    private detailElementId: string;

    // noinspection JSUnusedGlobalSymbols: called from HTML
    /**
     * Initiates the dataset metadata import by invoking the importDatasetMetadata method in the BreedingController
     * @param {HTMLButtonElement} target
     */
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
    /**
     * Entry point for the main polyfill. Renders the pregnancy grid (and possibly the details) and hooks up the browser
     * history management using the popstate event
     * @param {string} gridElementId
     * @param {string} detailElementId
     */
    public render(gridElementId: string, detailElementId: string) {
        window.onpopstate = this.onPopState.bind(this, window.onpopstate);
        this.detailElementId = detailElementId;
        this.gridElementId = gridElementId;
        this.renderGrid(URI(document.location).query(true) as PregnancyState);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic: called from HTML
    /**
     * Entry point for the LabKey webpart. Renders the detail webpart, including the details panel and the child
     * record grids
     * @param {WebPartConfig} webpart
     */
    public renderDetail(webpart: WebPartConfig) {
        if (webpart.breedingId) {
            // noinspection JSUnresolvedExtXType: defined in resources/web/breeding/extjs/
            Ext4.create('WNPRC.breeding.PregnancyDetailPanel', {
                minHeight: 300,
                renderTo: webpart.wrapperDivId,
                store: {
                    filterArray: [LABKEY.Filter.create('objectid', webpart.breedingId, LABKEY.Filter.Types.EQUAL)],
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

    /**
     * Handler for clicking the detail links in the pregnancy grid
     * @param {string | null} breedingId
     */
    private onDetailClick(breedingId: string | null) {
        Breeding.updateBrowserState('breedingId', breedingId);
        this.renderWebpart(breedingId);
    }

    /**
     * Handler for the popstate event that gets fired by the back/forward buttons
     * @param {(PopStateEvent) => void} oldHandler
     * @param {PopStateEvent} evt
     */
    private onPopState(oldHandler: (PopStateEvent) => void, evt: PopStateEvent) {
        this.renderGrid(evt.state);
        this.renderWebpart(null);
        if (oldHandler) {
            oldHandler(evt);
        }
    }

    /**
     * Renders the pregnancy grid view based on the passed state (viewName/breedingId)
     * @param {PregnancyState} state
     */
    private renderGrid(state: PregnancyState) {
        // noinspection JSUnusedGlobalSymbols: 'success' is called when the query finishes
        const x = new LABKEY.QueryWebPart({
            detailsURL: `/breeding/${Breeding.DETAIL_PLACEHOLDER}\${objectid}`,
            queryName: 'PregnancyInfo',
            schemaName: 'study',
            showDetailsColumn: true,
            success: (dr) => {
                Breeding.updateBrowserState('viewName', dr.viewName);
                $(`a[href*='${Breeding.DETAIL_PLACEHOLDER}']`).each((i, e) => {
                    const id = (URI($(e).attr('href')).query(true) as any).id;
                    $(e).attr('href', 'javascript:void(0)')
                        .click(this.onDetailClick.bind(this, id));
                });
                this.renderWebpart(state.breedingId);
            },
            title: 'Pregnancies',
            viewName: state.viewName || '',
        });
        x.render(this.gridElementId);
    }

    /**
     * Renders the detail webpart for the passed breeding encounter id (or clears it)
     * @param {string | null} breedingId
     */
    private renderWebpart(breedingId: string | null) {
        const x = new LABKEY.WebPart({
            partConfig: { breedingId },
            partName: 'Pregnancy Detail',
            renderTo: this.detailElementId,
        });
        x.render();
    }
}

// noinspection JSUnusedGlobalSymbols: invoked in the browser
export default new Breeding();

/**
 * Browser state/get query parameters for loading the pregnancy grid/detail
 */
interface PregnancyState {
    breedingId: string | null;
    viewName: string | null;
}

/**
 * Configuration object passed from the webpart config for the pregnancy detail webpart
 */
interface WebPartConfig {
    breedingId: string | null;
    wrapperDivId: string;
}
