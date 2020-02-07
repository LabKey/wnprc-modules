Ext4.namespace('EHR.Reports');
let calendarRender = 0;

EHR.reports.animalWaterCalendar = function (panel, tab){

    var animalIds = [];
    if (tab.filters.subjects){
        // tab.filters.subjects.forEach (animalId => animalIds+=animalId+';');
        // animalIds = animalIds.substring(0, animalIds.length-1);
        animalIds = tab.filters.subjects;
        renderCalendar (animalIds, tab);
        calendarRender++;
    }
    else{
        panel.resolveSubjectsFromHousing(tab,renderCalendar,this);

    }



    function renderCalendar(animalIds, tab){
        if (!animalIds.length){
            tab.add({
                html: 'No animal selected or found with water restrictions',
                border: false
            })
        }
        var concatAnimals = "";

        if (animalIds.length > 0){
            animalIds.forEach (animalId => concatAnimals+=animalId+';');
            concatAnimals = concatAnimals.substring(0, concatAnimals.length-1);
            tab.add({
                xtype: 'panel',
                id: 'waterCal'

            })

            // Find the element to manipulate
            var parentId = tab.getEl().id;
            var child = Ext4.get(parentId + '-innerCt');

            // Remove any old tab content from previous animal selections
            var childToRemove = child.down('.labkeyWaterMonitoringDiv');
            if (childToRemove) {
                Ext4.destroy(childToRemove);
            }

            // Inject a div to render into
            var targetElement = child.createChild({tag: 'div'});
            targetElement.addCls('labkeyWaterMonitoringDiv');
            var id = Ext4.id(targetElement, "waterMonitoring");

            // Render the web part to the div
            var waterCalendar = new LABKEY.WebPart({
                partName: 'Water Calendar',
                renderTo: id,
                partConfig: {animalIds : concatAnimals,numberOfRenders: calendarRender}
            });
            waterCalendar.render();

            // We know the height of the component, so just set it explicitly instead of making ExtJS get the layout
            // and sizing correct
            tab.setHeight(600);
        }


    }

    console.log ("new render");
    //animalIds.forEach(id => console.log (id));

}