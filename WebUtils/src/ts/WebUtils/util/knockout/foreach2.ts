import ko from '../../externals/knockout-enhanced';

/*
 * Custom binding that adds beforeRenderAll and afterRenderAll.
 *
 * Taken verbatim from a Nov 24, 2015 post by mbest on Pull Request 1856
 *
 *     https://github.com/knockout/knockout/pull/1856
 */
let foreach2: KnockoutBindingHandler = {
    init: ko.bindingHandlers.foreach.init,
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var options = ko.unwrap(valueAccessor());
        ko.unwrap(options.data); // needed to set a dependency

        options.beforeRenderAll && options.beforeRenderAll();
        if (ko.bindingHandlers.foreach && ko.bindingHandlers.foreach.update) {
            ko.bindingHandlers.foreach.update(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
        options.afterRenderAll && options.afterRenderAll();
    }
};

export function registerCustomBinding(): void {
    ko.bindingHandlers['foreach2'] = foreach2;

    // Ensure that this will work with virtual elements.  Since foreach works with virtual elements, and
    // this custom binding doesn't add anything else that references individual nodes, this is safe.
    ko.virtualElements.allowedBindings.foreach2 = true;

}