declare const LABKEY: {
    CSRF: string,
    ActionURL: any
};

export function getCSRF(): string {
    return LABKEY.CSRF || "";
}

export function getCurrentController(): string {
    return LABKEY.ActionURL.getController();
}

export function getCurrentContainer(): string {
    return LABKEY.ActionURL.getContainer();
}

export function getBaseURL(): string {
    return LABKEY.ActionURL.getBaseURL();
}

export function buildURL(controller: string, action: string, container?: string): string {
    return LABKEY.ActionURL.buildURL(controller, action, container);
}

declare const __WebUtilsPageLoadData: any;

export function getPageLoadData(): any {
    return __WebUtilsPageLoadData;
}