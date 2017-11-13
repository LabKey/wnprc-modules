var WNPRC = WNPRC || {};

(function() {
    var aliasPrefixes = ['widget', 'plugin'];
    var getByAlias = function(className) {
        // Shortcut so we don't have to type the whole function name each time.
        var getFromAlias = function(name) { return Ext4.ClassManager.getByAlias(name); };

        var actualClass = getFromAlias(className);
        if (Ext4.isDefined(actualClass) && (actualClass !== null)) {
            return actualClass;
        }


        jQuery.each(aliasPrefixes, function(i, prefix) {
            var newName = prefix + "." + className;

            actualClass = getFromAlias(newName);

            if (Ext4.isDefined(actualClass) && (actualClass !== null)) {
                return false; // short circuit each() loop.
            }
        });

        return actualClass;
    };

    var resolveObject = function(object) {
        if (Ext4.isString(object)) {
            if (getByAlias(object) !== null) {
                return getByAlias(object);
            }
            else {
                return Ext4.ClassManager.get(object);
            }
        }
        else if ('$className' in object) {
            return object;
        }
        else {
            throw new Error("Tried to resolve a non-Ext object.");
        }
    };

    var getClassName = function(object) {
        return object.$className;
    };

    var getInheritanceTree = function(object) {
        object = resolveObject(object);
        var className = object.$className;

        if ('superclass' in object) {
            return [className].concat(getInheritanceTree(object.superclass));
        }
        else {
            return [className];
        }
    };

    var isInstanceOf = function(instance, clazz) {
        var classNameToCheckFor = getClassName(resolveObject(clazz));
        var isInstanceOf = false;

        jQuery.each(getInheritanceTree(instance), function(i, classNameInTree) {
            if (classNameInTree === classNameToCheckFor) {
                isInstanceOf = true;
                return false; // Break out of each early.
            }
        });

        return isInstanceOf;
    };

    var contains = function(array,element) {
        if (!Ext4.isArray(array)) {
            array = [array];
        }

        var foundMatch = false;
        jQuery.each(array, function(i,val) {
            if (val === element) {
                foundMatch = true;
                return false
            }
        });
        return foundMatch;
    };

    var getSingleAnimalFieldsToSync = function() {
        return ['Id', 'date', 'performedby'];
    };

    // This retrieves (and creates if it doesn't exist) a div with the bootstrap-box id, to allow
    // bootstrap to format stuff inside, such as modals.
    var getBootstrapBox = function() {
        var $bootstrapBox = jQuery('#bootstrap-box');

        if ($bootstrapBox.length == 0) {
            $bootstrapBox = jQuery(document.createElement('div'));
            $bootstrapBox.attr('id', 'bootstrap-box');
            $('body').append($bootstrapBox);
        }

        return $bootstrapBox;
    };

    var qcStore = LABKEY.ext4.Util.getLookupStore({
        lookup: {
            schemaName:    'study',
            queryName:     'QCState',
            keyColumn:     'RowId',
            displayColumn: 'Label'
        }
    });

    // A function to lookup the display value of a QCState based on it's rowid/number/code.
    var getQCStateLabel = function(rowid) {
        var index = qcStore.find("RowId", rowid);

        if (index == -1) {
            return "";
        }
        else {
            var rec = qcStore.getAt(index);
            return rec.get("Label");
        }
    };

    // Returns a promise that resolves with the store as it's data once the store is loaded.
    var when$QCStoreLoads = function() {
        return new Promise(function(resolve, reject) {
            if (qcStore.isLoading()) {
                qcStore.on("load", function() {
                    resolve(qcStore);
                }, null, {single: true});
            }
            else {
                resolve(qcStore);
            }
        });
    };

    var loadWindow = function(windowName, innerVM) {
        return Promise.all([
            WebUtils.API.getText("/wnprc_ehr/ext4/windows/WindowTemplate.html"),
            WebUtils.API.getText("/wnprc_ehr/ext4/windows/" + windowName + ".html")
        ]).then(function(values) {
            // Parse the template HTML
            var $nodes = jQuery(jQuery.parseHTML(values[0]));
            var $innerNodes = jQuery(jQuery.parseHTML(values[1]));
            $nodes.find('.modal-body').append($innerNodes);

            // Build the container.
            var $bootstrapBox = WNPRC.ExtUtils.getBootstrapBox();
            var $div = $(document.createElement("div"));
            $div.append($nodes);
            $bootstrapBox.append($div);
            var $modal = $div.find('div.modal');

            var VM = {};

            // Add a canceled flag
            VM.canceled = ko.observable(true);

            // A method to submit the form.  Using the canceled flag allows us to know whether the user
            // selected submit or cancel.
            VM.submit = function() {
                VM.canceled(false);
                $modal.modal('hide');
            };

            // Grab the disable function, if there is one.
            if (_.isFunction(innerVM.submitDisabled)) {
                VM.submitDisabled = innerVM.submitDisabled
            }
            else {
                VM.submitDisabled = false;
            }

            // Attach the inner VM.
            VM.innerVM = innerVM || {};

            // Apply the VM to the template
            ko.applyBindings(VM, $div.get(0));

            // Now that everything is set up, actually display the modal.
            $modal.modal('show');

            return Promise.resolve({
                $modal: $modal,
                display: function() {
                    return new Promise(function(resolve, reject) {
                        $modal.on('hidden.bs.modal', function() {
                            if (VM.canceled()) {
                                reject(new Error("canceled"));
                            }
                            resolve(VM.innerVM);
                        });
                    });
                },
                destroy: function() {
                    ko.cleanNode($div.get(0));
                    $div.remove();
                }
            });
        });
    };

    WNPRC.ExtUtils = WNPRC.ExtUtils || {};
    Ext4.apply(WNPRC.ExtUtils, {
        getInheritanceTree: getInheritanceTree,
        resolveObject: resolveObject,
        isInstanceOf: isInstanceOf,
        contains: contains,
        getSingleAnimalFieldsToSync: getSingleAnimalFieldsToSync,
        getBootstrapBox: getBootstrapBox,
        getQCStateLabel: getQCStateLabel,
        qcStore: qcStore,
        when$QCStoreLoads: when$QCStoreLoads,
        loadWindow: loadWindow
    });
})();