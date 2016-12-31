/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
require(['classify', 'supersqlstore'], function(Classify, SuperSQLStore) {
    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    loadCss(LABKEY.contextPath + '/ehr/HousingAndAssignmentHistory.css');


    var $ = jQuery;

    var Utils = (function () {
        var obj = {};

        obj.msInAYear = 31556900000;

        obj.yearsOfDifference = function (date1, date2) {
            date1 = new Date(date1);
            date2 = new Date(date2);

            var milliseconds = Math.abs(date1 - date2);

            return milliseconds / obj.msInAYear;
        };

        obj.applyListenerToAllObservablesInObject = function (Object, listener, context) {
            var self = this;

            var applyListener = function (obj) {
                for (var property in obj) {
                    if (ko.isObservable(obj[property])) {
                        obj[property].subscribe(listener, context);
                    }
                    else if ((_.keys(obj[property])).length > 0) {
                        applyListener(obj[property]);
                    }
                }
            };

            applyListener(Object);
        };

        return obj;
    })();

    var RowLoader = Classify.newClass({
        constructor: function (config) {
            var self = this;
            config = config || {};
            this.queries = config.queries || {};

            this.datasets = {};

            this._loadedDatasets = {};
            jQuery.each(this.queries, function (key, value) {
                self._loadedDatasets[key] = ko.observable(false);
            });

            this._views = config.views || {};

            this._d3views = config.d3views || {};
            jQuery.each(this._d3views, function (key, value) {
                var dataset = value.dataset;

                // Dataset can either be a function we want to add as a view or the name
                // of a view.  If we're passed the actual view function, add it to our list
                // of views and clear the dataset key, so that getd3View will use the name of
                // the d3View to lookup the view.
                if (typeof dataset === 'function') {
                    self._views[key] = value.dataset;
                    delete value.dataset;
                }
            });
        },
        methods: {
            addQuery: function (queryName, queryConfig) {
                this.queries[queryName] = queryConfig;
                this._loadedDatasets[queryName] = ko.observable(false);
            },
            runQueries: function () {
                var self = this;
                jQuery.each(this.queries, function (key, value) {
                    self.datasets[key] = null;
                });

                jQuery.each(this.queries, function (key, value) {
                    var config = value;
                    config.success = function (data) {
                        self.datasets[key] = new SuperSQLStore.ObservableTable(data.rows);

                        // Mark the dataset as loaded.
                        self._loadedDatasets[key](true);

                        if (self.allQueriesLoaded() && ('doneLoading' in self) && (typeof(self.doneLoading) === 'function')) {
                            self.doneLoading();
                        }
                    };
                    LABKEY.Query.selectRows(config);
                });
            },
            getView: function (name) {
                var self = this;
                var viewFn = function () {
                    return []
                };
                if ((name in this._views) && (typeof this._views[name] === 'function')) {
                    viewFn = function () {
                        // Ensure we call the view in the context of the main object;

                        var dataset = self._views[name].apply(self, [name].concat(arguments));

                        if ('length' in dataset) {
                            return dataset;
                        }
                        else {
                            return [];
                        }
                    };
                }

                return viewFn;
            },
            getd3View: function (name) {
                var self = this;
                var d3view = {
                    dataset: function () {
                        return []
                    },
                    formatFn: function (selection) {
                        return selection;
                    },
                    baseType: 'circle',
                    settings: {}
                };

                if (name in self._d3views) {
                    d3view.formatFn = self._d3views[name].formatFn;
                    d3view.baseType = self._d3views[name].baseType;
                    d3view.settings = self._d3views[name].settings;
                }
                else {
                    throw "Invalid name for d3View."
                }

                var viewName = name;
                if (typeof(self._d3views[name].dataset) !== 'undefined') {
                    viewName = self._d3views[name].dataset;
                }
                d3view.dataset = this.getView(name);

                d3view.ready = self.allQueriesLoaded;
                d3view.datasets = self.datasets;
                return d3view;
            }
        },
        computeds: {
            unloadedQueries: function () {
                var self = this;
                var unloadedQueries = [];

                jQuery.each(self._loadedDatasets, function (name, status) {
                    if (!status()) {
                        unloadedQueries.push(name);
                    }
                });

                return unloadedQueries;
            },
            allQueriesLoaded: function () {
                return this.unloadedQueries().length === 0;
            }
        }
    });

    var d3GraphRegion = Classify.newClass({
        constructor: function (config) {
            var self = this;
            var badConstructorConfig = "Missing required parameters to d3GraphRegion constructor.";

            // Validate that we have a graph and cache a reference to it.
            if (!config || !('graph' in config)) {
                throw badConstructorConfig;
            }
            this.graph = config.graph;

            // Check for the required parameters from the constructor configuration.
            if (ko.isComputed(config.width) && ko.isComputed(config.height) && (config.origin)
                    && ko.isComputed(config.origin.x) && ko.isComputed(config.origin.y) && (config.name)
            ) {
                this.width = config.width;
                this.height = config.height;
                this.origin = config.origin;
                this.name = ko.observable(config.name);
            }
            else {
                throw badConstructorConfig;
            }
            var newGuid = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
            };
            self.guid = ko.observable(newGuid());
        },
        computeds: {
            classname: function () {
                return "d3-graph-region-" + this.name();
            },
            translateText: function () {
                return "translate(" + this.origin.x() + "," + this.origin.y() + ")";
            },
            isChart: function () {
                return this.name() === 'chart';
            },
            maskID: function() {
                return this.guid();
            }
        }
    });

    var d3GraphDataPlot = Classify.newClass({
        parent: d3GraphRegion,
        constructor: function (config) {
            var self = this;
            var badConstructorConfig = "Missing required parameters to d3GraphDataPlot constructor.";

            if (('chartRegion' in config) && ('d3view' in config)) {
                this.chartRegion = config.chartRegion;
                this.d3view = config.d3view;
            }
            else {
                throw badConstructorConfig;
            }

            //Subscribe to our d3view
            this.d3view.ready.subscribe(function (newValue) {
                if (newValue === true) {
                    self.draw();
                }
            });

            d3.select(self.graph.$svg.get(0)).call(self.chartRegion.zoom);

            // Update the plot whenever one of the settings changes.
            Utils.applyListenerToAllObservablesInObject(this.d3view.settings, this.update, this);
        },
        methods: {
            plotNode: function () {
                var $svg = this.graph.$svg;
                var $plot = $svg.find('.' + this.classId() + ' g.data-container');

                return $plot[0];
            },
            selectAll: function () {
                return d3.select(this.plotNode()).selectAll(this.d3view.baseType);
            },
            selectAllWithData: function () {
                var chain = this.selectAll();

                var dataset = this.d3view.dataset();
                if (('key' in dataset[0]) && (typeof dataset[0].key === 'function')) {
                    var keyFn = function (d, i) {
                        return d.key();
                    };
                    chain = chain.data(dataset, keyFn);
                }
                else {
                    chain = chain.data(dataset);
                }

                return chain;
            },
            update: function (config) {
                var chain = this.selectAllWithData();//.transition();
                this.d3view.formatFn.call(this, chain, {xOnly: config.xOnly});
            },
            draw: function () {
                var chain = this.selectAllWithData();

                chain.enter().append(this.d3view.baseType);
                this.d3view.formatFn.call(this, chain);
            }
        },
        computeds: {
            classId: function () {
                return 'd3-plot-' + this.name();
            }
        }
    });

    var d3GraphChart = Classify.newClass({
        parent: d3GraphRegion,
        constructor: function (config) {
            var self = this;
            var badConstructorConfig = "Missing required parameters to d3GraphChart constructor.";

            this.xScale = null || config.xScale;
            this.xAxis  = null || config.xAxis;
            this.maxXaxisVal = undefined;
            this.zoom   = d3.behavior.zoom().on("zoom", function() {
                if (_.isUndefined(self.zoom.x()) ) {
                    self.zoom.x(self.xScale);
                }

                var translate  = self.zoom.translate();
                var xTranslate = translate[0];
                var yTranslate = translate[1];

                xTranslate = Math.min(0, Math.max(xTranslate, self.width() - self.width() * self.zoom.scale()));

                self.zoom.translate([xTranslate, yTranslate]);

                self.xAxis.call(d3.svg.axis().scale(self.xScale).orient('bottom'));

                jQuery.each(self.plots(), function(index, plot) {
                    plot.update({xOnly: true});
                });
            });
            this.zoom.scaleExtent([1,16]);

            self.plots = ko.observableArray([]);
            if (('plots' in config) && (config.plots.length > 0)) {
                var plotHeight = ko.computed(function () {
                    if (config.plotStyle === "vstack") {
                        return self.height() / config.plots.length;
                    }
                    else {
                        return self.height();
                    }
                });

                jQuery.each(config.plots, function (index, plot) {
                    self.plots.push(new d3GraphDataPlot({
                        name: plot.name,
                        graph: self.graph,
                        chartRegion: self,
                        origin: {
                            x: ko.computed(function () {
                                return 0
                            }),
                            y: ko.computed(function () {
                                if (config.plotStyle === 'vstack') {
                                    return (self.height() / config.plots.length) * index;
                                }
                                else {
                                    return 0;
                                }
                            })
                        },
                        width: self.width,
                        height: plotHeight,
                        d3view: plot.d3view
                    }));
                });
            }
            else {
                throw badConstructorConfig;
            }
        }
    });

    var d3Graph = Classify.newClass({
        constructor: function (config) {
            var self = this;
            config = config || {};

            // Grab the passed in setting for the node
            this.$node = $(config.node);
            if (this.$node.length !== 1) {
                throw("Invalid value for node passed into d3Graph constructor.");
            }

            // Calculate the svg node
            if (this.$node.is('svg')) {
                this.$svg = $node;
            }
            else {
                this.$svg = this.$node.find('svg');
            }

            // Check to make sure we have a good selection for $svg
            if (this.$svg.length !== 1) {
                if (this.$svg.length > 1) {
                    throw("Node passed into d3Graph constructor was not specific enough to get a single svg element");
                }
                else {
                    //Just create one
                    this.$svg = this.$node.append('<svg></svg>');
                }
            }

            // Set up the basic settings
            var margin = _.extend({top: 50, right: 50, bottom: 50, left: 50}, config.settings.margin);
            delete config.settings.margin;
            this.settings = _.extend({
                separateBands: false,
                margin: margin,
                graphWidth: 900,
                graphHeight: 400,
                fitContainer: ''
            }, config.settings);
            this.settings = ko.mapping.fromJS(this.settings);

            if (this.settings.fitContainer() !== '') {
                var $container = self.$node.closest(self.settings.fitContainer());
                var fitToContainer = function () {
                    var containerWidth = $container.width();
                    var windowWidth = $(window).width() - 10;

                    self.settings.graphWidth(_.min([containerWidth, windowWidth]));
                    //self.settings.graphHeight($container.height());
                };
                fitToContainer();
                $(window).resize(fitToContainer);
            }


            // Define a bunch of reusable computeds for the regions.
            var innerLeftMargin = ko.computed(function () {
                return 0 + self.settings.margin.left();
            });
            var innerTopMargin = ko.computed(function () {
                return 0 + self.settings.margin.top();
            });
            var innerWidth = ko.computed(function () {
                var graphWidth = self.settings.graphWidth();
                var margin = self.settings.margin;

                var innerWidth = graphWidth - margin.right() - margin.left();

                if (innerWidth < 0) {
                    return 0;
                }
                return innerWidth;
            });
            var innerHeight = ko.computed(function () {
                var graphHeight = self.settings.graphHeight();
                var margin = self.settings.margin;

                var innerHeight = graphHeight - margin.top() - margin.bottom();

                if ( innerHeight < 0 ) {
                    return 0;
                }
                return innerHeight;
            });
            var zero = ko.computed(function () {
                return 0;
            });


            // Make the regions
            this.regions = {
                top: new d3GraphRegion({
                    name: "top",
                    graph: self,
                    origin: {
                        x: innerLeftMargin,
                        y: zero
                    },
                    width: innerWidth,
                    height: innerTopMargin
                }),
                left: new d3GraphRegion({
                    name: "left",
                    graph: self,
                    origin: {
                        x: zero,
                        y: innerTopMargin
                    },
                    width: innerLeftMargin,
                    height: innerHeight
                }),
                bottom: new d3GraphRegion({
                    name: "bottom",
                    graph: self,
                    origin: {
                        x: innerLeftMargin,
                        y: ko.computed(function () {
                            return innerTopMargin() + innerHeight()
                        })
                    },
                    width: innerWidth,
                    height: ko.computed(function () {
                        return self.settings.margin.bottom();
                    })
                }),
                right: new d3GraphRegion({
                    name: "right",
                    graph: self,
                    origin: {
                        x: ko.computed(function () {
                            return innerLeftMargin() + innerWidth();
                        }),
                        y: innerTopMargin
                    },
                    width: ko.computed(function () {
                        return self.settings.margin.right();
                    }),
                    height: innerHeight
                })
            };

            this.regions.chart = new d3GraphChart({
                name: "chart",
                graph: self,
                origin: {
                    x: innerLeftMargin,
                    y: innerTopMargin
                },
                width: innerWidth,
                height: innerHeight,
                plotStyle: config.plotStyle,
                plots: config.plots || []
            });

            this.debugShowOutline = ko.observable(false);
            if (config.debugShowOutline) {
                this.debugShowOutline(config.debugShowOutline);
            }

            self.regionsArray = [];
            jQuery.each(this.regions, function (name, region) {
                self.regionsArray.push(region);
            });

            this.store = config.store;
            this.store.allQueriesLoaded.subscribe(function () {
                if (('onDraw' in this.hooks) && (typeof this.hooks.onDraw === 'function')) {
                    this.hooks.onDraw(this);
                }
            }, this);


            this.hooks = {
                onDraw: config.onDraw
            }
        }
    });

    ko.components.register('d3-graph', {
        template: {require: 'text!/ehr/d3-graph-template.html'},
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return params.graph;
            }
        }
    });

    var hideTooltip = function(d3$tooltip) {
        d3$tooltip.transition()
                .duration(200)
                .style("pointer-events","none")
                .style("opacity", 0);
    };
    var showTooltip = function(d3$tooltip) {
        d3$tooltip.transition()
                .duration(200)
                .style("pointer-events",null)
                .style("opacity", .9);
    };

    ko.components.register("animal-housing", {
        template: {require: 'text!/ehr/HousingAndAssignmentHistoryTemplate.html'},
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var animalid = params.animalid;

                var VM = {
                    selectedHousingItem: {
                        stuck: ko.observable(false),
                        cage: ko.observable(''),
                        description: ko.observable(''),
                        startDate: ko.observable(''),
                        endDate: ko.observable(''),
                        reason: ko.observable(''),
                        room: ko.observable('')
                    },
                    selectedAssignmentItem: {
                        stuck: ko.observable(false),
                        description: ko.observable(''),
                        startDate: ko.observable(''),
                        endDate: ko.observable(''),
                        project: ko.observable(''),
                        projectTitle: ko.observable(),
                        code: ko.observable()
                    }
                };

                _.mixin(s.exports());

                VM.selectedHousingItem.descriptionTitleCase = ko.pureComputed(function () {
                    return _.titleize(VM.selectedHousingItem.description());
                });


                VM.selectedAssignmentItem.descriptionTitleCase = ko.pureComputed(function () {
                    return _.titleize(VM.selectedAssignmentItem.description());
                });

                var store = new RowLoader({
                    queries: {
                        assignments: {
                            schemaName: 'study',
                            queryName: 'assignment',
                            columns: 'lsid,project,project/avail,project/avail/description,date,enddate,project/Title',
                            filterArray: [
                                LABKEY.Filter.create('id', animalid, LABKEY.Filter.Types.EQUAL)
                            ]
                        },
                        demographics: {
                            schemaName: 'study',
                            queryName: 'demographics',
                            columns: '*',
                            filterArray: [
                                LABKEY.Filter.create('id', animalid, LABKEY.Filter.Types.EQUAL)
                            ]
                        },
                        housing: {
                            schemaName: 'study',
                            queryName: 'Housing',
                            columns: 'id,date,enddate,room,cage,cond,reason,cond/title',
                            filterArray: [
                                LABKEY.Filter.create('id', animalid, LABKEY.Filter.Types.EQUAL)
                            ]
                        }
                    },
                    d3views: {
                        assignments: {
                            dataset: function (name) {
                                var self = this;
                                var dataset = [];

                                var animalInfo = self.datasets.demographics.rows()[0];
                                var dob = new Date(animalInfo.birth());

                                var rows = [];
                                var stripData = function(data) {
                                    return {
                                        start: data.startAge(),
                                        end:   data.endAge()
                                    };
                                };
                                var getRow = function( data ) {
                                    var newBlock = stripData(data);

                                    // The first row will always be placed in the bottom row.
                                    if ( rows.length === 0 ) {
                                        rows.push([newBlock]);
                                        return 0;
                                    }

                                    var hasConflict = function(blockInRow) {
                                        if ( (newBlock.start > blockInRow.end) || (newBlock.end < blockInRow.start) ) {
                                            // There is no conflict.
                                            return false;
                                        }
                                        else {
                                            return true;
                                        }
                                    };

                                    var rowToAddTo = _.findIndex(rows, function(innerRow) {
                                        // Look for a conflict
                                        if ( _.findIndex(innerRow, hasConflict) === -1 ) {
                                            //No conflict
                                            return true;
                                        }
                                        else {
                                            return false;
                                        }
                                    });

                                    if ( rowToAddTo === -1 ) {
                                        rows.push([newBlock]);
                                        self.getd3View(name).settings.numRows = rows.length;
                                        return rows.length - 1;
                                    }
                                    else {
                                        rows[rowToAddTo].push(newBlock);
                                        return rowToAddTo;
                                    }
                                };

                                self.datasets.assignments.each(function (row) {
                                    var data = {};

                                    data.key          = ko.pureComputed(function () { return row._originalData.lsid;                     });
                                    data.id           = ko.pureComputed(function () { return row.getColumn('id');                        });
                                    data.project      = ko.pureComputed(function () { return row.getColumn("project");                   });
                                    data.avail        = ko.pureComputed(function () { return row.getColumn('project/avail');             });
                                    data.availDesc    = ko.pureComputed(function () { return row.getColumn('project/avail/description'); });
                                    data.projectTitle = ko.pureComputed(function () { return row.getColumn('project/Title');             });
                                    data.row          = ko.pureComputed(function () { return row;                                        });

                                    data.startAge = ko.pureComputed(function () {
                                        var startDate = row.getColumn('date');
                                        return Utils.yearsOfDifference(startDate, dob);
                                    });

                                    data.endAge = ko.pureComputed(function() {
                                        var endDate = row.getColumn('enddate') || new Date();
                                        return Utils.yearsOfDifference(endDate, dob);
                                    });

                                    data.duration = ko.pureComputed(function () {
                                        var endDate = row.getColumn('enddate') || new Date();
                                        var startDate = row.getColumn('date');
                                        var duration = Utils.yearsOfDifference(endDate, startDate);

                                        if (duration === 0) {
                                            duration = (1 / 365.25);
                                        }

                                        return duration;
                                    });
                                    dataset.push(data);
                                });

                                dataset = _.sortBy(dataset, function (d) {
                                    return (0 - d.duration())
                                });

                                jQuery.each(dataset, function(index, data) {
                                    data.displayRow = getRow(data);
                                });

                                return dataset;
                            },
                            formatFn: function (selection, config) {
                                config = config || {};
                                var self = this;
                                var barHeight = self.height() * .8;

                                var animalInfo = self.d3view.datasets.demographics.rows()[0];
                                var dob = new Date(animalInfo.birth());
                                var curAge = Utils.yearsOfDifference(new Date(), dob);
                                var endOfXScaleDomain = curAge;
                                if (animalInfo.death() !== "") {
                                    endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.death(), dob);
                                }
                                else if (animalInfo.departdate() !== "") {
                                    endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.departdate(), dob);
                                }

                                if (this.chartRegion.xScale === null || _.isUndefined(this.chartRegion.xScale) ) {
                                    this.chartRegion.xScale = d3.scale.linear()
                                            .domain([0, endOfXScaleDomain])
                                            .range([0, self.width()])
                                            //.clamp(true)
                                            .nice();
                                }

                                selection = selection
                                        .attr("x", function (d, i) {
                                            return self.chartRegion.xScale(d.startAge());
                                        })
                                        .attr('width', function (d, i) {
                                            var width =  self.chartRegion.xScale(d.startAge() + d.duration()) - self.chartRegion.xScale(d.startAge());
                                            var minWidth = 5;

                                            if (width < minWidth) {
                                                width = minWidth;
                                            }
                                            return width;
                                        });

                                if (config.xOnly) {
                                    return selection;
                                }

                                var yScale = d3.scale.ordinal()
                                        .domain(d3.range(self.d3view.settings.numRows))
                                        .rangeBands([self.height(), 0], .1, .2);

                                var heightFunction = (function () {
                                    var returnVal = barHeight;
                                    //if (self.d3view.settings.separateBars()) {
                                        returnVal = yScale.rangeBand();
                                    //}

                                    return returnVal;
                                })();

                                var yValueFunction = (function () {
                                    var returnVal = (self.height() / 2) - (barHeight / 2);
                                    //if (self.d3view.settings.separateBars()) {
                                        returnVal = function (d, i) {
                                            return yScale(d.displayRow);
                                        };
                                    //}

                                    return returnVal;
                                })();

                                selection = selection
                                        .attr('y', yValueFunction)
                                        .attr('height', heightFunction)
                                        .style('fill', function (d, i) {
                                            var colormap = {
                                                r: "red",
                                                q: "orange",
                                                u: "green",
                                                t: "blue",
                                                b: "pink",
                                                v: "url(#exemptionPattern)",
                                                p: "url(#pendingPattern)"
                                            };
                                            if (d.avail() in colormap) {
                                                return colormap[d.avail()];
                                            }
                                            return "black";
                                        })
                                        .style('stroke-width', '1')
                                        .style('stroke', 'black')
                                        .attr('opacity', '0.8');

                                // If this an update, and transition has already been called,
                                // there is no "on" method.
                                if ('on' in selection) {
                                    selection = selection.on('mouseover', function (d, i) {
                                        d3.select(this).style('stroke', 'red').style('stroke-width', 2);

                                        var formatDate = function (dateString) {
                                            if (dateString === '') {
                                                dateString = new Date();
                                            }
                                            return (new Date(dateString)).format('M d, Y');
                                        };

                                        if (!VM.selectedAssignmentItem.stuck()) {
                                            var rawRow = d.row();
                                            VM.selectedAssignmentItem.startDate(formatDate(rawRow.date()));
                                            VM.selectedAssignmentItem.endDate(formatDate(rawRow.enddate()));
                                            VM.selectedAssignmentItem.code(rawRow['project/avail']());
                                            VM.selectedAssignmentItem.description(d.availDesc());
                                            VM.selectedAssignmentItem.project(d.project());
                                            VM.selectedAssignmentItem.projectTitle(d.projectTitle());

                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-assignments-tooltip');

                                            var $this = $(this);
                                            var thisPosition = $this.position();
                                            var top = thisPosition.top - $tooltip.height() - 5;
                                            var left = thisPosition.left + ($this.attr('width') / 2) - ($tooltip.width() / 2);

                                            //Make sure the tooltip doesn't go off the left side of the graph:
                                            if (left < 0) { left = 0; }

                                            var d3$tooltip = d3.select($tooltip[0])
                                                    .style("left", left + "px")
                                                    .style("top", top + "px");

                                            showTooltip(d3$tooltip);
                                        }
                                    }).on('mouseout', function (d, i) {
                                        d3.select(this).style('stroke-width', '1').style('stroke', 'black');

                                        if (!VM.selectedAssignmentItem.stuck()) {
                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-assignments-tooltip');
                                            var d3$tooltip = d3.select($tooltip[0]);

                                            hideTooltip(d3$tooltip);
                                        }
                                    }).on('click', function (d, i) {
                                        if (VM.selectedAssignmentItem.stuck()) {
                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-assignments-tooltip');
                                            var d3$tooltip = d3.select($tooltip[0]);

                                            hideTooltip(d3$tooltip);
                                        }
                                        VM.selectedAssignmentItem.stuck(!VM.selectedAssignmentItem.stuck());
                                        d3.event.stopPropagation();
                                    });
                                }

                                return selection;
                            },
                            baseType: 'rect',
                            settings: {
                                numRows:      0
                            }
                        },
                        housing: {
                            dataset: function () {
                                var self = this;
                                var dataset = [];

                                var animalInfo = self.datasets.demographics.rows()[0];
                                var dob = new Date(animalInfo.birth());

                                self.datasets.housing.each(function (row) {
                                    var data = {};

                                    data.startAge = ko.pureComputed(function () {
                                        var startDate = row.getColumn('date');
                                        return Utils.yearsOfDifference(startDate, dob);
                                    });

                                    data.duration = ko.pureComputed(function () {
                                        var startDate = row.getColumn('date');
                                        var endDate = row.getColumn('enddate') || new Date();

                                        var duration = Utils.yearsOfDifference(endDate, startDate);

                                        return duration;
                                    });

                                    // Add a bunch of aliases
                                    data.housingCode   = ko.pureComputed(function () { return row.getColumn('cond')       });
                                    data.housingDesc   = ko.pureComputed(function () { return row.getColumn('cond/title') });
                                    data.housingReason = ko.pureComputed(function () { return row.getColumn('reason')     });
                                    data.room          = ko.pureComputed(function () { return row.getColumn('room')       });
                                    data.cage          = ko.pureComputed(function () { return row.getColumn('cage')       });
                                    data.id            = ko.pureComputed(function () { return row.getColumn('Id')         });
                                    data.key           = ko.pureComputed(function () { return row.getColumn('date')       });
                                    data.row           = ko.pureComputed(function () { return row;                        });

                                    dataset.push(data);
                                });

                                return dataset;
                            },
                            formatFn: function (selection, config) {
                                config = config || {};
                                var self = this;
                                var chart = this.chartRegion;
                                var barHeight = this.height() * .8;

                                var animalInfo = self.d3view.datasets.demographics.rows()[0];
                                var dob = new Date(animalInfo.birth());
                                var curAge = Utils.yearsOfDifference(new Date(), dob);
                                var endOfXScaleDomain = curAge;
                                if (animalInfo.death() !== "") {
                                    endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.death(), dob);
                                }
                                else if (animalInfo.departdate() !== "") {
                                    endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.departdate(), dob);
                                }

                                if (this.chartRegion.xScale === null || _.isUndefined(this.chartRegion.xScale) ) {
                                    this.chartRegion.xScale = d3.scale.linear()
                                            .domain([0, endOfXScaleDomain])
                                            .range([0, self.width()])
                                            //.clamp(true)
                                            .nice();
                                }
                                this.chartRegion.maxXaxisVal = endOfXScaleDomain;

                                selection = selection
                                        .attr("x", function (d, i) {
                                            return self.chartRegion.xScale(d.startAge());
                                        })
                                        .attr('width', function (d, i) {
                                            var width =  self.chartRegion.xScale(d.startAge() + d.duration()) - self.chartRegion.xScale(d.startAge());
                                            var minWidth = 5;

                                            if (width < minWidth) {
                                                width = minWidth;
                                            }
                                            return width;
                                        });

                                if (config.xOnly) {
                                    return selection;
                                }


                                var yScale = d3.scale.ordinal()
                                        .domain(d3.range(self.d3view.datasets.housing.rows().length))
                                        .rangeBands([0, self.height()], .2);

                                var yValFn = function (d, i) {
                                    if (self.d3view.settings.separateBars()) {
                                        return yScale(i);
                                    }
                                    else {
                                        return (self.height() / 2) - (barHeight / 2);
                                    }
                                };

                                selection = selection
                                        .attr('y', yValFn)
                                        .attr('height', function (d, i) {
                                            if (self.d3view.settings.separateBars()) {
                                                return yScale.rangeBand();
                                            }
                                            else {
                                                return barHeight;
                                            }
                                        })
                                        .style('fill', function (d, i) {
                                            var colormap = {
                                                s: "red"
                                            };
                                            if (d.housingCode() in colormap) {
                                                return colormap[d.housingCode()];
                                            }
                                            return "green";
                                        })
                                        .style('stroke-width', '1')
                                        .style('stroke', 'black')
                                        .attr('opacity', '0.8');

                                // If this an update, and transition has already been called,
                                // there is no "on" method.
                                if ('on' in selection) {
                                    selection = selection.on('mouseover', function (d, i) {
                                        d3.select(this).style('stroke', 'red').style('stroke-width', 2);

                                        var formatDate = function (dateString) {
                                            if (dateString === '') {
                                                dateString = new Date();
                                            }
                                            return (new Date(dateString)).format('M d, Y');
                                        };

                                        if (!VM.selectedHousingItem.stuck()) {
                                            var rawRow = d.row();
                                            VM.selectedHousingItem.cage(d.cage());
                                            VM.selectedHousingItem.room(d.room());
                                            VM.selectedHousingItem.startDate(formatDate(rawRow.date()));
                                            VM.selectedHousingItem.endDate(formatDate(rawRow.enddate()));
                                            VM.selectedHousingItem.description(d.housingDesc());
                                            VM.selectedHousingItem.reason(d.housingReason());

                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-housing-tooltip');

                                            var $this = $(this);
                                            var thisPosition = $this.position();
                                            var top = thisPosition.top - $tooltip.height() - 5;
                                            var left = thisPosition.left + ($this.attr('width') / 2) - ($tooltip.width() / 2);

                                            //Make sure the tooltip doesn't go off the left side of the graph:
                                            if (left < 0) { left = 0; }

                                            var d3$tooltip = d3.select($tooltip[0])
                                                    .style("left", left + "px")
                                                    .style("top", top + "px");

                                            showTooltip(d3$tooltip);
                                        }
                                    }).on('mouseout', function (d, i) {
                                        d3.select(this).style('stroke-width', '1').style('stroke', 'black');

                                        if (!VM.selectedHousingItem.stuck()) {
                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-housing-tooltip');
                                            var d3$tooltip = d3.select($tooltip[0]);

                                            hideTooltip(d3$tooltip);
                                        }
                                    }).on('click', function (d, i) {
                                        if (VM.selectedHousingItem.stuck()) {
                                            var $tooltip = $(this).closest('d3-graph').parent().find('.animal-housing-tooltip');
                                            var d3$tooltip = d3.select($tooltip[0]);

                                            hideTooltip(d3$tooltip);
                                        }
                                        VM.selectedHousingItem.stuck(!VM.selectedHousingItem.stuck());

                                        d3.event.stopPropagation();
                                    });

                                }


                                return selection;
                            },
                            baseType: 'rect',
                            settings: {
                                separateBars: ko.observable(false)
                            }
                        }
                    }
                });
                store.runQueries();

                VM.housingBarMode = ko.computed({
                    read: function () {
                        return store.getd3View('housing').settings.separateBars();
                    },
                    write: function (value) {
                        store.getd3View('housing').settings.separateBars(value);
                    },
                    owner: this
                });

                var config = {
                    node: $(componentInfo.element).find('d3-graph')[0],
                    plots: [
                        {
                            name: "Housing",
                            d3view: store.getd3View('housing')
                        },
                        {
                            name: "Assignments",
                            d3view: store.getd3View('assignments')
                        }
                    ],
                    //debugShowOutline: true,
                    plotStyle: "vstack",
                    settings: {
                        margin: {
                            top: 0,
                            right: 125,
                            left: 25
                        },
                        fitContainer: 'div'
                    },
                    store: store,
                    onDraw: function (graph) {
                        var self = this;
                        var $node = graph.$svg.find('.' + graph.regions.bottom.classname());
                        if ( $node.length !== 1 ) {
                            console.warn("Couldn't find node (or too many possible choices).  Going to attempt to rebind component.",$node);
                            var node = graph.$svg.closest('animal-housing').get(0);
                            ko.cleanNode(node);
                            ko.applyBindings({}, node);
                        }
                        else {
                            //console.log("Found node: ", graph.$svg);
                        }

                        var d3$node = d3.select($node[0]);
                        var bottomRegion = graph.regions.bottom;

                        var xAxis = d3$node.append('g').classed("x-axis", true);

                        var animalInfo = graph.store.datasets.demographics.rows()[0];
                        var dob = new Date(animalInfo.birth());
                        var curAge = Utils.yearsOfDifference(new Date(), dob);

                        var endOfXScaleDomain = curAge;
                        if (animalInfo.death() !== "") {
                            endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.death(), dob);
                        }
                        else if (animalInfo.departdate() !== "") {
                            endOfXScaleDomain = Utils.yearsOfDifference(animalInfo.departdate(), dob);
                        }

                        if (graph.regions.chart.xScale === null || _.isUndefined(graph.regions.chart.xScale) ) {
                            graph.regions.chart.xScale = d3.scale.linear()
                                    .domain([0, endOfXScaleDomain])
                                    .range([0, self.width()])
                                    //.clamp(true)
                                    .nice();

                        }

                        graph.regions.chart.xAxis = xAxis;
                        graph.regions.chart.xAxis.call(d3.svg.axis().scale(graph.regions.chart.xScale).orient('bottom'));

                        d3$node.append("text")
                                .attr("class", "x-label")
                                .attr("text-anchor", "middle")
                                .attr("x", bottomRegion.width() / 2)
                                .attr("y", bottomRegion.height() / 2 + 10)
                                .text("Age of Animal (in years)");


                        var leftRegion = graph.regions.left;
                        var $leftNode = graph.$svg.find('.' + leftRegion.classname());
                        var d3$leftNode = d3.select($leftNode[0]);

                        var x = leftRegion.width() / 2;
                        var y = leftRegion.height() / 4;

                        var addlabel = function (text, x, y) {
                            d3$leftNode.append("text")
                                    .attr("class", "x-label")
                                    .attr('text-anchor', "middle")
                                    .attr('x', x)
                                    .attr('y', y)
                                    .attr('transform', 'rotate(270, ' + x + ', ' + y + ')')
                                    .text(text);
                        };
                        addlabel("Housing", x, y);
                        addlabel("Assignments", x, 3 * y);

                        d3.select($(graph.$svg)[0]).on('click', function (d, i) {
                            var $tooltip = $(this).parent().find('.animal-housing-tooltip, .animal-assignments-tooltip');

                            $tooltip.each(function () {
                                var d3$tooltip = d3.select(this);
                                hideTooltip(d3$tooltip);
                            });
                            VM.selectedHousingItem.stuck(false);
                            VM.selectedAssignmentItem.stuck(false);
                        });


                        var rightRegion = graph.regions.right;
                        var $rightRegion = graph.$svg.find('.' + rightRegion.classname());
                        var d3$rightRegion = d3.select($rightRegion[0]);

                        var assignmentlegendGroup = d3$rightRegion.append('g').attr('transform', 'translate(10,10)');
                        var housinglegendGroup = d3$rightRegion.append('g');


                        var applyColorMap = function (legendGroup, colorMap) {
                            jQuery.each(_.keys(colorMap), function (index, value) {
                                var entry = legendGroup.append('g').attr('transform', 'translate(0,' + (12 * index).toString() + ')');

                                entry.append('rect').attr('fill', colorMap[value])
                                        .attr('height', 10)
                                        .attr('width', 10)
                                        .attr('y', -10);

                                entry.append('text').text(value)
                                        .attr('x', 12);
                            });
                        };

                        applyColorMap(assignmentlegendGroup, {
                            "Research Project": "red",
                            "Quarantine": "orange",
                            "Unassigned": "green",
                            "Training": "blue",
                            "Breeding": "pink",
                            "Vet Exempt": "url(#exemptionPattern)",
                            "Assignment Pending": "url(#pendingPattern)",
                            "Other": "black"
                        });

                        applyColorMap(housinglegendGroup, {
                            'Single': 'red',
                            'Pair/Group': 'green'
                        });


                        jQuery.each([housinglegendGroup, assignmentlegendGroup], function(index, group) {
                            var rawGroup = group[0][0];
                            var groupHeight = 0;

                            if ( (typeof rawGroup !== 'undefined') && (rawGroup !== null) && ('getBBox' in rawGroup) ) {
                                var bbox = rawGroup.getBBox();
                                groupHeight = bbox.height;
                            }
                            else {
                                console.warn("Raw legend group doesn't seem to have getBBox method: ", group, rawGroup);
                                groupHeight = 30;  // Magic number that should make the graph not totally break
                            }

                            var offset = (((index * 2) + 1) * rightRegion.height() / 4) - (groupHeight / 2);
                            group.attr('transform', 'translate(10,' + offset + ')');
                        });

                    }
                };
                Graph = new d3Graph(config);
                VM.graph = Graph;
                return VM;
            }
        }
    });
});