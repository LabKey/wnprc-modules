(function() {
    var resolveElement = function(element) {
        var $element = $(element);

        // If the input is wrapped by an element with .date, or .input-group, initialize on that
        // element instead, to allow the user to click an icon next to the input.
        if ($element.parent().hasClass('date') || $element.parent().hasClass('input-group')) {
            $element = $element.parent();
        }

        return $element;
    };

    ko.bindingHandlers.dateTimePicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().dateTimePickerOptions || {};
            var $element = resolveElement(element);

            $element.datetimepicker(options);

            // Insert the initial value
            var picker = $element.data("DateTimePicker");
            var koDate = ko.utils.unwrapObservable(valueAccessor());
            picker.date(_.isUndefined(koDate) ? null : koDate);

            //when a user changes the date, update the view model
            ko.utils.registerEventHandler($element.get(0), "dp.change", function (event) {
                var value = valueAccessor();
                if (ko.isObservable(value)) {
                    if (moment.isMoment(event.date)) {
                        value(event.date.toDate());
                    }
                    else if (event.date == false) {
                        value(null);
                    }
                    else {
                        value(event.date);
                    }
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var picker = resolveElement(element).data("DateTimePicker");
                if (picker) {
                    picker.destroy();
                }
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var picker = resolveElement(element).data("DateTimePicker");
            //when the view model is updated, update the widget
            if (picker) {
                var koDate = ko.utils.unwrapObservable(valueAccessor());

                picker.date(_.isUndefined(koDate) ? null : koDate);
            }
        }
    };
})();

