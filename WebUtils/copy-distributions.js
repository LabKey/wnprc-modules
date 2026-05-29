/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const fs = require('fs-extra');

function log(msg) {
    process.stdout.write(msg);
}

/**
 * Copy fullCalendar distribution to module resources.
 */
function copyFullCalendarFiles() {
    log('Copying fullCalendar distribution from npm package ... ');

    // You could choose to be more explicit here and copy just individual assets.
    // For ease of understanding I've just copied the entire package's contents.
    const apiDistDir = __dirname + '/node_modules/fullcalendar/';
    const targetDir = __dirname + '/resources/web/gen/lib/fullcalendar/';

    fs.copy(apiDistDir, targetDir);

    log('Done.\n');
}

copyFullCalendarFiles();