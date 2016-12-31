/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};
EHR.Server.TriggerManager = {};

/**
 * This class is used to manage the set of trigger event handlers registered with EHR.
 * Other modules can register handlers that will be called at specific points in the validation scripts
 */
EHR.Server.TriggerManager = new function(){
    var events = {};
    var queryEvents = {};
    var properties = {

    };

    return {
        /**
         * Constants representing the hooks available for triggers
         * @type {Object}
         */
        Events: {
            INIT: 'init',
            BEFORE_INSERT: 'beforeInsert',
            AFTER_INSERT: 'afterInsert',
            BEFORE_DELETE: 'beforeDelete',
            AFTER_DELETE: 'afterDelete',
            BEFORE_UPDATE: 'beforeUpdate',
            AFTER_UPDATE: 'afterUpdate',
            BEFORE_UPSERT: 'beforeUpsert',
            AFTER_UPSERT: 'afterUpsert',
            ON_BECOME_PUBLIC: 'onBecomePublic',
            AFTER_BECOME_PUBLIC: 'afterBecomePublic',
            COMPLETE: 'complete',
            DESCRIPTION: 'description'
        },

        /**
         * Can be used to register a handler that will be included on all tables
         * @param event One of the events in EHR.Server.TriggerManager.Events
         * @param handler A function that will be called.  The arguments vary by event
         */
        registerHandler: function(event, handler){
            if (!events[event]){
                events[event] = [];
            }

            events[event].push(handler);
        },

        /**
         * Can be used to register a handler that will be included on a specific query
         * @param event One of the events in EHR.Server.TriggerManager.Events
         * @param handler A function that will be called.  The arguments vary by event
         */
        registerHandlerForQuery: function(event, schemaName, queryName, handler){
            if (!queryEvents[schemaName]){
                queryEvents[schemaName] = {};
            }

            if (!queryEvents[schemaName][queryName]){
                queryEvents[schemaName][queryName] = {};
            }

            if (!queryEvents[schemaName][queryName][event]){
                queryEvents[schemaName][queryName][event] = [];
            }

            queryEvents[schemaName][queryName][event].push(handler);
        },

        getHandlers: function(event){
            return events[event] || [];
        },

        /**
         * This will return an array of all handlers registers for the requested event for the
         * requested table.
         * @param event One of the events in EHR.Server.TriggerManager.Events
         * @param schemaName
         * @param queryName
         * @param includeAll If true, any handlers registered for all tables will be appended first.  This is usually the desired behavior
         * @return {Array}
         */
        getHandlersForQuery: function(event, schemaName, queryName, includeAll){
            var handlers = [];

            //optionally append handlers for all tables
            if (includeAll && events[event])
                handlers = handlers.concat(events[event]);

            if (!queryEvents[schemaName])
                return handlers;

            if (!queryEvents[schemaName][queryName])
                return handlers;

            if (!queryEvents[schemaName][queryName][event])
                return handlers;

            handlers = handlers.concat(queryEvents[schemaName][queryName][event]);

            return handlers;
        },

        setProperty: function(name, value){
            properties[name] = value;
        },

        getProperty: function(name){
            return properties[name];
        }
    }
};