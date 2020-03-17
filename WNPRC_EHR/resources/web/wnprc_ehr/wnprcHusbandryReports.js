Ext4.namespace('EHR.reports');

EHR.reports.waterGridCalendar = function (panel, tab) {
    var subjects = tab.filters.subjects || [];
    if (subjects.length){
        for (var i=0; i< subjects.length; i++ ){
            var subject = subjects[i];

            var filterArray = panel.getFilterArray(tab);
            filterArray.nonRemovable.push(LABKEY.Filter.create('animalId', subject, LABKEY.Filter.Types.EQUAL));

            var date = new Date();
            console.log ('current date '+ date+ ' formatted date '+ date.format(LABKEY.extDefaultDateFormat));
            console.log ('SUBJECTS '+ subject);

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'WaterScheduleWithWeight',
                filterArray: filterArray.removable.concat(filterArray.nonRemovable),
                columns: 'animalId, date, volume, assignedToTitleCoalesced',
                sort: 'animalId, date',
                requiredVersion: 9.1,
                parameters: {'NumDays': '180', 'StartDate': '2020-03-16'},
                success: Ext4.Function.pass(function(subj, results){
                    if (!results.rowCount){
                        tab.update('');
                        tab.add({
                            html: 'No animal selected to display water grid schedule'
                        });
                        return;
                    }
                    Ext4.each(results.rows, function(row){
                        console.log ('some results for '+ row.animalId);
                        tab.add({
                            html: 'display grid'
                        })

                    }, this)
                })
            })
        }
    }
    
};