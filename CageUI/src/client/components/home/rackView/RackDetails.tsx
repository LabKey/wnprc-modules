import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';

export const RackDetails: FC = () => {
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();


    return (
        <div>
            Rack Details
        </div>
    );
}

type Point = { x: number; y: number };

class CoordinateTransformer {
    private roomWidth: number;
    private roomHeight: number;

    constructor(roomWidth: number, roomHeight: number) {
        this.roomWidth = roomWidth;
        this.roomHeight = roomHeight;
    }

    getFullRoomCoords(groupCoord: Point, rackCoord: Point, cageCoord: Point): Point {
        return {
            x: groupCoord.x + rackCoord.x + cageCoord.x,
            y: groupCoord.y + rackCoord.y + cageCoord.y
        };
    }

    getGroupViewCoords(groupCoord: Point, rackCoord: Point, cageCoord: Point): Point {
        return {
            x: rackCoord.x + cageCoord.x,
            y: rackCoord.y + cageCoord.y
        };
    }

    getRackViewCoords(groupCoord: Point, rackCoord: Point, cageCoord: Point): Point {
        return cageCoord; // Just use the cage's offset from rack
    }

    getCageViewCoords(groupCoord: Point, rackCoord: Point, cageCoord: Point): Point {
        return { x: 0, y: 0 }; // Single object view centers at origin
    }

    getViewportDimensions(viewType: 'room' | 'group' | 'rack' | 'cage', contentDimensions: { width: number; height: number }): { width: number; height: number } {
        switch (viewType) {
            case 'room':
                return { width: this.roomWidth, height: this.roomHeight };
            case 'group':
            case 'rack':
            case 'cage':
                return contentDimensions;
            default:
                throw new Error(`Unknown view type: ${viewType}`);
        }
    }
}

// Example usage:
const transformer = new CoordinateTransformer(1000, 1000);

// Define coordinates for a cage
const groupCoord = { x: 100, y: 200 };
const rackCoord = { x: 50, y: 30 };
const cageCoord = { x: 10, y: 5 };

// Get coordinates in different views
console.log('Room view:', transformer.getFullRoomCoords(groupCoord, rackCoord, cageCoord));
console.log('Group view:', transformer.getGroupViewCoords(groupCoord, rackCoord, cageCoord));
console.log('Rack view:', transformer.getRackViewCoords(groupCoord, rackCoord, cageCoord));
console.log('Cage view:', transformer.getCageViewCoords(groupCoord, rackCoord, cageCoord));