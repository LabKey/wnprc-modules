import { Modification, ModRecord, ModTypes } from '../types/typings';

export const CELL_SIZE = 30; // number of pixels of a cell for length/width
export const SVG_WIDTH = 1290; // width of the layout svg
export const SVG_HEIGHT = 810; // height of the layout svg

//TODO finish styles
export const Modifications: ModRecord = {
    [ModTypes.StandardFloor]: {
        name: "Standard Floor",
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    [ModTypes.MeshFloor]: {
        name: "Mesh Floor",
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
        styles: [
            {
                property: "stroke",
                value: "none"
            }
        ]
    },
    [ModTypes.SolidDivider]: {
        name: "Solid Divider",
        styles: [{
            property: "stroke",
            value: "black"
        }]
    },
    [ModTypes.PCDivider]: {
        name: "Protected Contact Divider",
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
    [ModTypes.VCDivider]: {
        name: "Visual Contact Divider",
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
        styles: [{
            property: "stroke",
            value: "none"
        }]
    },
    [ModTypes.CTunnel]: {
        name: "C-Tunnel",
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
    },
    [ModTypes.PlayCage]: {
        name: "Play Cage",
        styles: [{
            property: "stroke",
            value: "black"
        },{
            property: "stroke-width",
            value: "1px"
        },{
            property: "fill",
            value: "#6D88C4"
        }]
    },
}