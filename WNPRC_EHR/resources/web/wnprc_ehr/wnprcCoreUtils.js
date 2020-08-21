/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// Ensure that the parent objects exist, but don't overwrite them.
var WNPRC_EHR = WNPRC_EHR || {};
WNPRC_EHR.Utils = WNPRC_EHR.Utils || {};

/*
 * Client Library Utils
 */
WNPRC_EHR.Utils.Lib = (function() {
    // This function is what does the loading and parsing of lib.xml files.
    var XMLLoader = function (path, callback) {
        var handler = function (data) {
            var xml = data;
            var retval = {};

            // Grab scripts and dependencies
            jQuery.each(['script', 'dependency'], function (index, nodeName) {
                retval[nodeName] = [];
                jQuery.each(xml.getElementsByTagName(nodeName), function (index, scriptNode) {
                    retval[nodeName].push(scriptNode.getAttribute('path'))
                });
            });

            callback(retval);
        };

        jQuery.get(path, handler);
    };

    /**
     * Loads a LabKey client library, including any dependencies, and then calls your callback function.
     * @param {string} path - The name of the library.  By default this is interpreted as being relative
     *                        to the wnprc_ehr/lib directory.  If you include a "/" at the start of the
     *                        library name, it will assume the library path is an absolute path.  This can
     *                        also be an array of libraries to load.  Don't include the ".lib.xml"
     * @param {function} callback - A callback to execute when the libraries have finished loading.  This
     *                              is the code that is dependent on the libraries being present.
     */
    var loadLibrary = function(path, callback) {
        // Force this to be an array
        if (!LABKEY.Utils.isArray(path)) { path = [path]; }

        // Ensure that the list of paths have the correct form.
        path = path.map(function(path) {
            if (path.substr(0, 1) !== "/") {
                path = "wnprc_ehr/lib/" + path;
            }
            return path;
        });

        // A closure cache of the libraries already loaded.  We don't need to track
        // the individual scripts, because that is done by LABKEY.requiresScript()
        var alreadyLoaded = {};

        var scripts = [];       // list of scripts to grab in reverse order
        var register = 0;       // a count of active calls to trackedXMLLoader
        var calledBack = false; // Whether or not the callback/LabKey loader has been executed yet

        var trackedXMLLoader = function(libName, handler) {
            // Remove any leading slashes to make the alreadyLoaded cache consistent
            libName = libName.replace(/^\//,'');

            // The library hasn't been loaded...
            if (!alreadyLoaded[libName]) {
                alreadyLoaded[libName] = true; // mark the library as loaded
                register++; // increment the active calls register

                // Convert the lib name to a path to load
                var path = LABKEY.ActionURL.getContextPath() + "/" + libName + ".lib.xml";

                // Load the library's xml
                XMLLoader(path, function (data) {
                    register--; // decrement the register because we are no longer an active ajax call
                    handler(data, path)
                });
            }

            // The library was already loaded.
            else {
                // If the already loaded cache contains the list of scripts...
                if (typeof(alreadyLoaded[libName]) !== typeof(true)) {
                    // Make sure that we move any of these dependencies to the end of the pile,
                    // because even though we've already loaded the scripts, the library still needs
                    // to be loaded after these scripts are loaded.
                    var requiredScripts = alreadyLoaded[libName].script;

                    jQuery.each(requiredScripts, function(i,value) {
                        var index = scripts.indexOf(value);
                        // Note that we may not find the script in 'scripts' if this library was loaded
                        // by a previous call to loadLibrary();
                        if (index !== -1) {
                            scripts.splice(index, 1);
                            scripts.push(value);
                        }
                    });
                }
            }
        };

        /*
         * This is the handler that handles the return from the ajax call for XML.
         */
        var handler = function(xmlData, path) {
            alreadyLoaded[path] = xmlData;

            jQuery.each(xmlData.script, function(index, script) {
                script = script.replace(/^\//,'');
                scripts.push(script);
            });

            jQuery.each(xmlData.dependency, function(index, lib) {
                trackedXMLLoader(lib, handler);
            });

            if ((register === 0) && !calledBack) {
                calledBack = true;

                var scriptList = scripts.reverse();

                if (scriptList.length > 0) {
                    var js = [];
                    var css = [];
                    jQuery.each(scriptList, function(index, value) {
                        if (value.match(/.css(\?\d+)?$/)) {
                            css.push(value);
                        }
                        else {
                            js.push(value);
                        }
                    });

                    LABKEY.Utils.requiresCSS(css);
                    LABKEY.requiresScript(js, callback, window, true); // LABKEY.Utils.requiresScript() only passes on one of the parameters.
                }
                else {
                    callback();
                }
            }
        };

        jQuery.each(path, function(index, path) {
            trackedXMLLoader(path,handler);
        });
    };

    return {
        loadLibrary: loadLibrary
    };
})();

WNPRC_EHR.API = {
    controllerActions: (function(){
        var getURLForAction = function(action) {
            return WebUtils.API.makeURL(action, {
                controller: "wnprc_ehr" // Okay to hard-code because these are all calls to the wnprc_ehr controller.
            });
        };

        var getChanges = function() {
            var url = getURLForAction('getChanges');
            return WNPRC.API.getJSON(url);
        };

        return {
            getChanges: getChanges
        };
    })()
};

(function() {
    WNPRC_EHR.container = LABKEY.getModuleProperty("ehr", "EHRStudyContainer");

    var qcStore;

    WNPRC_EHR.initQCStates = function () {
        qcStore = LABKEY.ext4.Util.getLookupStore({
            lookup: {
                schemaName:    'study',
                queryName:     'QCState',
                keyColumn:     'RowId',
                displayColumn: 'Label',
                container:      WNPRC_EHR.container
            }
        });
    }


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

    var getQCValueFromLabel = function(label) {
        var index = qcStore.find("Label", label);

        if (index == -1) {
            return "";
        }
        else {
            var rec = qcStore.getAt(index);
            return rec.get("RowId");
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

    WNPRC_EHR.qc = {
        getQCStateLabel:     getQCStateLabel,
        getQCValueFromLabel: getQCValueFromLabel,
        when$QCStoreLoads:   when$QCStoreLoads
    }
})();