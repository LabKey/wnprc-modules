define(["require","exports","module","jquery","underscore"],function(require,exports,module,$,_){

    var Classify = {};
    var $ = $ || jQuery;

    var noOp = function() {};

    var getParent = function(newClassObj) {
        // First, call the parent constructor, if one exists.
        var parent;
        if ('parent' in newClassObj){
            parent = newClassObj.parent;
            if (!('_innerConstructor' in parent)) {
                parent._innerConstructor = noOp;
            }

            return parent;
        }
        else {
            return false;
        }
    };

    var getParentRecursive = function(parents) {
        if (!_.isArray(parents)) {
            parents = [parents];
        }

        var nextParent = getParent( parents[0] );
        if ( nextParent ) {
            parents.unshift(nextParent);
            return getParentRecursive(parents);
        }
        else {
            return parents;
        }
    };

    Classify.newClass = function(config) {
        var newObject = function(constructorConfig) {
            var self = this;

            // Grab the inheritance tree.
            var familyTree = getParentRecursive(this);

            // Call all constructors in order.
            _.each(familyTree, function(newClassObj) {
                newClassObj._innerConstructor.call(self, constructorConfig);
            });

            var ko = ko;
            if ('ko' in window) {
                ko = window.ko;
            }
            else if (_.isUndefined(ko)) {
                try {
                    ko = require('knockout');
                }
                catch(error) {
                    // Do nothing.
                }
            }

            // Only support computed methods if knockout has been loaded
            if (!_.isUndefined(ko) && !_.isUndefined(self._ko_computeds)) {
                $.each(self._ko_computeds, function (key, value) {
                    var functionToWrap;
                    var subscription;

                    if (_.isFunction(value)) {
                        functionToWrap = value;
                    }
                    else if (_.keys(value).length > 0) {
                        if ('function' in value) {
                            functionToWrap = value['function']; // function is a reserved word and will cause YUICompressor to scream
                        }
                        if ('subscription' in value) {
                            subscription = value.subscription;
                        }
                    }
                    else {
                        return;
                    }

                    var wrappedMethod = function () {
                        var returnVal;
                        try {
                            returnVal = functionToWrap.call(self, arguments);
                        }
                        catch (err) {
                            return undefined;
                        }
                        return returnVal;
                    };
                    self[key] = ko.computed(wrappedMethod, self);

                    if (_.isFunction(subscription)) {
                        self[key].subscribe(function() {
                            subscription.apply(self, arguments);
                        });
                    }
                });
            }
        };

        // Apply the parent
        if ('parent' in config) {
            newObject.prototype = Object.create(config.parent.prototype);
            newObject.prototype.parent = Object.create(config.parent.prototype);
        }

        // Define the constructor
        newObject.prototype.constructor = newObject;
        if (typeof config.constructor === 'function') {
            newObject.prototype._innerConstructor = config.constructor;
        }

        // Handle computed methods, including merging with parent computed methods.
        var computeds = {};
        if ('computeds' in config) {
            computeds = config.computeds;
        }
        if (('parent' in newObject.prototype) && ( '_ko_computeds' in newObject.prototype.parent )) {
            computeds = _.extend(newObject.prototype.parent._ko_computeds, computeds);
        }
        newObject.prototype._ko_computeds = computeds;

        // Give the prototype a method to add methods and add it to the new object directly, so that it
        // can be accessed later in this function.
        newObject.addMethod = function(name, method) {
            this.prototype[name] = method;
        };
        newObject.prototype.addMethod = newObject.addMethod;

        // Add all of the configured methods to the object prototype.
        if ('methods' in config) {
            $.each(config.methods, function(key, value) {
                newObject.addMethod(key, value);
            });
        }

        return newObject;
    };

    Classify.IInterfacify = Classify.newClass({
        constructor: function(config) {
            //TODO: Implement a requirement property for the config object, to allow
            //      Interfaces to specify methods or properties that they need.
        },
        methods: {
            applyTo: function(thingToInterfacify) {
                var self = this;

                /* Apply all the properties of this interface to the new object */
                $.each(_.keys(self), function(index, property) {
                    //  TODO:  Add error checking/warning to see if we're clobbering anything on the object
                    if ( (!property.match(/^_/)) && (property !== 'applyTo') ) {
                        thingToInterfacify.prototype[property] = self[property];
                    }
                });
            }
        }
    });

    Classify.Version = '0.0.42';

    return Classify;

});