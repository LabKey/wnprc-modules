declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

export class Breeding
{
    // <editor-fold desc="--Static Members--">

    /**
     * Placeholder value for the details link. Replaced by a JavaScript click handler
     * @type {string}
     */
    private static readonly DETAIL_PLACEHOLDER: string = '__DETAIL__.view?Id=';

    /**
     * Configuration for all the child records to display in the parent-child detail panel
     * @type ChildRecordConfiguration[]
     */
    private static readonly CHILD_RECORDS: ChildRecordConfiguration[] = [
        {   // breeding encounter
            formName: 'Breeding Encounter',
            parametersFactory: Breeding.createQueryParams,
            queryName: '_BreedingEncounterByBreedingId',
            schemaName: 'study',
            title: 'Breeding Encounter'
        }, { // ultrasounds
            formName: 'Ultrasounds',
            parametersFactory: Breeding.createQueryParams,
            queryName: '_UltrasoundsByPregnancyId',
            schemaName: 'study',
            title: 'Ultrasounds',
        }, { // outcomes
            formName: 'Pregnancy Outcomes',
            parametersFactory: Breeding.createQueryParams,
            queryName: '_PregnancyOutcomesByPregnancyId',
            schemaName: 'study',
            title: 'Outcomes',
        }];

    // </editor-fold>

    // <editor-fold desc="--Static Functions--">

    /**
     * Generates the default button bar config using the passed data entry form name and object id.
     * @param {String} formName
     * @param {String} objectId
     * @returns {{buttonBar: {items: (any | {text: string; url: any})[]}}}
     */
    private static createDefaultButtonBar(formName: String, objectId: String)
    {
        return {
            buttonBar: {
                items: [
                    LABKEY.QueryWebPart.standardButtons.exportRows,
                    LABKEY.QueryWebPart.standardButtons.print,
                    {
                        text: 'insert new',
                        url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', LABKEY.ActionURL.getContainer(), {
                            formType: formName,
                            returnUrl: window.location,
                            pregnancyid: objectId,
                        }),
                    },
                ],
            },
        }
    }

    /**
     * Factory method to set the query parameters for each parameterized query in each child LabKey.QueryWebPart
     * @param {DataSetRecord} record
     * @returns {{PARENT_RECORD_ID: any}}
     */
    private static createQueryParams(record: DataSetRecord)
    {
        return {PARENT_RECORD_ID: record.get('objectid')};
    }

    /**
     * Sets the browser state and updates the URL in order to enable linking and using the back/forward buttons
     * @param {string} key
     * @param {string | null} value
     */
    private static updateBrowserState(key: keyof PregnancyState, value: string | null)
    {
        if (window.history && window.history.pushState)
        {
            const state = window.history.state || {};
            if (state[key] !== value)
            {
                state[key] = value;
                const uri = URI(document.location);
                if (value === null)
                {
                    uri.removeQuery(key);
                }
                else
                {
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

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * Entry point for the main polyfill. Renders the pregnancy grid (and possibly the details) and hooks up the browser
     * history management using the popstate event
     * @param {string} gridElementId
     * @param {string} detailElementId
     * @param {string} subjects
     */
    public render(gridElementId: string, detailElementId: string, subjects?: string)
    {
        window.onpopstate = this.onPopState.bind(this, window.onpopstate);
        this.detailElementId = detailElementId;
        this.gridElementId = gridElementId;
        Breeding.updateBrowserState('subjects', subjects);
        this.renderGrid(URI(document.location).query(true) as unknown as PregnancyState);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Entry point for the LabKey webpart. Renders the detail webpart, including the details panel and the child
     * record grids
     * @param {WebPartConfig} webpart
     */
    public renderDetail(webpart: WebPartConfig)
    {
        if (webpart.objectId)
        {
            const detailPanel = Ext4.create('WNPRC.ext4.ChildRecordsPanel', {
                childRecords: Breeding.CHILD_RECORDS.map((c) => Ext4.apply(Ext4.apply({}, Breeding.createDefaultButtonBar(c.formName, webpart.objectId)), c)),
                renderTo: webpart.wrapperDivId,
                store: {
                    filterArray: [LABKEY.Filter.create('objectid', webpart.objectId, LABKEY.Filter.Types.EQUAL)],
                    queryName: 'PregnancyInfo',
                    schemaName: 'study',
                    viewName: '_details',
                },
                title: 'Pregnancy Detail',
            });
            detailPanel.on('childLoad', this.attachDetailClickHandler, this, {single: true});
        }
        else
        {
            $(`#${webpart.wrapperDivId}`).empty();
        }
    }

    // </editor-fold>

    // <editor-fold desc="--Private Functions--">

    /**
     * Overwrites the placeholder detail URI with a javascript:void(0) and attaches the detail click handler
     */
    private attachDetailClickHandler()
    {
        $(`a[href*='${Breeding.DETAIL_PLACEHOLDER}']`).each((i, e) => {
            const id = (URI($(e).attr('href')).query(true) as any).Id;
            $(e).attr('href', 'javascript:void(0)')
                .click(this.onDetailClick.bind(this, id));
        });
    }

    /**
     * Handler for clicking the detail links in the pregnancy grid
     * @param {string | null} objectId
     */
    private onDetailClick(objectId: string | null)
    {
        Breeding.updateBrowserState('objectId', objectId);
        this.renderWebpart(objectId);
    }

    /**
     * Handler for the popstate event that gets fired by the back/forward buttons
     * @param {(PopStateEvent) => void} oldHandler
     * @param {PopStateEvent} evt
     */
    private onPopState(oldHandler: (PopStateEvent) => void, evt: PopStateEvent)
    {
        this.renderGrid(evt.state || ({} as PregnancyState));
        if (oldHandler)
        {
            oldHandler(evt);
        }
    }

    /**
     * Renders the pregnancy grid view based on the passed state (viewName/breedingId)
     * @param {PregnancyState} state
     */
    private renderGrid(state: PregnancyState)
    {
        // set up the filters. if there are subjects passed in from the animal history report (or elsewhere)
        // use those, otherwise leave it empty
        const filters = [];
        if (state.subjects != null && state.subjects !== '')
            filters.push(LABKEY.Filter.create('Id', state.subjects, LABKEY.Filter.Types.IN));

        // set up the view. if a view had been specified as part of the state, use that, otherwise check the
        // subject filters. if there are subject filters, we probably want the full pregnancy history for those
        // animals, otherwise leave it blank to get the current pregnancies
        const view = state.viewName || ((state.subjects != null && state.subjects !== '') ? 'pregnancies_all' : '');

        const x = new LABKEY.QueryWebPart({
            buttonBar: {
                items: [
                    LABKEY.QueryWebPart.standardButtons.views,
                    LABKEY.QueryWebPart.standardButtons.exportRows,
                    LABKEY.QueryWebPart.standardButtons.print,
                    LABKEY.QueryWebPart.standardButtons.pageSize,
                    {
                        text: 'insert new',
                        url: LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', LABKEY.ActionURL.getContainer(),
                            {
                                formType: 'Pregnancies',
                                returnUrl: window.location
                            }),
                    },
                ],
            },
            detailsURL: `/wnprc_ehr/${Breeding.DETAIL_PLACEHOLDER}\${objectid}`,
            failure: LABKEY.Utils.onError,
            filterArray: filters,
            maxRows: 20,
            queryName: 'PregnancyInfo',
            schemaName: 'study',
            showDetailsColumn: true,
            success: (dr) => {
                Breeding.updateBrowserState('viewName', dr.viewName);
                this.attachDetailClickHandler();
                this.renderWebpart(state.objectId);
            },
            title: 'Pregnancies',
            viewName: view,
        });
        x.render(this.gridElementId);
    }

    /**
     * Renders the detail webpart for the passed breeding encounter id (or clears it)
     * @param {string | null} objectId
     */
    private renderWebpart(objectId: string | null)
    {
        const x = new LABKEY.WebPart({
            partConfig: {objectId},
            partName: 'Pregnancy Detail',
            renderTo: this.detailElementId,
        });
        x.render();
    }

    // </editor-fold>
}

// noinspection JSUnusedGlobalSymbols
export default new Breeding();

// <editor-fold desc="--Helper Interface Definitions--">

/**
 * Child record configuration to pass to the child records panel
 */
interface ChildRecordConfiguration
{
    buttonBar?: { items: any[] };
    cls?: string;
    detailsURL?: string;
    formName?: string;
    filterArrayFactory?: (record: DataSetRecord) => any[];
    parametersFactory?: (record: DataSetRecord) => any;
    queryName: string;
    schemaName: string;
    showDetailsColumn?: boolean;
    title?: string;
    viewName?: string;
}

/**
 * Single record returned from a data store
 */
interface DataSetRecord
{
    get: (key: string) => any;
}

/**
 * Browser state/get query parameters for loading the pregnancy grid/detail
 */
interface PregnancyState
{
    objectId: string | null;
    viewName: string | null;
    subjects: string | null;
}

/**
 * Configuration object passed from the webpart config for the pregnancy detail webpart
 */
interface WebPartConfig
{
    objectId: string | null;
    wrapperDivId: string;
}

// </editor-fold>
