/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext');

/**
 * Constructs a new EHR NavMenu using the supplied configuration.
 * @class
 * EHR extension to Ext.Panel, which is designed to create simple, consistently formatted lists of links for navigation.
 * @constructor
 * @augments Ext.Panel
 * @param config Configuration properties. This may contain any of the configuration properties supported by the Ext.Panel, plus those listed here.
 *
 * @param {Integer} [config.colWidth] The width of the NavPanel
 * @param {Function} [config.renderer] A function that will be used to render each section item.  It will be passed the item object (see config.sections) and should return an object suitable to add() to an Ext.Panel.  If not renderer is provided, the a default renderer will be used.
 * @param {Array} [config.sections] An array of objects describing the sections in this NavMenu.  Each section will be given a header line.  Each section config object should contain the following properties:
 * <li>header: The string to be used as the header for this section</li>
 * <li>items: An array of objects describing the items in the section.  Each item is usually one link or row of links.  The item objects can contain any properties that will be interpreted by the renderer function.  If the default renderer is used, the item objects only need to contain name and url properties.
 *
 * @example &lt;script type="text/javascript"&gt;
    Ext.onReady(function(){
        var panel = new EHR.ext.NavMenu({
            renderTo: 'targetDiv',
            width: 800,
            autoHeight: true,
            sections: [{
                header: 'Section 1',
                items: [{
                    name: 'Link 1',
                    url: 'http://labkey.com'
                },{
                    name: 'Link 2',
                    url: 'http://yourSite.com'
                }],
            },{
                header: 'Section 2',
                items: [{
                 name: 'Link 1',
                 url: 'http://labkey.com'
                },{
                 name: 'Link 2',
                 url: 'http://yourSite.com'
                }]
            }]
        });
    });


&lt;/script&gt;
&lt;div id='targetDiv'/&gt;
 */
EHR.ext.NavMenu = Ext.extend(Ext.Panel, {
    initComponent: function(){
        //calculate size
        var maxHeight = this.maxHeight || 15;

        var size = 0;
        for (var i=0;i<this.sections.length;i++){
            //for the header
            size++;
            size += this.sections[i].items.length;
        }

        var columns = Math.ceil(size / maxHeight);

        Ext.apply(this, {
            border: false,
            width: this.width || '80%',
            bodyStyle: 'background-color: transparent;',
            defaults: {
                border: false,
                style: 'background-color: transparent;',
                bodyStyle: 'background-color: transparent;'
            }
        });

        EHR.ext.NavMenu.superclass.initComponent.call(this);

        for (var i=0;i<this.sections.length;i++){
            var tmp = this.sections[i];

            var section = this.add({
                xtype: 'panel',
                title: tmp.header + ':',
                width: this.colWidth,
                style: 'padding-bottom:15px;padding-right:10px;background-color: transparent;',
                bodyStyle: 'background-color: transparent;',
                headerCfg: {
                    cls: 'ehr-nav-header',
                    style: 'margin-bottom:5px;'
                },
                defaults: {
                    border: false,
                    style: 'padding-left:5px;background-color: transparent;',
                    bodyStyle: 'background-color: transparent;'
                }
            });

            for (var j=0;j<tmp.items.length;j++){
                var item;
                if(this.renderer){
                    item = this.renderer(tmp.items[j])
                }
                else {
                   //NOTE: this is the default renderer
                   item = {
                       //Creates links for the navegation panel
                        html: '<a href="'+tmp.items[j].url+'">'+tmp.items[j].name+'</a>'
                    }
                }
                section.add(item)
            }

            section.add({tag: 'p'});
        }
    }
});


