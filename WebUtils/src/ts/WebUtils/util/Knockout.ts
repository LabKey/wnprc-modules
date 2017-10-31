import * as ko from "knockout";
import * as _ from "underscore";
import { getBaseURL } from "../LabKey";

// Register the component loader that allows us to load relative to the contextPath.
let loader: any = {
    loadTemplate: function(name: string, templateConfig: any, callback: Function) {
        // Only handle templates meant for us
        if (_.isObject(templateConfig) && ('ajax' in templateConfig)) {
            let url = getBaseURL() + templateConfig.ajax;
            $.get(url, function(data) {
                callback($.parseHTML(data));
            })
        }
        // otherwise, defer to the other component loaders (such as the default).
        else {
            callback(null);
        }
    }
};

export function registerCustomComponentLoader(): void {
    ko.components.loaders.unshift(loader);
}