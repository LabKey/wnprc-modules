import { getCurrentContainer, buildURL, getBaseURL } from "./LabKey";

export interface makeURLConfig {
    controller: string,
    container?: string
}

export function makeURL(action: string, config: makeURLConfig): string {
    return buildURL(config.controller, action, config.container || getCurrentContainer());
}

export type LabKeyHttpAPICommand = 'selectRows' | 'saveRows' | 'executeSql';

export function makeURLForHTTPAction(action: LabKeyHttpAPICommand, container?: string): string {
    let baseURL = getBaseURL();
    if (!container) {
        container = getCurrentContainer();
    }

    return `${baseURL}/query/${container}/${action}.api`;
}