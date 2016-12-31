(function() {

    // Stole this idea from:
    //    http://stackoverflow.com/questions/13448113/match-first-matching-hierarchical-descendant-with-jquery-selectors
    var findFirstDescendant = function($node, selector) {
       return $node.children(':not(' + selector + ')').andSelf().find(selector + ':eq(0)');
    };
    var classify_name = function(text) {
       return text.replace(/\s/g, '').replace(/[:]/g, '').toLowerCase();
    };

    var $bodypanel = jQuery('#bodypanel');


    var $dataEntryTable = findFirstDescendant($bodypanel, 'div.x-panel');
    $dataEntryTable.addClass('nightwatch-test-dataEntryTable');

    // Make sure that the page loaded.
    var $dataEntryTableHeader = $dataEntryTable.children().first().find('.x-panel-header-text');
    $dataEntryTableHeader.addClass('nightwatch-test-dataEntryTable-header');


    var $formPanelBody = findFirstDescendant($bodypanel, 'div.x-panel-body');
    $formPanelBody.addClass('nightwatch-test-dataEntryTable-formPanelBody');

    var $formPanels = $formPanelBody.children();
    $formPanels.each(function(){
        var $this = jQuery(this);

        // Tag header line
        var $header = $this.children().filter('.x-panel-header').find('.x-panel-header-text');
        $header.addClass('nightwatch-test-class-formpanel-header');

        // Tag section
        var headerText = $header.text().replace(/\s/g,'');
        $this.addClass('nightwatch-test-dataEntryTable-formPanel-' + headerText);

        // Toolbar Buttons
        var $toolbarbuttons = $this.find('.x-panel-tbar button');
        $toolbarbuttons.each(function(){
            var $this = jQuery(this);

            var buttonText = $this.text().replace(/\s/g,'');
            $this.addClass('nightwatch-test-class-formpanel-tbarbutton-' + buttonText);
        });

        // Footer
        var $footer = $this.find('.x-panel-bbar .x-status-text');
        $footer.addClass('nightwatch-test-class-formpanel-footer');

        // Form
        var $form = $this.find('.x-panel-body div .x-panel-bwrap form');
        $form.addClass('nightwatch-test-class-formpanel-form');

        var $formItems = $form.children().filter('.x-form-item');
        $formItems.each(function(){
            var $this = jQuery(this);

            var $label = $this.children().filter('.x-form-item-label').first();
            $label.addClass('nightwatch-test-class-formpanel-label');

            var itemName = classify_name($label.text());
            $this.addClass('nightwatch-test-class-formpanel-item-' + itemName);

            // Grab the actual item to be filled in
            var $inputs = $this.find('input').filter('[type!="hidden"]');
            // Regular Text Box
            if ( ($inputs.length === 2) && (itemName === "date") ) {
                jQuery($inputs.get(0)).addClass('nightwatch-test-class-formpanel-input-date-date');
                jQuery($inputs.get(1)).addClass('nightwatch-test-class-formpanel-input-date-time');
            }
            else if ( ($inputs.length === 1) && ($inputs.attr('type') === "text") ) {
                $inputs.addClass('nightwatch-test-class-formpanel-input-text');
            }
            else {
                $inputs.each(function(){
                    var $this = jQuery(this);
                    if ($this.attr('type') === 'checkbox') {
                        var $label = $this.siblings('label').first();
                        var label = $label.text().replace(/\s/g, '').toLowerCase();
                        $this.addClass('nightwatch-test-class-formpanel-input-checkbox-' + label);
                        $label.addClass('nightwatch-test-class-formpanel-input-checkbox-' + label + "-label");
                    }
                });
            }


            if ( $this.find('textarea').length === 1) {
                var $textareas = $this.find('textarea');
                $textareas.addClass('nightwatch-test-class-formpanel-input-textarea');
            }
        });


        // Grid
        var $grid = $this.find('.ehr-irregular_observations-records-grid');
        if ($grid.length === 0) {
            $grid = $this.find('.ehr-cage_observations-records-grid');
        }
        $grid.addClass('nightwatch-test-class-formpanel-grid');
        var $grid_header_row = $grid.find('.x-grid3-header tr.x-grid3-hd-row');
        $grid_header_row.addClass("nightwatch-test-class-formpanel-grid-header");

        var columns = [];
        var $grid_header_row_cells = $grid_header_row.children('td');
        $grid_header_row_cells.each(function(){
            var $this = jQuery(this);

            var name = classify_name($this.text());
            columns.push(name);
        });

        var grid_data = [];
        var $grid_rows = $grid.find('.x-grid3-row');
        $grid_rows.each(function(index) {
            var $this = jQuery(this);
            var row_index = index;

            // Make sure that when we try to add the column we don't get an error.
            if ( typeof(grid_data[index]) === 'undefined' ) {
                grid_data[index] = [];
            }

            $this.addClass('nightwatch-test-class-formpanel-grid-row');
            $this.addClass('nightwatch-test-class-formpanel-grid-row-' + index.toString());

            // Iterate over columns
            var $columns = $this.find('table tbody tr').children('td');
            $columns.each(function(index){
                var $this = jQuery(this);
                var col_index = index;

                $this.addClass('nightwatch-test-formpanel-grid-column-' + columns[index]);
                grid_data[row_index][col_index] = $this.text();
            });
        });



        var $gridMetadata = $grid.find('.nightwatch-test-class-grid-metadata');
        if ($gridMetadata.length > 1) {
            console.log('Found extra metadata tags, so removing them.')
            $gridMetadata.remove();
        }
        if ($gridMetadata.length === 0) {
            $gridMetadata = jQuery(document.createElement("script"));
            $gridMetadata.attr('type','Nightwatch/metadata');
            $grid.append($gridMetadata);
        }
        $gridMetadata.addClass('nightwatch-test-class-grid-metadata');
        $gridMetadata.text(JSON.stringify({
            columns: columns,
            numRows: $grid_rows.length,
            table:   grid_data
        }));

    });


    var $duplicateRecordsModal = jQuery('.x-window').filter(function(index, element) {
        var $this = jQuery(this);

        if ( $this.css('visibility') === 'hidden' ) { return false; }

        if ( $this.find('.x-window-header-text').text() === 'Duplicate Records' ) {
            return true;
        }
        return false;
    });
    $duplicateRecordsModal.addClass('nightwatch-test-modal-duplicate-records');
    $duplicateRecordsModal.find('button').each(function(){
        var $this = jQuery(this);
        var name = classify_name($this.text());
        $this.addClass('nightwatch-test-modal-duplicate-records-button-' + name);
    });


    console.log("completed");

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
