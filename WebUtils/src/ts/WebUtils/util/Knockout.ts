import ko from "../externals/knockout-enhanced";
import * as _ from "underscore";
import * as foreach2 from "./knockout/foreach2";
import {getBaseURL} from "../LabKey";
export {foreach2};

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