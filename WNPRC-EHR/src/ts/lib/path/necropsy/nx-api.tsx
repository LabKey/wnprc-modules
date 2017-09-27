import {
    NecropsyRequestDetailsForm, NecropsySuiteInfo,
    ScheduleNecropsyForm
} from "../../../../../build/generated-ts/GeneratedFromJava";
import {buildURL, buildURLWithParams, getCurrentContainer} from "../../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON, postJSON} from "../../../../../lkpm/modules/WebUtils/src/ts/WebUtils/API";

const NECROPSY_CONTROLLER = "wnprc_ehr-necropsy";
const NECROPSY_LSID_NAME = 'necropsy-lsid';
const CONTAINER = getCurrentContainer();


export const NecropsySuites: Promise<NecropsySuiteInfo[]> = getJSON(buildURL(NECROPSY_CONTROLLER, 'getNecropsySuites', CONTAINER), {}).then((data: any) => {
    return data['suites'];
});

export const Pathologists: Promise<{[roomid: string]: string}> = getJSON(buildURL(NECROPSY_CONTROLLER, 'getPathologists', CONTAINER), {}).then((data: any) => {
    return data;
});

export function getNecropsyRequestDetails(lsid: string): Promise<NecropsyRequestDetailsForm> {
    let url = buildURLWithParams(NECROPSY_CONTROLLER, 'getNecropsyRequestDetails', CONTAINER, {
        [NECROPSY_LSID_NAME]: lsid
    });

    return getJSON(url, {}).then((data: any) => {
        return NecropsyRequestDetailsForm.fromJSON(data);
    });
}

export function scheduleNecropsy(requestid: string, form: ScheduleNecropsyForm): Promise<any> {
    let url = buildURLWithParams(NECROPSY_CONTROLLER, 'scheduleNecropsy', CONTAINER, {
        requestid: requestid
    });

    return postJSON(url, form);
}