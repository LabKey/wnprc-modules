/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import { ModLocations, ModRecord, ModTypes } from '../types/typings';

export const CELL_SIZE = 30; // number of pixels of a cell for length/width
export const SVG_WIDTH = 1290; // width of the layout svg
export const SVG_HEIGHT = 810; // height of the layout svg

//TODO finish styles
export const Modifications: ModRecord = {
    [ModTypes.StandardFloor]: {
        name: "Standard Floor",
        svgIds: {
            [ModLocations.Bottom]: ['floor'],
            [ModLocations.Top]: ['ceiling']
        },
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    [ModTypes.MeshFloor]: {
        name: "Mesh Floor",
        svgIds: {
            [ModLocations.Bottom]: ['floor'],
            [ModLocations.Top]: ['ceiling']
        },
        styles: [
            {
                property: "stroke",
                value: "black"
            },
            {
                property: "stroke-dasharray",
                value: "10"
            }
        ]
    },
    [ModTypes.MeshFloorX2]: {
        name: "Mesh Floor x2",
        svgIds: {
            [ModLocations.Bottom]: ['floor'],
            [ModLocations.Top]: ['ceiling']
        },
        styles: [
            {
                property: "stroke",
                value: "black"
            },
            {
                property: "stroke-dasharray",
                value: "10 5 10"
            },{
                property: "stroke-width",
                value: "2"
            }
        ]
    },
    [ModTypes.NoFloor]: {
        name: "No Floor",
        svgIds: {
            [ModLocations.Bottom]: ['floor'],
            [ModLocations.Top]: ['ceiling']
        },
        styles: [
            {
                property: "stroke",
                value: "none"
            }
        ]
    },
    [ModTypes.SolidDivider]: {
        name: "Solid Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    [ModTypes.PCDivider]: {
        name: "Protected Contact Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "2 5 2"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    [ModTypes.SPDivider]: {
        name: "Social Panel Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "2 5 2 5"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    [ModTypes.VCDivider]: {
        name: "Visual Contact Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "5 10 5 10 5 10"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    [ModTypes.PrivacyDivider]: {
        name: "Privacy Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-dasharray",
            value: "1 1 1 1 1 1"
        },{
            property: "stroke-width",
            value: "4"
        }]
    },
    [ModTypes.NoDivider]: {
        name: "No Divider",
        svgIds: {
            [ModLocations.Left]: ['left'],
            [ModLocations.Right]: ['right']
        },
        styles: [{
            property: "stroke",
            value: "none"
        }]
    },
    [ModTypes.CTunnel]: {
        name: "C-Tunnel",
        svgIds: {
            [ModLocations.Top]: ['cTunnel-circle', 'cTunnel-top'],
            [ModLocations.Bottom]: ['cTunnel-circle', 'cTunnel-bottom'],
            [ModLocations.Left]: ['cTunnel-circle', 'cTunnel-left'],
            [ModLocations.Right]: ['cTunnel-circle', 'cTunnel-right'],
        },
        styles: [{
            property: "stroke",
            value: "black",
        },{
            property: "stroke-width",
            value: "1px",
        }
        ]
    },
    [ModTypes.Extension]: {
        name: "Extension",
        svgIds: {
            [ModLocations.Direct]: ['extension'],
        },
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-width",
            value: "1px"
        },{
            property: "fill",
            value: "#FCB017"
        }]
    }
}