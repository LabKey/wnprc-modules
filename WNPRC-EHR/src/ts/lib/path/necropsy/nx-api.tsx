import {NecropsyRequestDetailsForm} from "../../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "../../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {getJSON} from "../../../../../lkpm/modules/WebUtils/src/ts/WebUtils/API";

const NECROPSY_CONTROLLER = "wnprc_ehr-necropsy";
const NECROPSY_LSID_NAME = 'necropsy-lsid';

export function getNecropsyRequestDetails(lsid: string): Promise<NecropsyRequestDetailsForm> {
    let url = buildURLWithParams(NECROPSY_CONTROLLER, 'getNecropsyRequestDetails', getCurrentContainer(), {
        [NECROPSY_LSID_NAME]: lsid
    });

    return getJSON(url, {}).then((data: any) => {
        return NecropsyRequestDetailsForm.fromJSON(data);
    });
}