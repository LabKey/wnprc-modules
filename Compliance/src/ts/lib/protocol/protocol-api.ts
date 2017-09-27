import * as api from "WebUtils/API";
import {
    SpeciesClass, SpeciesForm, AllowedSpeciesForm,
    ProtocolRevisionsForm
} from "../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "../../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import * as rsvp from "rsvp";
type Promise<T> = rsvp.Promise<T>;


const controller = "wnprc_compliance-protocol-api";
const revision_field_name = "revision_id";

export function addSpeciesToProtocol(revisionId: string, speciesClass: SpeciesClass): Promise<SpeciesForm> {
    let params: {[name: string]: string} = {
        species: speciesClass
    };
    params[revision_field_name] = revisionId;

    let url = buildURLWithParams(controller, 'addSpeciesToProtocol', getCurrentContainer(), params);

    return api.postJSON(url, {}, {}).then((data: any) => {
        return SpeciesForm.fromJSON(data);
    });
}


export function deleteSpeciesFromProtocol(revisionId: string, speciesClass: SpeciesClass): Promise<{}> {
    let params: {[name: string]: string} = {
        species: speciesClass
    };
    params[revision_field_name] = revisionId;

    let url = buildURLWithParams(controller, 'deleteSpeciesFromProtocol', getCurrentContainer(), params);

    return api.postJSON(url, {}, {}).then((data: any) => {
        return {};
    });
}

export function getAllowedSpecies(revisionId: string): Promise<AllowedSpeciesForm> {
    let params: {[name: string]: string} = {};
    params[revision_field_name] = revisionId;

    let url = buildURLWithParams(controller, 'getAllowedSpecies', getCurrentContainer(), params);

    return api.getJSON(url, {}).then((data: any) => {
        return AllowedSpeciesForm.fromJSON(data);
    });
}

export function getAllRevisions(revisionId: string): Promise<ProtocolRevisionsForm> {
    let params: {[name: string]: string} = {};
    params[revision_field_name] = revisionId;

    let url = buildURLWithParams(controller, 'getAllRevisions', getCurrentContainer(), params);

    return api.getJSON(url, {}).then((data: any) => {
        return ProtocolRevisionsForm.fromJSON(data);
    });
}

export function getEditProtocolRevisionLink(revisionId: string): string {
    let params: {[name: string]: string} = {};
    params[revision_field_name] = revisionId;

    return buildURLWithParams('wnprc_compliance-protocol-view', 'EditProtocol', getCurrentContainer(), params);
}