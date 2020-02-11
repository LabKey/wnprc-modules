WebUtils.API = (function(){
    // LABKEY should always be defined because it is required by the library, but this little piece
    // ensures that parsers can tell that.
    var LABKEY = window.LABKEY || {ActionURL: function(){}, CSRF: ""};
    var LabKeyURL = LABKEY.ActionURL || {};

    var baseURL = function() {
        return LabKeyURL.getBaseURL();
    };

    var defaultContainerPath = function() {
        return LabKeyURL.getContainer();
    };

    var makeURL = function(action, config) {
        config = config || {};
        var controller = config.controller || LabKeyURL.getController();
        var container  = config.container  || defaultContainerPath();
        return LabKeyURL.buildURL(controller, action, container);
    };

    var makeURLForHTTPAction = function(action, container) {
        return [baseURL(), 'query', container || defaultContainerPath(), action + '.api'].join("/");
    };

    var makeRequest = function(url, config) {
        config = config || {};

        config.credentials = 'same-origin';
        config.headers = config.headers || {};

        /*
         * Some non-HTTP API actions require the CSRF key:
         *   https://www.labkey.org/wiki/home/Documentation/page.view?name=csrfProtection
         *
         * Once the LABKEY library has loaded, this will be added to all requests.  It is important
         * that no @CSRF protected actions are called before this loads, as they will simply appear
         * as 401 Unauthorized requests, indistinguishable from non-logged in requests.
         */
        var LABKEY = window.LABKEY || {};
        if ('CSRF' in LABKEY) {
            config.headers['X-LABKEY-CSRF'] = LABKEY.CSRF;
        }

        return fetch(url, config).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            else {
                var error = new Error(response.statusText);
                error.response = response;
                throw error;
            }
        });
    };

    var extractJSON = function(response) {
        var contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return Promise.resolve({});
        }
    };

    var makeRequestJSON = function(url, config) {
        return makeRequest(url, config)['catch'](function(error) { // YUICompressor doesn't like catch: https://github.com/yui/yuicompressor/issues/203
            return extractJSON(error.response).then(function(jsonData) {
                return Promise.reject(jsonData);
            });
        }).then(function(response){
            return extractJSON(response);
        });
    };

    var selectRowsFromCache = function(schema, query, view) {
        var cache = WebUtils.pageLoadData.queries;

        // The default view is stored in the "" subscript.
        if (_.isUndefined(view)) {
            view = "";
        }

        if ((schema in cache) && (query in cache[schema])  && (view in cache[schema][query])) {
            return cache[schema][query][view];
        }
        else {
            throw new Error("Not in cache.");
        }
    };

    var selectRows = function(schema, query, config) {
        config = config || {};

        // Check for required parameters
        if (!schema) {
            throw "You must specify a schemaName!";
        }
        if (!query) {
            throw "You must specify a queryName!";
        }

        var requestURL;
        if ('container' in config) {
            requestURL = makeURLForHTTPAction('selectRows', config.container);
            delete config.container;
        }
        else {
            requestURL = makeURLForHTTPAction('selectRows');
        }

        var params = {
            schemaName: schema,
            'query.queryName': query
        };
        _.each(config, function(value, key) {
            params['query.' + key] = value;
        });

        if (params['query.columns']) {
            var columns = params['query.columns'];

            if (_.isArray(columns)) {
                columns = columns.join(",");
            }
            params['query.columns'] = columns;
        }

        if (config.parameters) {
            for (var propName in config.parameters) {
                if (config.parameters.hasOwnProperty(propName)) {
                    params['query.param.' + propName] = config.parameters[propName];
                }
            }
        }


        params = $.param(params);
        if (params.length > 0) {
            requestURL += "?" + params;
        }

        return makeRequest(requestURL).then(function(response) {
            return response.json();
        });
    };

    // Define the types to accept for makeAPIRequest.
    var acceptableAPITypes = {
        'insert': true,
        'update': true,
        'delete': true
    };

    var buildTransactionObject = function(type, schema, query, rows, extraContent) {
        // Check the passed in parameters
        var error = !_.isString(schema) ? 'schema' : !_.isString(query) ? 'query' : !_.isArray(rows) ? 'rows' : "";
        if (error !== "") {
            throw 'You must specify a valid value for the ' + error + ' argument';
        }

        // Check the passed in type
        if ( !acceptableAPITypes[type] ) {
            throw type + ' is not a valid action for the LabKey API.  Please select "insert", "update", or "delete".';
        }

        var obj = {
            schemaName: schema,
            queryName:  query,
            command:    type,
            rows:       rows
        };

        if (extraContent) {
            obj.extraContext = extraContent;
        }

        return obj;
    };

    // A generic API request function, since updateRows/deleteRows/insertRows are so similar.
    var makeAPIRequest = function(type, schema, query, rows, config) {
        config = config || {};

        var command = buildTransactionObject(type, schema, query, rows, config.extraContext);
        return makeAPIRequestFromCommands([command], config);
    };

    var makeAPIRequestFromCommands = function(commands, config) {
        config = config || {};

        var requestConfig = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commands: commands,
                containerPath: config.container,
                validateOnly: config.validateOnly,
                extraContext: config.extraContext
            })
        };

        var url;
        if ('container' in config) {
            url = makeURLForHTTPAction('saveRows', config.container);
        }
        else {
            url = makeURLForHTTPAction('saveRows');
        }

        return makeRequestJSON(url, requestConfig);
    };

    var updateRows = function(schema, query, rows, config) { return makeAPIRequest('update', schema, query, rows, config) };
    var deleteRows = function(schema, query, rows, config) { return makeAPIRequest('delete', schema, query, rows, config) };
    var insertRows = function(schema, query, rows, config) { return makeAPIRequest('insert', schema, query, rows, config) };

    // API to execute raw SQL in LABKEY
    var executeSql = function(schema, sql) {
        return makeRequestJSON(makeURLForHTTPAction('executeSql'), {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                schemaName: schema,
                sql: sql
            })
        });
    };

    var getText = function(path) {
        return makeRequest(baseURL() + path).then(function(response) {
            return response.text();
        });
    };

    var get = function(url, config) {
        return makeRequest(url, config);
    };

    var getJSON = function(url, config) {
        return makeRequestJSON(url, config);
    };

    var postHandleData = function(url, data, config) {
        // Remove any trailing ?'s.
        url = _.rtrim(url, "?");

        data = $.param(data);
        if (data.length > 0) {
            url += '?' + data;
        }

        config = _.extendOwn(config || {}, {
            method: 'post'//,
            //body: JSON.stringify(data)
        });

        return {
            config: config,
            url:    url
        };
    };

    var post = function(url, data, config) {
        var requestData = postHandleData(url, data, config);
        return makeRequest(requestData.url, requestData.config);
    };

    var postJSON = function(url, data, config) {
        var requestData = postHandleData(url, data, config);
        return makeRequestJSON(requestData.url, _.extend(requestData.config, {
            method: 'post',
            headers: {
                'Accept':       'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }));
    };

    var dbFormat = "YYYY/MM/DD HH:mm:ss";

    var formatDateForDB = function(momentObj) {
        return momentObj.format(dbFormat)
    };

    var parseDateFromDB = function(text) {
        return moment(text, dbFormat);
    };

    var displayDate = function(date) {
        var m = moment.isMoment(date) ? date : moment(date, "YYYY/MM/DD HH:mm:ss");
        return m.calendar(null, {
            sameElse: 'MMM D[,] YYYY'
        });
    };

    return {
        makeURL:    makeURL,
        selectRows: selectRows,
        updateRows: updateRows,
        deleteRows: deleteRows,
        insertRows: insertRows,
        executeSql: executeSql,
        getText:    getText,
        get:        get,
        getJSON:    getJSON,
        post:       post,
        postJSON:   postJSON,
        selectRowsFromCache: selectRowsFromCache,
        formatDateForDB:     formatDateForDB,
        parseDateFromDB:     parseDateFromDB,
        displayDate:         displayDate
    };
})();