declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

export class Breeding {

    // <editor-fold desc="--Static Members--">

    /**
     * Configuration for all the child records to display in the parent-child detail panel
     * @type ChildRecordConfiguration[]
     */
    private static readonly CHILD_RECORDS: ChildRecordConfiguration[] = [{
        parametersFactory: Breeding.createQueryParams,
        queryName: '_PregnancyInfoByParentRecordId',
        schemaName: 'study',
        title: 'Pregnancy History',
    }, {
        filterArrayFactory: Breeding.createQueryFilters,
        queryName: 'ultrasounds',
        schemaName: 'study',
        title: 'Ultrasounds',
    }, {
        filterArrayFactory: Breeding.createQueryFilters,
        queryName: 'breeding_remarks',
        schemaName: 'study',
        title: 'Breeding Remarks',
    }];

    /**
     * Placeholder value for the details link. Replaced by a JavaScript click handler
     * @type {string}
     */
    private static readonly DETAIL_PLACEHOLDER: string = '__DETAIL__.view?id=';

    // </editor-fold>

    // <editor-fold desc="--Static Functions--">

    /**
     * Invokes a simple (success/failure, no return value) API method from the breeding controller. Disables/reenables
     * the button clicked in the UI
     * @param {HTMLButtonElement} target
     * @param action
     */
    private static callSimpleApiButtonAction(target: HTMLButtonElement, action: string) {
        $(target).prop('disabled', true);
        LABKEY.Ajax.request({
            failure: (error) => {
                LABKEY.Utils.onError(error);
                $(target).prop('disabled', false);
            },
            method: 'POST',
            success: () => {
                $(target).prop('disabled', false);
            },
            url: LABKEY.ActionURL.buildURL('breeding', action),
        });
    }

    /**
     * Factory method to create filter arrays for use in the LabKey.QueryWebPart of each child record
     * @param {DataSetRecord} record
     * @returns {any[]}
     */
    private static createQueryFilters(record: DataSetRecord) {
        return [LABKEY.Filter.create('parentid', record.get('objectid'), LABKEY.Filter.Types.EQUAL)];
    }

    /**
     * Factory method to set the query parameters for each parameterized query in each child LabKey.QueryWebPart
     * @param {DataSetRecord} record
     * @returns {{PARENT_RECORD_ID: any}}
     */
    private static createQueryParams(record: DataSetRecord) {
        return {PARENT_RECORD_ID: record.get('objectid')};
    }

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

    // </editor-fold>

    // <editor-fold desc="--Members--">

    /**
     * HTML id attribute for the element in which to render the grid
     */
    private gridElementId: string;

    /**
     * HTML id attribute for the element in which to render the details
     */
    private detailElementId: string;

    // </editor-fold>

    // <editor-fold desc="--Public Functions (called from HTML)--">

    // noinspection JSUnusedGlobalSymbols: called from HTML
    /**
     * Initiates the dataset data import by invoking the importDatasetData method in the BreedingController
     * @param {HTMLButtonElement} target
     */
    public importDatasetData(target: HTMLButtonElement) {
        Breeding.callSimpleApiButtonAction(target, 'importDatasetData');
    }

    // noinspection JSUnusedGlobalSymbols: called from HTML
    /**
     * Initiates the dataset metadata import by invoking the importDatasetMetadata method in the BreedingController
     * @param {HTMLButtonElement} target
     */
    public importDatasetMetadata(target: HTMLButtonElement) {
        Breeding.callSimpleApiButtonAction(target, 'importDatasetMetadata');
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
            Ext4.create('WNPRC.ext4.ParentChildDetailPanel', {
                childRecords: Breeding.CHILD_RECORDS,
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

    // </editor-fold>

    // <editor-fold desc="--Private Functions--">

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
            buttonBar: {
                items: [
                    LABKEY.QueryWebPart.standardButtons.views,
                    LABKEY.QueryWebPart.standardButtons.exportRows,
                    LABKEY.QueryWebPart.standardButtons.print,
                    LABKEY.QueryWebPart.standardButtons.pageSize,
                ],
            },
            detailsURL: `/breeding/${Breeding.DETAIL_PLACEHOLDER}\${objectid}`,
            failure: LABKEY.Utils.onError,
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

    // </editor-fold>
}

// noinspection JSUnusedGlobalSymbols: invoked in the browser
export default new Breeding();

// <editor-fold desc="--Helper Interface Definitions--">

/**
 * Child record configuration to pass to the child records panel
 */
interface ChildRecordConfiguration {
    filterArrayFactory?: (record: DataSetRecord) => any[];
    parametersFactory?: (record: DataSetRecord) => any;
    queryName: string;
    schemaName: string;
    title?: string;
    viewName?: string;
}

/**
 * Single record returned from a data store
 */
interface DataSetRecord {
    get: (key: string) => any;
}

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

// </editor-fold>
