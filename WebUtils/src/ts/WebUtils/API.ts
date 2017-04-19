import {getCSRF, getPageLoadData, getBaseURL} from "./LabKey";

import * as s from "underscore.string";
import * as _ from "underscore";

import rsvp = require('rsvp');
import {makeURLForHTTPAction} from "./URL";
import moment = require("moment");
import Moment = moment.Moment;
const fetch = require("fetch");

let convertToRSVP = function<T>(promise: Promise<T>): rsvp.Promise<T> {
    return new rsvp.Promise((resolve, reject) => {
        promise.then((val) => {
            resolve(val);
        }).catch((val) => {
            reject(val);
        });
    });
};

let makeRequest = function(url: string, config?: RequestInit): rsvp.Promise<Response> {
    if (!config) {
        config = {};
    }

    /*
     * Some non-HTTP API actions require the CSRF key:
     *   https://www.labkey.org/wiki/home/Documentation/page.view?name=csrfProtection
     *
     * Once the LABKEY library has loaded, this will be added to all requests.  It is important
     * that no @CSRF protected actions are called before this loads, as they will simply appear
     * as 401 Unauthorized requests, indistinguishable from non-logged in requests.
     */
    let csrfToken = getCSRF();
    if (csrfToken != "") {
        config.headers = config.headers || {};
        config.headers["X-LABKEY-CSRF"] = csrfToken;
    }

    if (!config.credentials) {
        config.credentials = 'same-origin';
    }


    return fetch(url, config).then((response: Response) => {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        else {
            let error = new Error(response.statusText) as any;
            error['response'] = response;
            throw error;
        }
    })
};

let extractJson = function(response: Response): rsvp.Promise<{[name: string]: any}> {
    let contentType = response.headers.get('content-type');

    if (contentType && contentType.indexOf('application/json') !== -1) {
        return convertToRSVP(response.json());
    }
    else {
        return rsvp.Promise.resolve({});
    }
};

let makeRequestJSON = function(url: string, config?: RequestInit): rsvp.Promise<{[name: string]: any}> {
    return makeRequest(url, config).catch((e) => {
        return extractJson(e.response).then((data) => {
            return rsvp.Promise.reject(data);
        });
    }).then((response) => {
        return extractJson(response);
    })
};

export interface SelectRowsConfig {
    viewName?: string,
    container?: string,
    columns?: string | string[],
    filters?: {
        [name: string]: string
    }
}

export function selectRowsFromCache(schema: string, query: string, view?: string): any {
    let cache = getPageLoadData().queries;

    // The default view is stored in the "" subscript.
    if (!view) {
        view = "";
    }

    if ((schema in cache) && (query in cache[schema]) && (view in cache[schema][query])) {
        return cache[schema][query][view];
    }
    else {
        throw new Error("Not in cache.");
    }
}

export function selectRows(schema: string, query: string, config: SelectRowsConfig): rsvp.Promise<{[name: string]: any}>  {
    // Check for required parameters
    if (!schema) {
        throw "You must specify a schemaName!";
    }
    if (!query) {
        throw "You must specify a queryName!";
    }

    let requestURL = URI(makeURLForHTTPAction('selectRows', config.container));
    if (config.container) {
        delete config.container;
    }

    let params: {[name: string]: string} = {
        schemaName: schema,
        'query.queryName': query
    };

    if (config.filters) {
        _.each(config.filters, (value, key) => {
            params[`query.${key}`] = value
        });
    }

    if (config.columns) {
        params['query.columns'] = _.isArray(config.columns) ? config.columns.join(",") : config.columns;
    }


    for (let key in params) {
        requestURL = requestURL.addSearch(key, params[key]);
    }

    return makeRequestJSON(requestURL.toString());
}

export interface Command {
    schemaName:    string,
    queryName:     string,
    command:       string,
    rows:          Object[],
    extraContext?: {[name: string]: string}
}

export type TransactionType = 'insert' | 'update' | 'delete';

export class Transaction {
    public readonly extraContext: {[name: string]: string} = {};
    public readonly rows: {[name: string]: any}[] = [];

    constructor(public type: TransactionType, public schema: string, public query: string) {

    }

    public addRow(row: {[name: string]: any}): void {
        this.rows.push(row);
    }

    public addRows(rowsToAdd: {[name: string]: any}[]): void {
        Array.prototype.push.apply(this.rows, rowsToAdd);
    }

    getCommandObject(): Command {
        let command: Command = {
            schemaName: this.schema,
            queryName:  this.query,
            command:    this.type,
            rows:       this.rows
        };

        if (_.keys(this.extraContext).length > 0) {
            command.extraContext = this.extraContext;
        }

        return command;
    }
}

export interface CommandRequestConfig {
    container:    string,
    validateOnly: boolean,
    extraContext: {[name: string]: string}
}

export function makeAPIRequestFromCommands(commands: Command[], config: CommandRequestConfig) {
    let requestConfig: RequestInit = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commands:      commands,
            containerPath: config.container,
            extraContext:  config.extraContext
        })
    };

    let url = makeURLForHTTPAction('saveRows', config.container);
    return makeRequestJSON(url, requestConfig);
}

export function makeAPIRequest(type: TransactionType, schema: string, query: string, rows: Object[], config: CommandRequestConfig) {
    let transaction = new Transaction(type, schema, query);
    transaction.addRows(rows);

    if (config.extraContext) {
        _.extend(transaction.extraContext, config.extraContext);
    }

    return makeAPIRequestFromCommands([transaction.getCommandObject()], config);
}

export function updateRows(schema: string, query: string, rows: Object[], config: CommandRequestConfig) { return makeAPIRequest('update', schema, query, rows, config); }
export function insertRows(schema: string, query: string, rows: Object[], config: CommandRequestConfig) { return makeAPIRequest('insert', schema, query, rows, config); }
export function deleteRows(schema: string, query: string, rows: Object[], config: CommandRequestConfig) { return makeAPIRequest('delete', schema, query, rows, config); }

export function executeSql(schema: string, sql: string) {
    return makeRequestJSON(makeURLForHTTPAction('executeSql'), {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            schemaName: schema,
            sql: sql
        })
    })
}

export function get(url: string, config: RequestInit) {
    return makeRequest(url, config);
}

export function getText(path: string) {
    return makeRequest(getBaseURL() + path).then(function(response) {
        return response.text();
    });
}

export function getJSON(url: string, config: RequestInit) {
    return makeRequestJSON(url, config);
}

export function post(url: string, data: Object, config: RequestInit) {
    config = config || {};
    url = s.rtrim(url, "?");

    let queryString = $.param(data);
    if (queryString.length > 0) {
        url += '?' + queryString;
    }

    config.method = 'post';

    return makeRequest(url, config)
}

export function postJSON(url: string, data: Object, config: RequestInit) {
    return makeRequestJSON(url, _.extend(config, {
        method: 'post',
        headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }));
}

let dbFormat = "YYYY/MM/DD HH:mm:ss";

export function formatDateForDB(momentObj: Moment) {
    return momentObj.format(dbFormat)
}

export function parseDateFromDB(text: string) {
    return moment(text, dbFormat);
}

export function displayDate(date: moment.Moment | string): string {
    var m = moment.isMoment(date) ? date : moment(date, "YYYY/MM/DD HH:mm:ss");
    return m.calendar(undefined, {
        sameElse: 'MMM D[,] YYYY'
    });
}