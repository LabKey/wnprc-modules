Ext4.namespace('EHR.Reports');
let calendarRender = 0;
let entireColony = false;

EHR.reports.animalWaterCalendar = function (panel, tab){

    var animalIds = [];
    //debugger;
    if (tab.filters.subjects){
        // tab.filters.subjects.forEach (animalId => animalIds+=animalId+';');
        // animalIds = animalIds.substring(0, animalIds.length-1);
        animalIds = tab.filters.subjects;
        renderCalendar (animalIds, tab);
        calendarRender++;
    } if (panel.getFilterArray(tab).nonRemovable.length === 0){
        entireColony = true;
        panel.resolveSubjectsFromHousing(tab,renderCalendar,this);
        //renderCalendar('null', tab)
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

            //TODO: not remove child everytime 
            // Remove any old tab content from previous animal selections
            var childToRemove = child.down('.labkeyWaterMonitoringDiv');
            if (childToRemove) {
                Ext4.destroy(childToRemove);
            }

            // Inject a div to render into
            var targetElement = child.createChild({tag: 'div'});
            targetElement.addCls('labkeyWaterMonitoringDiv');
            var id = Ext4.id(targetElement, "waterMonitoring");

            let objectConfig ={}
            if(!entireColony){
                objectConfig = {animalIds : concatAnimals,numberOfRenders: calendarRender,unbindComponents:'waterInfoPanel,calendarLegend,waterExceptionPanel'};

            }else if(entireColony){
                objectConfig = {animalIds : 'null',numberOfRenders: calendarRender,unbindComponents:'waterInfoPanel,calendarLegend,waterExceptionPanel'};
            }
            // Render the web part to the div
            //TODO: add condition to check to request webpart only the first time

            var waterCalendar = new LABKEY.WebPart({
                partName: 'Water Calendar',
                renderTo: id,
                //partConfig: {animalIds : concatAnimals,numberOfRenders: calendarRender}
                partConfig: objectConfig,
                supressRenderErrors: true
            });


            waterCalendar.render();

            // We know the height of the component, so just set it explicitly instead of making ExtJS get the layout
            // and sizing correct
            tab.setHeight(1000);
        }


    }

    console.log ("new render");
    //animalIds.forEach(id => console.log (id));

}
