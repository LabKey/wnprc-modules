/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * This enables all punches features for knockout and defines some default components
 */
ko.punches.enableAll();

// Register the component loader that allows us to load relative to the contextPath.
ko.components.loaders.unshift({
    loadTemplate: function(name, templateConfig, callback) {
        // Only handle templates meant for us
        if (_.isObject(templateConfig) && ('ajax' in templateConfig)) {
            var url = LABKEY.ActionURL.getContextPath() + templateConfig.ajax;
            $.get(url, function(data) {
                callback($.parseHTML(data));
            })
        }
        // otherwise, defer to the other component loaders (such as the default).
        else {
            callback(null);
        }
    }
});

(function(ko){
    var userUtils = {};
    ko.utils.user = userUtils;

    userUtils.forceObservableArray = function(possibleArray) {
        if (_.isUndefined(possibleArray)) {
            return ko.observableArray();
        }
        else if (!ko.isObservable(possibleArray)) {
            if (!_.isArray(possibleArray)) {
                possibleArray = [possibleArray];
            }

            return ko.observableArray(possibleArray);
        }
        else {
            if (_.isArray(ko.unwrap(possibleArray))) {
                return possibleArray;
            }
            else {
                return ko.observableArray([ko.unwrap(possibleArray)]);
            }
        }
    };
})(ko);

ko.components.register('lk-webpartbox', {
    viewModel: (function(){
        var curId = 0;
        var getID = function() {
            return curId++;
        };

        return {
            createViewModel: function(params, componentInfo) {
                params = params || {};

                var $element = $(componentInfo.element);
                var hadNodes = false;
                if (('templateNodes' in componentInfo) && (componentInfo.templateNodes.length > 0)) {
                    hadNodes = true;
                }

                var VM = _.extend({
                    id: 'lk-webpart-' + getID(),
                    title: $element.attr('title') || "insert title here",
                    html: '<p>Content goes here...</p>',
                    hadNodes: hadNodes,
                    templateNodes: componentInfo.templateNodes,
                    afterRenderHook: function() {
                        if ( (params.innerVM) && (_.isFunction(params.innerVM.afterRender)) ) {
                            params.innerVM.afterRender(componentInfo.element);
                        }
                    }
                }, params);

                return VM;
            }
        }
    })(),
    template: [
        '<div id="{{id}}-body" class="ldk-wp" style="margin-bottom: 15px">',
        '   <table id="{{id}}-table" class="labkey-wp">',
        '      <tbody>',
        '         <tr class="labkey-wp-header">',
        '            <th class="labkey-wp-title-left">{{title}}</th>',
        '            <th class="labkey-wp-title-right">&nbsp;</th>',
        '         </tr>',
        '         <tr>',
        '            <td colspan=2 class="labkey-wp-body">',
        '                {{#if: hadNodes}}',
        '                <div id="{{id}}-innerDiv" data-bind="template: {nodes: templateNodes, data: innerVM, afterRender: afterRenderHook}"></div>',
        '                {{/if}}',
        '                {{#ifnot: hadNodes}}',
        '                <div id="{{id}}-innerDiv">{{{html}}}</div>',
        '                {{/if}}',
        '            </td>',
        '         </tr>',
        '      </tbody>',
        '   </table>',
        '</div>'
    ].join("\n")
});

/*
 * Custom binding that adds beforeRenderAll and afterRenderAll.
 *
 * Taken verbatim from a Nov 24, 2015 post by mbest on Pull Request 1856
 *
 *     https://github.com/knockout/knockout/pull/1856
 */
ko.bindingHandlers.foreach2 = {
    init: ko.bindingHandlers.foreach.init,
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var options = ko.unwrap(valueAccessor());
        ko.unwrap(options.data); // needed to set a dependency

        options.beforeRenderAll && options.beforeRenderAll();
        ko.bindingHandlers.foreach.update(element, valueAccessor, allBindings, viewModel, bindingContext);
        options.afterRenderAll && options.afterRenderAll();
    }
};

// Ensure that this will work with virtual elements.  Since foreach works with virtual elements, and
// this custom binding doesn't add anything else that references individual nodes, this is safe.
ko.virtualElements.allowedBindings.foreach2 = true;