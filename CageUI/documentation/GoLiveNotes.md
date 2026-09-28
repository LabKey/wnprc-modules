# Go Live Notes

Some notes on what needs to be done on the housing cageUI when the project goes live. Stuff done
on the labkey server UI and not through code.


1. Create housing_test table with cageNew and condNew
   2. Ensure permissions are copied from the original housing table as well
2. Update old housing condition code PC to PCP 
3. Import data from current housing table for active housing. No need to do past records.


``` 
<button id="executeButton"> Execute JavaScript </button>
<div id="js-content"/>
<script type="text/javascript" nonce="<%=scriptNonce%>">
    let $ = jQuery;

    function executeCustomJavascript() {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            columns: 'lsid,cond',
            filterArray: [
                LABKEY.Filter.create('cond', 'pc', LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data) {
                data = data || {};
                data.rows = data.rows || [];
                let toUpdate = [];
                for (let i = 0; i < data.rows.length; i++) {
                    data.rows[i].cond = 'pcp'
                    toUpdate.push(data.rows[i]);
                }

                $("#js-content")
                        .append($("<table/>"))
                        .append($("<button/>")
                                .append("Update Records")
                                .click(function(e) {
                                            LABKEY.Query.updateRows({
                                                schemaName: 'study',
                                                queryName: 'housing',
                                                rows: toUpdate,
                                                success: function(data) {
                                                    $("#js-content").append($("<span/>", {
                                                        'style': 'color: green'
                                                    }).append('Success!'));
                                                },
                                                failure: function(data) {
                                                    console.error('Update failed: ' + data.error);
                                                    console.error('Update exception: ' + data.exception);
                                                }
                                            });
                                        }
                                ));

                $("#js-content table").append($("<tr/>")
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("#"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("Id"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("date"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("code"))
                );
                for (let i = 0; i < toUpdate.length; i++) {
                    $("#js-content table").append($("<tr/>")
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(i + 1))
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(toUpdate[i].lsid))
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(toUpdate[i].cond))
                    );
                }
            }
        });
    }
    LABKEY.Utils.onReady(function() {
        document.getElementById("executeButton")['onclick'] = executeCustomJavascript;
    });

</script>
```
4. Add new housing condition in ehr_lookups for PC
5. Update cageNew in housing_test

```
<button id="executeButton"> Update cageNew in housing_test </button>
<div id="js-content" style="margin-top: 1rem;"></div>

<script type="text/javascript" nonce="<%=scriptNonce%>">
    let $ = jQuery;

    function executeCustomJavascript() {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing_test',
            columns: 'room,cage,lsid,cageNew', // ensure cageNew is selected
            success: function(housingData) {
                housingData = housingData || {};
                housingData.rows = housingData.rows || [];

                // Fetch cage mapping from cageui.cagesInRoom
                LABKEY.Query.selectRows({
                    schemaName: 'cageui',
                    queryName: 'cagesInRoom',
                    columns: 'room,cage_number,cage_object_id',
                    success: function(cagesData) {
                        cagesData = cagesData || {};
                        cagesData.rows = cagesData.rows || [];

                        // Build a lookup map: key = "room|cage_number", value = cage_object_id
                        let cageLookup = {};
                        for (let cage of cagesData.rows) {
                            let key = cage.room + '|' + cage.cage_number;
                            cageLookup[key] = cage.cage_object_id;
                        }

                        // Prepare rows to update
                        let rowsToUpdate = [];
                        for (let h of housingData.rows) {
                            let key = h.room + '|' + parseInt(h.cage);
                            let newCageObjId = cageLookup[key];

                            if (newCageObjId) {
                                rowsToUpdate.push({
                                    lsid: h.lsid,
                                    cageNew: newCageObjId
                                });
                            }
                        }

                        // UI: show what will be updated
                        let $content = $("#js-content").empty();
                        if (rowsToUpdate.length === 0) {
                            $content.append($('<p/>').text('No updates needed.'));
                            return;
                        }

                        $content.append(
                            $('<h3/>').text('Rows to update: ' + rowsToUpdate.length)
                        ).append(
                            $('<table border="1" cellpadding="4" style="border-collapse: collapse;">')
                                .append($('<thead/>').append(
                                    $('<tr/>')
                                        .append($('<th/>').text('#'))
                                        .append($('<th/>').text('room'))
                                        .append($('<th/>').text('cage'))
                                        .append($('<th/>').text('new cageNew (cage_object_id)'))
                                ))
                        );

                        let $tbody = $('<tbody/>');
                        for (let i = 0; i < rowsToUpdate.length; i++) {
                            let row = rowsToUpdate[i];
                            // Find original row to show context
                            let origRow = housingData.rows.find(r => r.lsid === row.lsid);
                            $tbody.append(
                                $('<tr/>')
                                    .append($('<td/>').text(i + 1))
                                    .append($('<td/>').text(origRow ? origRow.room : 'N/A'))
                                    .append($('<td/>').text(origRow ? origRow.cage : 'N/A'))
                                    .append($('<td/>').text(row.cageNew))
                            );
                        }
                        $content.find('table').append($tbody);

                        // Add "Update" button
                        $content.append(
                            $('<br/><br/>')
                        ).append(
                            $('<button/>')
                                .text('Confirm Update ' + rowsToUpdate.length + ' Rows')
                                .css('margin-top', '1rem')
                                .click(function(e) {
                                    LABKEY.Query.updateRows({
                                        schemaName: 'study',
                                        queryName: 'housing_test',
                                        rows: rowsToUpdate,
                                        success: function(updateData) {
                                            $content.append(
                                                $('<span/>', {
                                                    style: 'color: green; font-weight: bold;'
                                                }).text('✅ Success! ' + updateData.rows.length + ' rows updated.')
                                            );
                                        },
                                        failure: function(error) {
                                            console.error('Update failed:', error);
                                            $content.append(
                                                $('<span/>', {
                                                    style: 'color: red;'
                                                }).text('❌ Update failed. See console for details.')
                                            );
                                        }
                                    });
                                })
                        );

                    },
                    failure: function(error) {
                        $("#js-content").append(
                            $('<span/>', { style: 'color: red;' })
                                .text('Failed to load cagesInRoom: ' + (error.message || error))
                        );
                    }
                });
            },
            failure: function(error) {
                $("#js-content").append(
                    $('<span/>', { style: 'color: red;' })
                        .text('Failed to load housing_test: ' + (error.message || error))
                );
            }
        });
    }

    LABKEY.Utils.onReady(function() {
        document.getElementById("executeButton").onclick = executeCustomJavascript;
    });
</script>
```
6. Update condNew and add current conditions to cageui.housing_condition_records.

```
<button id="executeButton"> Update housing_condition_records & condNew </button>
<div id="js-content" style="margin-top: 1rem;"></div>

<script type="text/javascript" nonce="<%=scriptNonce%>">
    let $ = jQuery;

    // Condition category definitions
    const CONDITIONS = {
        special: ['x'],
        pair:    ['s', 'g', 'p', 'c'],
        cage:    ['pc', 'vc'],
        social:  ['af', 'am', 'amf', 'b', 'bi', 'f', 'i', 'ia', 'm', 'mafa', 'mf', 'mfa']
    };

    // Combine all codes for validation & parsing (2-letter first, then 1-letter)
    const ALL_CODES = [
        ...CONDITIONS.cage, // 2-letter: pc, vc
        ...CONDITIONS.social, // 2-letter: af, am, amf (⚠️ 3-letter), bi, ia, mafa, mf, mfa — but note: "amf" and "mafa" and "mfa" are 3-letter
        ...CONDITIONS.pair,   // 1-letter
        ...CONDITIONS.special // 1-letter
    ];

    // Helper: sort by length desc so we match longer codes first (e.g., "amf" before "am" or "m")
    const SORTED_CODES = ALL_CODES.slice().sort((a, b) => b.length - a.length);

    function decodeCond(cond) {
        if (!cond || typeof cond !== 'string') return { special: null, pair: null, cage: null, social: null };

        cond = cond.toLowerCase().replace(/\s+/g, ''); // normalize
        let remaining = cond;
        let codes = {
            special: new Set(),
            pair: new Set(),
            cage: new Set(),
            social: new Set()
        };

        // Try to extract all valid codes in order (greedy by length descending)
        while (remaining.length > 0) {
            let matched = false;
            for (let code of SORTED_CODES) {
                if (remaining.startsWith(code)) {
                    // Determine category
                    if (CONDITIONS.special.includes(code)) codes.special.add(code);
                    else if (CONDITIONS.pair.includes(code)) codes.pair.add(code);
                    else if (CONDITIONS.cage.includes(code)) codes.cage.add(code);
                    else if (CONDITIONS.social.includes(code)) codes.social.add(code);
                    else {
                        console.warn('Unexpected code "' + code + '" found in "' + cond + '"');
                    }
                    remaining = remaining.slice(code.length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                console.warn('Unrecognized prefix in cond "' + cond + '"; remaining="' + remaining + '"');
                // Optional: break or continue — we’ll skip invalid chars
                remaining = remaining.slice(1);
            }
        }

        // Convert sets to sorted strings (consistent order, empty → null)
        const toString = (s) => s.size ? Array.from(s).sort().join('') : null;

        return {
            special: toString(codes.special),
            pair: toString(codes.pair),
            cage: toString(codes.cage),
            social: toString(codes.social)
        };
    }

    function executeCustomJavascript() {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing_test',
            columns: 'objectid,cond,lsid',
            success: function(housingData) {
                housingData = housingData || {};
                housingData.rows = housingData.rows || [];

                // Prepare insert data for housing_condition_records
                let newRows = [];
                let housingUpdates = [];

                for (let h of housingData.rows) {
                    let decoded = decodeCond(h.cond);
                    let hasCondition = Object.values(decoded).some(v => v !== null);

                    if (!hasCondition) {
                        // Optional: skip if no conditions, or insert all nulls?
                        // We'll skip to avoid empty records
                        continue;
                    }

                    const newObjId = LABKEY.Utils.generateUUID().toUpperCase();
                    // Prepare row to insert into housing_condition_records
                    let rowToInsert = {
                        objectid: newObjId,
                        special_condition: decoded.special,
                        pair_condition: decoded.pair,
                        cage_condition: decoded.cage,
                        social_condition: decoded.social
                    };

                    newRows.push(rowToInsert);

                    // Also prepare update (will store the rowid of the inserted row)
                    housingUpdates.push({
                        objectid: h.objectid,
                        lsid: h.lsid,
                        condNew: newObjId // placeholder
                    });
                }

                // UI: show decoded info & insert plan
                let $content = $("#js-content").empty();
                if (newRows.length === 0) {
                    $content.append($('<p/>').text('No rows with valid cond codes found to process.'));
                    return;
                }

                $content.append(
                        $('<h3/>').text('Rows to process: ' + newRows.length)
                ).append(
                        $('<table border="1" cellpadding="4" style="border-collapse: collapse;">')
                                .append($('<thead/>').append(
                                        $('<tr/>')
                                                .append($('<th/>').text('#'))
                                                .append($('<th/>').text('housing objectid'))
                                                .append($('<th/>').text('original cond'))
                                                .append($('<th/>').text('decoded → special/pair/cage/social'))
                                ))
                );

                let $tbody = $('<tbody/>');
                for (let i = 0; i < newRows.length; i++) {
                    let row = newRows[i];
                    let orig = housingUpdates.find(r => r.condNew === row.objectid);
                    let d = decodeCond(orig.cond);
                    $tbody.append(
                            $('<tr/>')
                                    .append($('<td/>').text(i + 1))
                                    .append($('<td/>').text(row.objectid))
                                    .append($('<td/>').text(orig.cond || '(null)'))
                                    .append($('<td/>').text(
                                            [d.special, d.pair, d.cage, d.social].join('/')
                                    ))
                    );
                }
                $content.find('table').append($tbody);

                // Add "Insert & Update" button
                $content.append(
                        $('<br/><br/>')
                ).append(
                        $('<button/>')
                                .text('Confirm Insert & Update ' + newRows.length + ' Rows')
                                .css('margin-top', '1rem')
                                .click(function(e) {
                                    // Insert into housing_condition_records
                                    LABKEY.Query.insertRows({
                                        schemaName: 'cageui',
                                        queryName: 'housing_condition_records',
                                        rows: newRows,
                                        success: function(insertData) {
                                            insertData = insertData || {};
                                            insertData.rows = insertData.rows || [];

                                            // Map inserted rowids to objectid
                                            if (insertData.rows.length !== newRows.length) {
                                                alert('⚠️ Inserted ' + insertData.rows.length + ' rows, but expected ' + newRows.length);
                                                return;
                                            }

                                            // Now update housing_test.condNew
                                            LABKEY.Query.updateRows({
                                                schemaName: 'study',
                                                queryName: 'housing_test',
                                                rows: housingUpdates,
                                                success: function(updateData) {
                                                    updateData = updateData || {};
                                                    $content.append(
                                                            $('<div/>')
                                                                    .append($('<h4/>').text('✅ Success!'))
                                                                    .append($('<p/>').text('Inserted ' + insertData.rows.length + ' condition records into housing_condition_records'))
                                                                    .append($('<p/>').text('Updated condNew in ' + updateData.rows.length + ' housing_test rows'))
                                                    );
                                                },
                                                failure: function(error) {
                                                    console.error('Update failed:', error);
                                                    $content.append(
                                                            $('<span/>', { style: 'color: red;' })
                                                                    .text('❌ Update of housing_test.condNew failed. See console.')
                                                    );
                                                }
                                            });
                                        },
                                        failure: function(error) {
                                            console.error('Insert failed:', error);
                                            $content.append(
                                                    $('<span/>', { style: 'color: red;' })
                                                            .text('❌ Insert into housing_condition_records failed. See console.')
                                            );
                                        }
                                    });
                                })
                );

            },
            failure: function(error) {
                $("#js-content").append(
                        $('<span/>', { style: 'color: red;' })
                                .text('Failed to load housing_test: ' + (error.message || error))
                );
            }
        });
    }

    LABKEY.Utils.onReady(function() {
        document.getElementById("executeButton").onclick = executeCustomJavascript;
    });
</script>

```
7. Update dates in all_history to add time stamps.

```
<button id="executeButton">Execute JavaScript</button>
<div id="js-content"/>
<script type="text/javascript" nonce="<%=scriptNonce%>">
    let $ = jQuery;

    function executeCustomJavascript() {
        LABKEY.Query.selectRows({
            schemaName: 'cageui',
            queryName: 'all_history',
            columns: 'rowid,lsid,room,created',
            sort: 'rowid',
            success: function(data) {
                data = data || {};
                data.rows = data.rows || [];
                let toUpdate = [];
                
                // Group rows by room
                let rooms = {};
                for (let i = 0; i < data.rows.length; i++) {
                    let row = data.rows[i];
                    if (!rooms[row.room]) {
                        rooms[row.room] = [];
                    }
                    rooms[row.room].push(row);
                }
                
                // Process each room's rows
                for (let room in rooms) {
                    let roomRows = rooms[room];
                    for (let i = 0; i < roomRows.length; i++) {
                        let row = roomRows[i];
                        let updateRow = {
                            rowid: row.rowid,
                            start_date: row.created ? formatDate(row.created) : null
                        };
                        
                        // Set end_date to next row's start_date, or null if this is the last row
                        if (i < roomRows.length - 1) {
                            let nextRow = roomRows[i + 1];
                            updateRow.end_date = formatDate(nextRow.created);
                        } else {
                            updateRow.end_date = null;
                        }
                        
                        toUpdate.push(updateRow);
                    }
                }
		console.log(toUpdate);

                $("#js-content")
                        .append($("<table/>"))
                        .append($("<button/>")
                                .append("Update Records")
                                .click(function(e) {
                                            LABKEY.Query.updateRows({
                                                schemaName: 'cageui',
                                                queryName: 'all_history',
                                                rows: toUpdate,
                                                success: function(data) {
                                                    $("#js-content").append($("<span/>", {
                                                        'style': 'color: green'
                                                    }).append('Success! Updated ' + toUpdate.length + ' records.'));
                                                },
                                                failure: function(data) {
                                                    console.error('Update failed: ' + data.error);
                                                    console.error('Update exception: ' + data.exception);
                                                }
                                            });
                                        }
                                ));

                $("#js-content table").append($("<tr/>")
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("#"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("Room"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("Row ID"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("Start Date"))
                        .append($("<td/>", {
                            'style': 'border: solid 1px black'
                        })
                                .append("End Date"))
                );
                
                for (let i = 0; i < toUpdate.length; i++) {
                    $("#js-content table").append($("<tr/>")
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(i + 1))
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(toUpdate[i].rowid))
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(toUpdate[i].start_date || 'null'))
                            .append($("<td/>", {
                                'style': 'border: solid 1px black'
                            })
                                    .append(toUpdate[i].end_date || 'null'))
                    );
                }
            }
        });
    }
    
    // Helper function to format date as yyyy-mm-dd HH:mm
    function formatDate(dateString) {
        if (!dateString) return null;
        
        // Parse the date string
        let date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return null;
        }
        
        // Format as yyyy-mm-dd HH:mm
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    
    LABKEY.Utils.onReady(function() {
        document.getElementById("executeButton")['onclick'] = executeCustomJavascript;
    });
</script>
```

