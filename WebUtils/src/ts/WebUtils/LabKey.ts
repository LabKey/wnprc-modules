import {URLForAction} from "GeneratedFromJava";
import * as $ from "jquery";
import * as URI from "urijs";

/*
 * This depends on the LabKey base JS that comes from PageFlowUtil.getLabkeyJS(), but you don't need the rest
 * of the libraries by default.
 */
declare const LABKEY: {
    CSRF: string;
    container: {path: string};
    getModuleContext(moduleName: string): any;
    contextPath: string;
};

export function getCSRF(): string {
    return LABKEY.CSRF || "";
}

export function getCurrentContainer(): string {
    return LABKEY.container.path;
}

export function getBaseURL(): string {
    return LABKEY.contextPath;
}

export function urlFromAction(actionURL: URLForAction, params?: {[name: string]: string}): string {
    if (!params) {
        return buildURL(actionURL.controller, actionURL.actionName, getCurrentContainer());
    }
    else {
        return buildURLWithParams(actionURL.controller, actionURL.actionName, getCurrentContainer(), params);
    }
}

export function buildURL(controller: string, action: string, container: string): string {
    let url = `${getBaseURL()}/${controller}/${container}/${action}.view`;

    return URI(url).normalize().toString();
}

export function buildURLWithParams(controller: string, action: string, container: string, queryParams: {[name: string]: string}): string {
    return `${buildURL(controller, action, container)}?${$.param(queryParams)}`
}

declare const __WebUtilsPageLoadData: any;

export function getPageLoadData(): any {
    return __WebUtilsPageLoadData;
}

export function getModuleContext(moduleName: string): any {
    return LABKEY.getModuleContext(moduleName) || {};
}

export function getLinkToAnimal(id: string): string {
    return buildURLWithParams('ehr', 'participantView', getCurrentContainer(), {participantId: id});
}