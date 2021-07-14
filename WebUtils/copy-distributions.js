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
    const targetDir = __dirname + '/resources/web/webutils/lib/fullcalendar/';

    fs.copy(apiDistDir, targetDir);

    log('Done.\n');
}

copyFullCalendarFiles();