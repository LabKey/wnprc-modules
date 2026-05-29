/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {
    //Modal
    var $modal = jQuery('.x-window');
    var $modalButtons = $modal.find('button');
    $modalButtons.each(function() {
        var $this = jQuery(this);

        $this.addClass('nightwatch-test-class-modal-button-' + $this.text().replace(/\s/g,'').toLowerCase());
    });
})();

(function() {
    var counterid = "NightwatchTestScriptsLoaded";

    var $counter = jQuery("#" + counterid);
    if ( $counter.length === 0 ) {
        jQuery('body').append('<script type="Nightwatch/Counter" id="' + counterid + '"></script>');
    }
    $counter = jQuery("#" + counterid);

    $counter.text($counter.text() + 1);
})();