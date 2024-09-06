/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
 * Title: BloodSummaryPanel
 * Description: This will generate the blood report plot for each subject ID passed in.  Provides a hook to add
 *      additional items in the report.
 * Config: {
 *          subjects: Array of animal IDs,
 *          getSubjectItems(optional): Function returning an array of items to add for each subject ID after the plot
 *          }
 */

Ext4.define('WNPRC.panel.BloodSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.wnprc-bloodsummarypanel',
    intervals: {},
    plotHeight: 400,

    bloodPerKgCol: 'species/blood_per_kg',
    bloodMaxDrawPctCol: 'species/max_draw_pct',
    bloodDrawIntervalCol: 'species/blood_draw_interval',

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();

        if(!Ext4.isDefined(this.subjects) || !Ext4.isArray(this.subjects))
                console.log("Must pass in an array of animal IDs as subjects.")
        else
            this.loadData();
    },

    loadData: function(){
        var demoCols = 'id,species,id/MostRecentWeight/mostRecentWeight,id/MostRecentWeight/mostRecentWeightDate,Id/demographics/calculated_status,Id/demographics/calculated_status/meaning'
            + ',' + this.bloodPerKgCol + ',' + this.bloodMaxDrawPctCol + ',' + this.bloodDrawIntervalCol;

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographics',
            filterArray: [LABKEY.Filter.create('id', this.subjects.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)],
            columns: demoCols,
            requiredVersion: 9.1,
            sort: 'id',
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: function(results){
                this.demographicsMap = {};
                this.intervals = {};

                Ext4.each(results.rows, function(row){
                    var map = new LDK.SelectRowsRow(row);
                    var interval = row[this.bloodDrawIntervalCol].value;
                    this.demographicsMap[map.getValue('id')] = map;

                    if(!interval) {
                        interval = 42;
                    }
                    if( this.intervals.hasOwnProperty(interval) ) {
                        this.intervals[interval].push(row.Id.value)
                    } else {
                        this.intervals[interval] = [row.Id.value];
                    }

                }, this);

                this.loadBloodData();
            }
        });
    },

    loadBloodData: function() {
        var multi = new LABKEY.MultiRequest();

        for(var interval in this.intervals) {
            if (this.intervals.hasOwnProperty(interval)) {

                multi.add(LABKEY.Ajax.request, {
                    url: LABKEY.ActionURL.buildURL("ehr", "bloodPlotData"),
                    params: {
                        ids: this.intervals[interval],
                        interval: interval
                    },
                    method : 'POST',
                    requiredVersion: 9.1,
                    scope: this,
                    failure: LDK.Utils.getErrorCallback(),
                    success: function (response)
                    {
                        var results = JSON.parse(response.responseText);
                        console.log(results);

                        var meta = results.metaData.fields;
                        for(var i = 0; i<meta.length; i++) {
                            if(meta[i].type === "Date and Time")
                                meta[i].type = "date";
                        }

                        //these will be used for the blood graph
                        results.metaData.fields.push({
                            name: 'allowableDisplay',
                            jsonType: 'string'
                        });
                        results.metaData.fields.push({
                            name: 'seriesId',
                            jsonType: 'string'
                        });
                        results.metaData.fields.push({
                            name: 'isHidden',
                            jsonType: 'boolean'
                        });
                        results.metaData.fields.push({
                            name: 'isToday',
                            jsonType: 'boolean'
                        });
                        results.metaData.fields.push({
                            name: 'isDeath',
                            jsonType: 'boolean'
                        });

                        if(!this.currentBloodMap)
                            this.currentBloodMap = {};

                        Ext4.each(results.rows, function (row)
                        {
                            var map = new LDK.SelectRowsRow(row);
                            var id = map.getValue('Id');
                            row.isToday = {value: false};
                            row.isDeath = {value: false};

                            if(row.date.value) {
                                var rDate = new Date(row.date.value);
                                //TODO: Remove this if we're happy not displaying dead animal data
                                if(row.death.value) {
                                    var dDate = new Date(row.death.value);
                                    if (dDate && rDate && Ext4.Date.format(rDate, LABKEY.extDefaultDateFormat) == Ext4.Date.format(dDate, LABKEY.extDefaultDateFormat)) {
                                        row.isDeath = {value: true};
                                    }
                                    if (dDate && rDate && rDate > dDate) {
                                        return;
                                    }
                                }
                                //End TODO
                                if (rDate && Ext4.Date.format(rDate, LABKEY.extDefaultDateFormat) == Ext4.Date.format(new Date(), LABKEY.extDefaultDateFormat)) {
                                    row.isToday = {value: true};
                                }
                            }

                            if (!this.currentBloodMap[id])
                                this.currentBloodMap[id] = [];

                            this.currentBloodMap[id].push(row);
                        }, this);

                        if(this.bloodDrawResults) {
                            this.bloodDrawResults.rows = this.bloodDrawResults.rows.concat(results.rows);
                        } else {
                            this.bloodDrawResults = results;
                        }
                    }
                });
            }
        }

        multi.send(this.onLoad, this);
    },

    onLoad: function(results){
        var toAdd = [];
        Ext4.each(this.subjects, function(subject){
            var dd = this.demographicsMap[subject];
            var bds = this.currentBloodMap[subject];

            var cfg = {
                xtype: 'ldk-webpartpanel',
                style: 'margin-bottom: 20px;',
                title: 'Blood Summary: ' + subject,
                defaults: {
                    border: false
                },
                items: []
            };

            if (!dd){
                cfg.items.push({
                    html: 'Either species or weight information is missing for this animal'
                });
            }
            else {
                var status = dd.getValue('Id/demographics/calculated_status/meaning') || dd.getValue('Id/demographics/calculated_status');
                cfg.items.push({
                    html: '<b>Id: ' + dd.getValue('Id') + (status ? ' (' + status + ')' : '') + '</b>'
                });

                cfg.items.push({
                    html: '<hr>'
                });

                if(status != null && status.toLowerCase() === "dead") {
                    cfg.items.push({
                        html: 'No current blood draw information for dead animal.',
                        border: false
                    });
                }
                else if (!bds || bds.length === 1) {
                    var maxDraw = dd.getValue(this.bloodPerKgCol) * dd.getValue(this.bloodMaxDrawPctCol) * dd.getValue('id/MostRecentWeight/mostRecentWeight');
                    cfg.items.push({
                        html: 'There are no previous blood draws within the relevant time frame.  A maximum amount of ' + Ext4.util.Format.round(maxDraw, 2) + ' mL can be drawn.',
                        border: false
                    });
                }
                else {
                    cfg.items = cfg.items.concat(this.getGraphCfg(dd, bds));
                }
            }

            toAdd.push(cfg);
        }, this);

        this.removeAll();
        if (toAdd.length){
            this.add(toAdd);
        }
        else {
            this.add({
                html: 'No records found'
            });
        }

        this.addAdditionalGraphOptions();
    },

    addAdditionalGraphOptions: function() {
        var svgs = d3.selectAll('svg');
        var patternHeight = 8;

        // Add shading pattern
        var defs = svgs.selectAll('defs')
                .append('pattern')
                .attr('id', 'diag-pattern')
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 3)
                .attr('height', patternHeight)
                .attr('patternTransform', 'rotate(30)')
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width',.5)
                .attr('height', patternHeight)
                .attr('style', 'stroke:none;')
                .attr('fill', 'red');


        // Add under zero shading
        Ext4.each(svgs[0], function(svg) {
            var ticks = svg.getElementsByClassName('axis')[1].getElementsByClassName('tick-text')[0].getElementsByTagName('g');
            Ext4.each(ticks, function(tick) {
                if(tick.getElementsByTagName('text')[0].textContent === '0') {
                    var axis = d3.select(tick.parentElement.parentElement);
                    var tickText = d3.select(tick.parentElement);
                    axis.append('rect')
                            .attr('x', tick.getBBox().x + 16)
                            .attr('y', tick.getBBox().y + 11)
                            .attr('width', axis[0][0].getBBox().width - tickText[0][0].getBBox().width - 10)
                            .attr('height', this.plotHeight - tick.getBBox().y - 60)
                            .attr('fill-opacity',.5)
                            .attr('fill', 'url(#diag-pattern)');
                }
            },this)
        },this);

        var points = d3.selectAll('a.point');
        var todayPoints = points.filter(function(d) {
            return (d.isToday && d.isToday == true);
        });

        // Add Today line and text
        todayPoints.append(function(d,i) {

            // Hijack the loop to setup line
            var yAxis = d3.selectAll('svg').select('g.grid-line path')[0][i];
            var path = yAxis.getAttribute('d');
            var bottom = Number(path.substring(path.indexOf(',')+1, path.indexOf('L')));
            var top = Number(path.substring(path.indexOf(',', path.indexOf(',')+1)+1, path.indexOf('Z')));
            var ht = bottom - top;
            this.getElementsByTagName('path')[0]
                    .setAttribute('d', "M0 " + (ht + 68 - this.getBBox().y) + " l0 -" + (ht-1));

            var text =  document.createElementNS(d3.ns.prefix.svg, 'text');
            text.setAttribute("x", this.getBBox().x - 18);
            text.setAttribute("y", this.getBBox().y - 3);
            text.setAttribute("style", "font-weight:bold;font-family:Arial;font-size:11px;");
            text.setAttribute("fill", "black");
            text.setAttribute("visibility", "visible");
            text.textContent = "Today";

            return text;
        });
    },
    getMaxBloodAvailValue: function(rows){

        var allowableBloodVals = [];
        for (var i = 0; i < rows.length; i++){
            allowableBloodVals.push(rows[i].allowableDisplay.value);
        }

        return Math.round(allowableBloodVals.reduce((a, b) => Math.max(a, b), -Infinity)) + 10;
    },

    getTickValues: function(rows){
        var ticks = [], msPerDay = 86400000, totalTicks = 10;
        var minDate = Date.parse(rows[0].date.value);
        var minDateGmt = Date.parse(rows[0].date.value.concat(" GMT"));
        var maxDate = Date.parse(rows[rows.length - 1].date.value);
        var diff = maxDate - minDate;
        var daysTotal = diff/msPerDay;
        var daysPerTick = Math.ceil(daysTotal/totalTicks);
        var newTotal = Math.ceil(daysTotal/daysPerTick);

        ticks[0] = (Math.ceil(minDate/msPerDay) * msPerDay)
                - (msPerDay - (minDate - minDateGmt)); // Offset timezone
        for(var i=1; i<newTotal; i++) {
            ticks[i] = ticks[i-1] + (daysPerTick * msPerDay);
        }

        return ticks;
    },

    getGraphCfg: function(dd, bds){

        var subject = dd.getValue('Id');
        var toAdd = [];
        var results = {
            metaData: this.bloodDrawResults.metaData,
            rows: bds
        };

        //this assumes we sorted on date
        var newRows = [];
        var rowPrevious;
        var seriesIds = [];
        var currentRow;
        Ext4.each(results.rows, function(row, idx){
            //capture the current day's amount
            var rowDate = new Date(row.date.value);
            if (rowDate && Ext4.Date.format(rowDate, LABKEY.extDefaultDateFormat) == Ext4.Date.format(new Date(), LABKEY.extDefaultDateFormat)){
                currentRow = row;
            }

            row.allowableDisplay = row.allowableBlood;
            row.seriesId = {
                value: row.id.value + '/' + row.date.value
            };
            seriesIds.push(row.seriesId.value);

            //in order to mimic a stepped graph, add one new point per row using the date of the next draw
            if (rowPrevious){
                var newRow = Ext4.apply({}, row);
                newRow.allowableBlood = rowPrevious.allowableBlood;
                newRow.seriesId = rowPrevious.seriesId;
                newRow.isHidden = {value: true};
                newRows.push(newRow);
            }
            rowPrevious = row;
            newRows.push(row);

            //always append one additional datapoint in order to emphasize the ending
            if (idx == (results.rows.length - 1)){
                var newRow = Ext4.Object.merge({}, row);
                newRow.isHidden = {value: true};
                var date = LDK.ConvertUtils.parseDate(row.date.value);
                date = Ext4.Date.add(date, Ext4.Date.DAY, 1);
                newRow.date.value = Ext4.Date.format(date, 'Y/m/d H:i:s');
                newRows.push(newRow);
            }
        }, this);

        results.rows = newRows;

        if (currentRow){
            toAdd.push({
                html: '<p>Total volume of blood collected in the past ' + currentRow.blood_draw_interval.value + ' days: <b>'
                    + Ext4.util.Format.round(currentRow.bloodPrevious.value, 1) + ' mL</b>. '
                    + 'The amount of blood available if drawn today is: <b>' + Ext4.util.Format.round(currentRow.allowableDisplay.value, 1) + ' mL</b>.</p>'
                    + '<p>The graph below shows how the amount of blood available will change over time, including when previous draws will drop off. Hover over the timepoints for more information.</p>',
                border: false,
                style: 'margin-bottom: 20px'
            });
        }

        var layerName = "Volume";
        toAdd.push({
            xtype: 'container',
            items: [{
                xtype: 'ldk-graphpanel',
                margin: '0 0 0 0',
                plotConfig: {
                    results: results,
                    title: 'Blood Available To Be Drawn: ' + subject,
                    height: this.plotHeight,
                    width: this.getWidth() - 50,
                    yLabel: 'Available Blood (mL)',
                    xLabel: 'Date',
                    xField: 'date',
                    grouping: ['seriesId'],
                    scales: {
                        shape: {
                            scaleType: 'discrete',
                            range: [LABKEY.vis.Scale.Shape()[1], LABKEY.vis.Scale.Shape()[0],
                                LABKEY.vis.Scale.Shape()[4], LABKEY.vis.Scale.Shape()[0]],
                            domain: ["0 " + layerName, "1 " + layerName, "2 " + layerName, "3 " + layerName]
                        },
                        color: {
                            scaleType: 'discrete',
                            range: [LABKEY.vis.Scale.ColorDiscrete()[1], LABKEY.vis.Scale.ColorDiscrete()[0], "#2fad24", "red", "black"],
                            domain: ["0 " + layerName, "1 " + layerName, "2 " + layerName, "3 " + layerName]
                        }
                        ,
                        size: {
                            scaleType: 'discrete',
                            range: [5, 7],
                            domain: ["0 " + layerName, "1 " + layerName]
                        },
                        x: {
                            tickValues: this.getTickValues(results.rows)
                        },
                        y: {
                            domain: [0, this.getMaxBloodAvailValue(results.rows)],
                        }
                    },
                    layers: [{
                        y: 'allowableBlood',
                        hoverText: function(row){
                            var lines = [];

                            if(row.isDeath) {
                                lines.push('DEATH');
                            }
                            lines.push('Date: ' + Ext4.Date.format(row.date, LABKEY.extDefaultDateFormat));
                            lines.push('Drawn on this Date: ' + row.quantity);
                            lines.push('Volume Available on this Date: ' + LABKEY.Utils.roundNumber(row.allowableDisplay, 1) + ' mL');

                            lines.push('Current Weight: ' + row.mostRecentWeight + ' kg (' + Ext4.Date.format(row.mostRecentWeightDate, LABKEY.extDefaultDateFormat) + ')');

                            lines.push('Drawn in Previous ' + row.blood_draw_interval + ' days: ' + LABKEY.Utils.roundNumber(row.bloodPrevious, 1));

                            if (new Date(row.date) < new Date() && !row.isToday)
                                lines.push('Drawn in Next ' + row.blood_draw_interval + ' days: ' + LABKEY.Utils.roundNumber(row.bloodFuture, 1));


                            return lines.join('\n');
                        },
                        name: layerName
                    }]
                },
                getPlotConfig: function(){
                    var cfg = LDK.panel.GraphPanel.prototype.getPlotConfig.call(this);
                    cfg.legendData = [
                            {
                                color:'#FC8D62',
                                text:'Scheduled Blood Draw Status',
                                shape: LABKEY.vis.Scale.Shape()[1]
                            },
                            {
                                color:'#66C2A5',
                                text:'Non-scheduled Blood Draw Status',
                                shape: LABKEY.vis.Scale.Shape()[0]
                            }
                    ]
                    cfg.aes.color = null;
                    cfg.aes.shape = null;

                    return cfg;
                },

                //@Override
                appendLayer: function(plot, layerConfig){
                    var meta = this.findMetadata(layerConfig.y);
                    plot.addLayer(new LABKEY.vis.Layer({
                        geom: new LABKEY.vis.Geom.Point({size: 5}),
                        name: layerConfig.name || meta.caption,
                        aes: {
                            y: function(row){
                                if (row.isHidden)
                                    return null;

                                return row[layerConfig.y]
                            },
                            hoverText: layerConfig.hoverText,
                            shape: function(row){
                                if(row.isDeath)
                                    return 2;
                                if(row.isToday)
                                    return 3;
                                if(row.quantity > 0) {
                                    return 0;
                                }
                                return 1;
                            },
                            color: function(row){
                                if(row.isToday)
                                    return 4;
                                if(row.isDeath)
                                    return 4;

                                if(row.quantity > 0) {
                                    return 0;
                                }

                                return 1;
                            },
                            size: function(row) {
                                if(row.isToday)
                                    return 1;
                                if(row.isDeath)
                                    return 1;

                                return 0;
                            }
                        }
                    }));

                    //now add segments.  this is an odd way to accomplish grouping, but
                    //otherwise Vis will give each segment a different color
                    Ext4.each(seriesIds, function(seriesId){
                        plot.addLayer(new LABKEY.vis.Layer({
                            geom: new LABKEY.vis.Geom.Path({size: 5, opacity: 2}),
                            name: layerConfig.name || meta.caption,
                            aes: {
                                y: function(row){
                                    if (row.seriesId != seriesId)
                                        return null;

                                    return row[layerConfig.y];
                                },
                                group: 'none'
                            }
                        }));
                    }, this);
                }
            }]
        });

        // If defined, add additional items below plot
        if(Ext4.isDefined(this.getSubjectItems) && Ext4.isFunction(this.getSubjectItems)) {
            toAdd = toAdd.concat(this.getSubjectItems(subject, dd));
        }
        else if(Ext4.isDefined(this.getSubjectItems) && !Ext4.isFunction(this.getSubjectItems)) {
            console.log("getSubjectItems must be a function returning an array of items to append after the plot")
        }


        return toAdd;
    }


});