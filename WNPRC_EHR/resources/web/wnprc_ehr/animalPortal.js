/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.Reports');

EHR.reports.AnimalPortal =  function(panel2,tab) {
    if (tab.filters.subjects){
        var animalIds = tab.filters.subjects;
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


            var panel = tab.add({id: 'filesDiv', style: 'margin-bottom:20px'});
            //toAdd.push({id: 'filesDiv', style: 'margin-bottom:20px'});

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
                            if (hasInsert)
                            {
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
                                            text: 'Create folder',
                                            handler: function ()
                                            {
                                                animalFolder.createDirectory({
                                                    path: "/@files/" + animalIds + "/",
                                                    success: function ()
                                                    {
                                                        console.log("folder created for " + animalIds);
                                                        handler(location.id);
                                                    },
                                                    failure: function (error)
                                                    {
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


