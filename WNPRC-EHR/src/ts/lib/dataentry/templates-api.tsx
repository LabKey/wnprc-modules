import { buildURLWithParams, getCurrentContainer } from "WebUtils/LabKey";
import { postJSON } from "WebUtils/API";
import { UpdateTemplateForm } from "../../../../build/generated-ts/GeneratedFromJava";

const CONTROLLER = 'wnprc_ehr-templates';

function genTemplateUrl(templateid: string, actionName: string) {
    return buildURLWithParams(CONTROLLER, actionName, getCurrentContainer(), { templateid });
}

export function deleteTemplate(id: string): Promise<any> {
    return postJSON(genTemplateUrl(id, 'deleteTemplate'), {});
}

export function updateTemplate(id: string, form: UpdateTemplateForm): Promise<any> {
    return postJSON(genTemplateUrl(id, 'updateTemplate'), form);
}