/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.Reports');

EHR.reports.AnimalPortal =  function(panel2,tab) {
    if (tab.filters.subjects){
        var animalIds = tab.filters.subjects[0];
        renderFiles(animalIds,tab);
    }

    function renderFiles(subjects, tab)
    {
        if (!subjects.length){
            tab.add({
                html:'No animals were found',
                border : false
            });

            return;
        }
        var toAdd = [];

        if (subjects.length >1)
        {
            var containerPath = LABKEY.container.path+'/AnimalPortal';
            var animalFolder = new LABKEY.FileSystem.WebdavFileSystem({baseUrl: LABKEY.ActionURL.getBaseURL() + '_webdav' + containerPath});
            var location = {id: animalIds};
            //animalFolder.listFiles({success:function(){console.log("success",arguments)},failure:function(){console.log("failed",arguments)},forceReload:true,path:"/@files/animalPortal/"});
            console.log("Id of animal  " + animalIds);

            tab.add({
                xtype: 'label',
                html: 'Ultrasounds for breeding or diagnosis issues label with the date (YYYY-MM-DD) and ultrasound purpose (example: ultrasounds -> pregnancies -> 2020 -> 2020-11-10).<br/>' +
                        'Organize experimental ultrasounds under the pregnancies folder.<br/>' +
                        '<strong>Instructions for research ultrasounds:</strong><br/>' +
                        'Label each of the animal pregnancies by the year the pregnancy occurred (example: ultrasounds -> pregnancies -> 2020).<br/>' +
                        'For pregnancies with overlapping or multiple pregnancies make sure to include both years (example: ultrasounds -> pregnancies -> 2020-2021).<br/>' +
                        'Within the folder for the animal pregnancy (example: 2020) include the ultrasounds organized by folders labeled with the year, month, ' +
                        'the day ultrasound images are acquired <br/>' +
                        '(example: ultrasounds -> pregnancies -> 2020 -> 2020-11-10).'
            });

            var panel = tab.add({id: 'filesDiv', style: 'margin-bottom:20px'})

            var handler = function (location)
            {
                var webPart = new LABKEY.WebPart({
                    title: 'Animal Portal for ' + animalIds,
                    partName: 'Files',
                    renderTo: 'filesDiv-body',
                    containerPath: containerPath,
                    partConfig: {path:  location},
                    success: function ()
                    {
                        panel.setHeight(450);
                    }
                });
                webPart.render();
                // toAdd.push(panel);

            };




            animalFolder.listFiles({
                success: function ()
                {
                    console.log("success", arguments);
                    handler(location.id);
                },
                path: "/@files/" + animalIds + "/",
                failure: function (error, response)
                {
                    LABKEY.Security.getUserPermissions({
                        containerPath: containerPath,
                        success: function(userPermsInfo) {
                            var hasInsert = false;
                            for (var i = 0; i < userPermsInfo.container.effectivePermissions.length; i++) {
                                if (userPermsInfo.container.effectivePermissions[i] == 'org.labkey.api.security.permissions.InsertPermission') {
                                    hasInsert = true;
                                }
                            }
                            if (hasInsert) {
                                panel.add({
                                    xtype: 'ldk-webpartpanel',
                                    title: 'Animal Portal for ' + animalIds,
                                    //text:  'No directory found for this animal',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: 'No directory found for this animal. To upload files, create a directory by clicking on the button below.'
                                        },
                                        {
                                            xtype: 'label',
                                            html: '<br/><br/>'

                                        },
                                        {
                                            xtype: 'button',
                                            style: 'margin-left: 10px;',
                                            border: true,
                                            text: 'Create folders',
                                            handler: function () {
                                                animalFolder.createDirectory({
                                                    path: "/@files/" + animalIds + "/",
                                                    success: function () {
                                                        const folders = [
                                                            "Ultrasounds",
                                                            "Radiology Reports",
                                                            "Medical Record",
                                                            "Misc Docs",
                                                            "Images",
                                                            "Lab Reports",
                                                            "Anesthesia Reports"
                                                        ];
                                                        var createdCount = 0;
                                                        folders.forEach(function (folder) {
                                                            animalFolder.createDirectory({
                                                                path: "/@files/" + animalIds + "/" + folder,
                                                                success: function () {
                                                                    console.log("created " + folder + " folder for " + animalIds);
                                                                    createdCount++;
                                                                    if (createdCount === folders.length) {
                                                                        handler(location.id);
                                                                    }
                                                                    console.log("folder created for " + animalIds);

                                                                    var createYears = 0;
                                                                    if (folder === "Medical Record"){
                                                                        AddComment("/@files/" + animalIds + "/" + folder ,"Add vendor's medical record inside this folder")
                                                                    }
                                                                    if (folder === "Ultrasounds"){
                                                                        AddComment("/@files/" + animalIds + "/" + folder ,"Add pregnancies ultrasounds inside the pregnancies folder");
                                                                        var createPregnancyFolder = 0;
                                                                        animalFolder.createDirectory({
                                                                            path:"/@files/" + animalIds + "/" + folder + "/Pregnancies",
                                                                            success: function(){
                                                                                console.log("created pregnancies folder for " + animalIds);
                                                                                createPregnancyFolder++;
                                                                                if (createPregnancyFolder === 1){
                                                                                    handler(location.id);
                                                                                }
                                                                                console.log ("folder created for pregnancies for animal " + animalIds);

                                                                                //Create a folder for the year
                                                                                let year = new Date().getFullYear();
                                                                                animalFolder.createDirectory({
                                                                                    path: "/@files/" + animalIds + "/" + folder + "/Pregnancies/" + year,
                                                                                    success: function (data){
                                                                                        console.log("created " + folder + " folder for " + animalIds);
                                                                                        console.log("value of data "+ data);
                                                                                        createYears++;
                                                                                        if (createYears === 1) {
                                                                                            handler(location.id);
                                                                                            AddComment("/@files/" + animalIds + "/" + folder + "/Pregnancies/" + year,"Add images to the corresponding date folder within the year folder");
                                                                                        }
                                                                                        console.log("folder created for " + animalIds);

                                                                                        //Creating a folder for the current date
                                                                                        let createDateFolder = 0;
                                                                                        let today = new Date();
                                                                                        let monthNumber = today.getMonth() + 1;
                                                                                        let dateString = today.getFullYear() + "-" + monthNumber + "-" + today.getDate();
                                                                                        animalFolder.createDirectory({
                                                                                            path: "/@files/" + animalIds + "/" + folder + "/Pregnancies/" + year + "/" + dateString,
                                                                                            comment: "Create a folder per ultrasound date inside year's folder",
                                                                                            success: function (){
                                                                                                console.log("created " + dateString + " folder for " + animalIds);
                                                                                                createDateFolder++;
                                                                                                if (createDateFolder === 1) {
                                                                                                    handler(location.id);
                                                                                                    AddComment("/@files/" + animalIds + "/" + folder + "/Pregnancies/" + year + "/" + dateString,'Add ultrasound images to the corresponding date folder');
                                                                                                }
                                                                                                console.log("folder created for " + animalIds);

                                                                                            },
                                                                                            failure: function (error) {
                                                                                                console.log("failed to created" + folder + " folder" + error.status)
                                                                                            }
                                                                                        })


                                                                                    },
                                                                                    failure: function (error) {
                                                                                        console.log("failed to created" + folder + " folder" + error.status)
                                                                                    }
                                                                                })

                                                                            }
                                                                        })

                                                                    }
                                                                },
                                                                failure: function (error) {
                                                                    console.log("failed to created" + folder + " folder" + error.status)
                                                                }
                                                            })


                                                        }),
                                                                console.log("folder created for " + animalIds);
                                                    },
                                                    failure: function (error) {
                                                        console.log("failed to created folder" + error.status)
                                                    }
                                                })
                                            }
                                        }]
                                });
                            }
                            else {
                                panel.add({
                                    xtype: 'ldk-webpartpanel',
                                    title: 'Animal Portal for ' + animalIds,
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: 'The current animal does not have any files, and you do not have permission to upload new files.'
                                        }]
                                });
                            }
                        },
                        failure: function(error, response) {
                            var message;
                            if (response.status == 404) {
                                message = 'The folder ' + containerPath + ' does not exist, so no files can be shown or uploaded. Contact EHR services to correct the configuration.';
                            }
                            else if (response.status == 401 || response.status == 403) {
                                message = 'You do not have permission to upload or view files. Contact EHR services to get permission.';
                            }
                            else {
                                message = 'There was an error attempting to load the file data: ' + response.status;
                            }
                            panel.add({
                                xtype: 'ldk-webpartpanel',
                                title: 'Animal Portal for ' + animalIds,
                                items: [
                                    {
                                        xtype: 'label',
                                        text: message
                                    }]
                            });
                        }
                    });
                },

                forceReload: true
            });


            if (File && File.panel && File.panel.Browser && File.panel.Browser._pipelineConfigurationCache)
            {
                File.panel.Browser._pipelineConfigurationCache = {};
            }

        }
        if (toAdd.length){
            panel = tab.add(toAdd);

            //webPart.render();
        }



    }



};

AddComment = function(location, comment){
    let savedLocation = location.replace(" ","%20");
    LABKEY.Query.selectRows({
        schemaName: 'exp',
        queryName: 'Data',
        containerPath: 'WNPRC/EHR/AnimalPortal',
        columns:'rowid,lsid,DataFileUrl,name',
        filterArray:[
            LABKEY.Filter.create('DataFileUrl', savedLocation, LABKEY.Filter.Types.CONTAINS)
        ],
        success: function (data){
            let toUpdate = [];

            if (!data.rows || !data.rows.length){
                return;
            }
            Ext4.Array.forEach(data.rows, function (row){
                let filePath = row.DataFileUrl;
                if (filePath.endsWith(savedLocation)){
                    let obj = {};
                    obj.LSID = row.LSID;
                    obj.rowid = row.RowId;
                    obj['Flag/Comment']= comment;
                    console.log(obj);

                    toUpdate.push(obj);

                }


            });

            if (toUpdate.length){
                LABKEY.Query.updateRows({
                    schemaName: 'exp',
                    queryName: 'Data',
                    containerPath: 'WNPRC/EHR/AnimalPortal',
                    rows: toUpdate,
                    success: function(data){
                        console.log("Add comment to the folder");
                    },
                    failure: function (error)
                    {
                        console.log("failed to created folder" + error.status)
                    }


                });
            }

            /*data = data || {};
            data.rows = data.rows || [];*/
        }


    })
    let folderComment= {
        "flag/Comment": comment
    }



}


