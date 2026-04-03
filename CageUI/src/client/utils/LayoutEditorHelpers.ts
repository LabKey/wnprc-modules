/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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

// Layout Editor Helpers
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import {
    generateUUID,
    getAdjLocation,
    getDefaultMod,
    getTypeClassFromElement,
    parseRoomItemType,
    roomItemToString
} from './helpers';
import {
    Cage,
    CageData,
    CageDirection,
    CageHistoryData,
    CageMods,
    CageNumber,
    CageSvgId,
    DefaultRackTypes,
    FullObjectHistoryData,
    GroupId,
    LayoutHistoryData,
    LocationCoords,
    ModLocations,
    Rack,
    RackData,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemClass,
    RoomItemStringType,
    RoomItemType,
    UnitLocations
} from '../types/typings';
import {
    LayoutDragProps,
    MergeProps,
    OffsetProps,
    RackActions,
    SelectedObj,
    StartDragProps
} from '../types/layoutEditorTypes';
import * as React from 'react';
import { MutableRefObject } from 'react';
import { Security } from '@labkey/api';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';
import { CELL_SIZE } from './constants';
import { fetchCage, fetchCageHistory, fetchRack } from '../api/popularQueries';
import { ConnectedCage, ConnectedRack } from '../types/homeTypes';


export const isTemplateCreator = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission');
};

export const isRoomCreator = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission');
};

export const isRoomModifier = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomModifierPermission');
};

export const isCageModifier = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIModificationEditorPermission');
};

export const isTouchEvent = (event)=> {
    return event.type.startsWith('touch');
}

// removes the wrapper for the id portion of room objects to properly move the object.
export const extractRoomObjId = (id: string) => {
    return id.replace(/-wrapper$/, '');
}

export const processRealLayoutHistory = async (data: LayoutHistoryData[]): Promise<{
    fulfilled: FullObjectHistoryData[];
    rejected: PromiseRejectedResult[]
}> => {

    const processItem = async (item: LayoutHistoryData): Promise<FullObjectHistoryData> => {
        if (item.cage === null) {
            return {
                extraContext: item.extraContext,
                objectType: item.objectType,
                xCoord: item.xCoord,
                yCoord: item.yCoord
            };
        } else {
            const cageHistory: CageHistoryData = await fetchCageHistory(item.historyId, item.cage);
            const cageData: CageData = await fetchCage(cageHistory.cage);
            const rackData: RackData = await fetchRack(cageData.rack);
            return {
                extraContext: item.extraContext,
                objectType: item.objectType,
                xCoord: item.xCoord,
                yCoord: item.yCoord,
                rackGroup: cageHistory.rackGroup,
                groupRotation: cageHistory.groupRotation,
                rack: rackData,
                cage: {cageHistory: cageHistory, cageData: cageData}
            };
        }
    };

    const promises = data.map(async (item) => processItem(item));
    const results = await Promise.allSettled(promises);

    const fulfilled: FullObjectHistoryData[] = [];
    const rejected: PromiseRejectedResult[] = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            fulfilled.push(result.value);
        } else {
            rejected.push(result);
        }
    });

    return {fulfilled, rejected};
};


export const getTranslation = (transform) => {
    // Regex to extract the translate(x, y) values
    const translate = transform.match(/translate\(([^)]+)\)/);
    if (translate) {
        const [x, y] = translate[1].split(',').map(Number);
        return {x, y};
    }
    return {x: 0, y: 0}; // Default to (0, 0) if no translation is found
};

export const createEmptyUnitLoc = (): UnitLocations => {
    return (
        Object.fromEntries(
            Object.values(RackTypes)
                .filter((value) => typeof value === 'number') // Filter out the numeric values from enum
                .map((rackType) => [
                    roomItemToString(rackType as RackTypes),
                    [] as LocationCoords[],
                ])
        ) as UnitLocations
    );
};

export const parseWrapperId = (input: string): RoomItemStringType => {
    const regex = /^[a-zA-Z]+/; // matches "x_template_wrapper"

    const match = input.match(regex);
    if (match) { // if a match return whatever x is (any string of chars)
        return match[0] as RoomItemStringType;
    }
    return;
};


export const drawGrid = (layoutSvg: d3.Selection<SVGElement, unknown, any, any>, updateGridProps) => {
    const transform = zoomTransform(layoutSvg.node());
    layoutSvg.select('.grid').remove();
    layoutSvg.append('g')
        .attr('class', 'grid')
        .attr('id', 'layout-grid')
        .attr('width', updateGridProps.width)
        .attr('height', updateGridProps.height)
        .attr('transform', `translate(0,0) scale(${transform.k})`);
    updateGrid(zoomTransform(layoutSvg.node()), updateGridProps.width, updateGridProps.height, updateGridProps.gridSize); // Draw grid with the initial view
};

export const updateGrid = (transform, width, height, gridSize) => {
    const g = d3.select('g.grid');
    g.selectAll('.cell').remove(); // Clear existing grid

    // Calculate grid bounds (starting and ending points) based on transform
    const xMin = Math.floor(-transform.x / transform.k / gridSize) * gridSize;
    const yMin = Math.floor(-transform.y / transform.k / gridSize) * gridSize;
    const xMax = Math.ceil((width - transform.x) / transform.k / gridSize) * gridSize;
    const yMax = Math.ceil((height - transform.y) / transform.k / gridSize) * gridSize;

    // Draw the grid within the current visible area
    for (let x = xMin; x < xMax; x += gridSize) {
        for (let y = yMin; y < yMax; y += gridSize) {
            g.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('class', 'cell')
                .attr('width', gridSize)
                .attr('height', gridSize)
                .attr('fill', 'none')
                .attr('stroke', 'lightgray');
        }
    }
};

// Confirmation popup for merging two racks, built using d3 svg manipulation.
function showConfirmationPopup(): Promise<RackActions> {
    return new Promise((resolve) => {

        const overlay = d3.select('body').append('div')
            .attr('class', 'overlay')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100vw')
            .style('height', '100vh')
            .style('background', 'rgba(0, 0, 0, 0.5)')
            .style('z-index', '999')  // Ensure it's above other content
            .style('display', 'block'); // Initially hidden

        // Create a simple popup
        const popup = overlay.append('div')
            .attr('class', 'popup')
            .style('position', 'absolute')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'white')
            .style('padding', '20px')
            .style('border', '1px solid black');

        popup.append('p')
            .text('What action would you like to perform?');

        // Merge button
        popup.append('button')
            .text('Merge Cages')
            .on('click', () => {
                overlay.remove();
                resolve('merge');
            });

        // Connect button
        popup.append('button')
            .text('Connect Racks')
            .on('click', () => {
                overlay.remove();
                resolve('connect');
            });

        // Cancel button
        popup.append('button')
            .text('Cancel')
            .on('click', () => {
                overlay.remove();
                resolve('cancel');
            });
    });
}

export function showLayoutEditorConfirmation(msg: string) {
    return new Promise((resolve) => {

        const overlay = d3.select('body').append('div')
            .attr('class', 'overlay')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100vw')
            .style('height', '100vh')
            .style('background', 'rgba(0, 0, 0, 0.5)')
            .style('z-index', '999')  // Ensure it's above other content
            .style('display', 'block'); // Initially hidden

        // Create a simple popup
        const popup = overlay.append('div')
            .attr('class', 'popup')
            .style('position', 'absolute')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'white')
            .style('padding', '20px')
            .style('border', '1px solid black');

        popup.append('p')
            .text(msg);

        popup.append('button')
            .text('Yes')
            .on('click', () => {
                overlay.remove();
                resolve(true);
            });

        popup.append('button')
            .text('No')
            .on('click', () => {
                overlay.remove();
                resolve(false);
            });
    });
}

// Confirmation popup for merging two racks
export function showLayoutEditorError(errorMsg: string) {
    return new Promise((resolve) => {
        // Create a simple popup
        const overlay = d3.select('body').append('div')
            .attr('class', 'overlay')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100vw')
            .style('height', '100vh')
            .style('background', 'rgba(0, 0, 0, 0.5)')
            .style('z-index', '999')  // Ensure it's above other content
            .style('display', 'block'); // Initially hidden

        const popup = overlay.append('div')
            .attr('class', 'popup')
            .style('position', 'absolute')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'white')
            .style('padding', '20px')
            .style('border', '1px solid black');

        popup.append('p')
            .text(errorMsg);

        // Cancel button
        popup.append('button')
            .text('Ok')
            .on('click', () => {
                overlay.remove();
                resolve(true);
            });
    });
}

// Function to help merge/connect racks together by resetting groups to local coords
function resetNodeTranslationsWithZoom(targetNode, draggedNode, layoutSvg) {

    // Get the zoom transform of the layout SVG
    const layoutTransform = d3.zoomTransform(layoutSvg.node());

    // Get the translations of the two nodes (current positions)
    const {x: translateX1, y: translateY1} = getTranslation(targetNode.getAttribute('transform'));
    const {x: translateX2, y: translateY2} = getTranslation(draggedNode.getAttribute('transform'));

    // Calculate the dynamic distance between the two nodes before resetting
    // Remove the zoom scale from the distance to keep it zoom-independent
    const distanceX = (translateX2 - translateX1) / layoutTransform.k;  // Correct the distance using zoom scale
    const distanceY = (translateY2 - translateY1) / layoutTransform.k;  // Correct Y in case there's any Y translation

    // Reset the first node to (0, 0) in the new group
    targetNode.setAttribute('transform', `translate(0, 0)`);

    // Set the second node to be exactly at the dynamic distance relative to the first node
    draggedNode.setAttribute('transform', `translate(${distanceX}, ${distanceY})`);
}

export function setupEditCageEvent(
    cageGroupElement: SVGGElement,
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>,
    localRoomRef: MutableRefObject<Room>,
    setCtxMenuStyle?: React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
): () => void {

    // Main context menu handler
    const handleContextMenu = (event: MouseEvent | CustomEvent) => {
        // Only block native menu if we're using a custom one
        if (setCtxMenuStyle && event.defaultPrevented === false) {
            event.preventDefault();
        }

        const element = event.target as SVGGElement;
        let tempObj: SelectedObj;

        if (d3.select(element.parentElement).classed('room-obj')) {
            tempObj = localRoomRef.current.objects.find(obj => obj.itemId === element.id);
        } else {
            const cageGroupElement = element.closest(`[id^="cageSVG_"]`) as SVGGElement | null;
            const cageObj = localRoomRef.current.rackGroups
                .flatMap(g => g.racks)
                .flatMap(r => r.cages)
                .find(c => c.svgId === cageGroupElement?.id);
            tempObj = cageObj;
        }

        if (!tempObj) return; // safety

        setSelectedObj(tempObj);

        if (setCtxMenuStyle) {
            const clientX = (event as MouseEvent).clientX;
            const clientY = (event as MouseEvent).clientY;

            setCtxMenuStyle({
                display: 'block',
                left: `${clientX}px`,
                top: `${clientY - 5}px`,
            });
        }
    };

    // Touch gesture handlers
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchTimer: number | null = null;
    let isDragging = false;

    const handleTouchStart = (event: TouchEvent) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        touchStartTime = Date.now();
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = false;

        if (touchTimer) clearTimeout(touchTimer);

        // ⚠️ DO NOT preventDefault() here — let long-press begin!
        touchTimer = window.setTimeout(() => {
            if (!isDragging) {
                event.preventDefault();
                // Create a trusted synthetic contextmenu event for iOS
                const contextMenuEvent = new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                }) as MouseEvent;

                // Dispatch directly on the element
                cageGroupElement.dispatchEvent(contextMenuEvent);
            }
        }, 500); // iOS default long-press is ~500ms
    };

    const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);

        if (dx > 10 || dy > 10) {
            isDragging = true;
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        }
    };

    const handleTouchEnd = (event: TouchEvent) => {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    };

    // Attach listeners
    cageGroupElement.addEventListener('contextmenu', handleContextMenu);
    cageGroupElement.addEventListener('touchstart', handleTouchStart);
    cageGroupElement.addEventListener('touchmove', handleTouchMove);
    cageGroupElement.addEventListener('touchend', handleTouchEnd);

    // Optional: Also support desktop right-click directly
    cageGroupElement.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // right click
            handleContextMenu(e);
        }
    });

    return () => {
        cageGroupElement.removeEventListener('contextmenu', handleContextMenu);
        cageGroupElement.removeEventListener('touchstart', handleTouchStart);
        cageGroupElement.removeEventListener('touchmove', handleTouchMove);
        cageGroupElement.removeEventListener('touchend', handleTouchEnd);
        // Also remove mousedown listener if added
        cageGroupElement.removeEventListener('mousedown', (e) => { if (e.button === 2) handleContextMenu(e); });
    };
}


/*
    Helper function to either connect racks or merge cages

    One can think of a merge as at the cage level and connections are at a rack level.
    Even though cages can not be added/removed from racks in reality, for layout building purposes they can.

 */
export async function mergeRacks(props: MergeProps) {
    const {
        contextMenuRef,
        targetRack,
        draggedRack,
        targetRackGroup,
        dragRackGroup,
        doRackAction,
        layoutDrag,
        cageActionProps,
        dragCageId,
        targetCageId
    } = props;
    if (!d3.select('.popup').empty()) {
        return false;
    }
    const action: RackActions = await showConfirmationPopup();
    const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('[id=layout-svg]');

    function isConnected(selectionNode) {
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles, give merged cages a grouped class
    function resetElementProperties(element: SVGGElement, shapeType, action) {
        if (action === 'merge') {
            element.setAttribute('class', `grouped-${shapeType}`);
            element.setAttribute('style', '');
        }
        setupEditCageEvent(element, cageActionProps.setSelectedObj, contextMenuRef, cageActionProps.setCtxMenuStyle);
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup, action: RackActions) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'));
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetShape = d3.select(this);
            let shapeType: RackStringType;
            if (action === 'merge') {
                shapeType = parseRoomItemType(targetShape.attr('id')) as RackStringType;
            } else {
                shapeType = getTypeClassFromElement(targetShape.node()) as RackStringType;
            }
            const {x: localX, y: localY} = getTranslation(targetShape.attr('transform'));
            const newX = startX + localX;
            const newY = startY + localY;
            targetShape.attr('transform', `translate(${newX},${newY})`);

            // When connecting merged groups that have been connected before make sure to reset each cage but
            // add the rack shape instead of cage shape
            const mergedChildren = d3.select(this).selectAll(':scope > g');
            if (!mergedChildren.empty()) {
                mergedChildren.each(function () {
                    resetElementProperties(this as SVGGElement, shapeType, action);
                });
            } else {
                resetElementProperties(this as SVGGElement, shapeType, action);
            }
            mergedGroup.node().appendChild(this);
        });
    }

    function processShape(shape, action, mergedGroup) {
        if (action === 'merge') {
            processChildNodes(shape, mergedGroup, action);
        } else {
            if (shape.getAttribute('class').includes('rack-group')) {
                processChildNodes(shape, mergedGroup, action);
            } else {// When connecting racks for the first time
                // this iteration is for connecting a merged rack, have to reset each cage in the rack but add the rack shape not the cage shape
                d3.select(shape).selectAll(':scope > g').each(function () {
                    resetElementProperties(this as SVGGElement, getTypeClassFromElement(shape), action);
                });

                mergedGroup.node().appendChild(shape);
            }
        }
    }

    if (action !== 'cancel') {
        let targetRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id=${targetRack.svgId}]`);

        let draggedRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id=${draggedRack.svgId}]`);

        let newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>;

        // Clone the target and dragged shapes before using
        let clonedTargetShape = targetRackShape.node().cloneNode(true) as Element;
        let clonedDraggedShape = draggedRackShape.node().cloneNode(true) as Element;

        let targetRackSvgId = clonedTargetShape.id;
        let draggedRackSvgId = clonedDraggedShape.id;

        if (action === 'merge') {
            if (isConnected(draggedRackShape.node()) || isConnected(targetRackShape.node())) {
                await showLayoutEditorError('Invalid Configuration: Please do not merge connected racks');
                return;
            }
            newGroup = layoutSvg.append('g')
                .attr('class', targetRackShape.attr('class'))
                .attr('id', targetRackShape.attr('id'));
            //Reset translates to new local group
            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            processShape(clonedTargetShape, action, newGroup);
            processShape(clonedDraggedShape, action, newGroup);

            // Copy any inline styles from the targetShape to the merged group
            const styleAttr = targetRackShape.attr('style');
            if (styleAttr) {
                newGroup.attr('style', styleAttr);
            }
        } else { // action = connect

            // If connecting already connected groups these will be populated
            const connectedTargetGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${targetRackGroup.groupId}`);

            const connectedDragGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${dragRackGroup.groupId}`);

            if (!connectedTargetGroupShape.empty()) {
                clonedTargetShape = connectedTargetGroupShape.node().cloneNode(true) as Element;
                targetRackShape = connectedTargetGroupShape;
            }

            if (!connectedDragGroupShape.empty()) {
                clonedDraggedShape = connectedDragGroupShape.node().cloneNode(true) as Element;
                draggedRackShape = connectedDragGroupShape;
            }

            newGroup = layoutSvg.append('g')
                .attr('class', 'draggable rack-group')
                .attr('id', targetRackGroup.groupId);

            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            d3.select(clonedTargetShape).classed('draggable', false);
            d3.select(clonedDraggedShape).classed('draggable', false);

            processShape(clonedTargetShape, action, newGroup);
            processShape(clonedDraggedShape, action, newGroup);
        }

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetRackShape.attr('transform');
        if (transformAttr) {
            newGroup.attr('transform', transformAttr);
        }

        //Attach data from target to new shape
        const targetData = targetRackShape.datum() as { x: number; y: number };
        if (targetData) {
            newGroup.data([{x: targetData.x, y: targetData.y}]);
        }

        newGroup.call(layoutDrag);

        doRackAction(action, targetRackSvgId, draggedRackSvgId, targetCageId, dragCageId, newGroup);

        // Remove the original shapes from the DOM
        targetRackShape.remove();
        draggedRackShape.remove();

        return true;
    } else {
        return false;
    }
}


export const getAdjDirection = (
    draggedX,
    draggedY,
    targetX,
    targetY,
    draggedWidth,
    draggedHeight,
    targetWidth,
    targetHeight): CageDirection => {

    // Check right side of A to left side of B
    if (draggedX + draggedWidth === targetX) {
        return CageDirection.Right;
    }

    // Check left side of A to right side of B
    if (draggedX === targetX + targetWidth) {
        return CageDirection.Left;
    }

    // Check bottom side of A to top side of B
    if (draggedY + draggedHeight === targetY) {
        return CageDirection.Bottom;
    }

    // Check top side of A to bottom side of B
    if (draggedY === targetY + targetHeight) {
        return CageDirection.Top;
    }
};

// This checks the adjacency of two racks to determine if they can be merged
export function checkAdjacent(targetCage: LocationCoords, draggedCage: LocationCoords, draggedSize: number, targetSize: number) {

    const targetX = targetCage.cellX;
    const targetY = targetCage.cellY;
    const draggedX = draggedCage.cellX;
    const draggedY = draggedCage.cellY;

    // Calculate widths and heights in pixels
    const draggedWidth = draggedSize * CELL_SIZE;
    const draggedHeight = draggedSize * CELL_SIZE;
    const targetWidth = targetSize * CELL_SIZE;
    const targetHeight = targetSize * CELL_SIZE;

    // Calculate corners of the dragged square
    const draggedCorners = [
        {x: draggedX, y: draggedY}, // Top-left
        {x: draggedX + draggedWidth, y: draggedY}, // Top-right
        {x: draggedX, y: draggedY + draggedHeight}, // Bottom-left
        {x: draggedX + draggedWidth, y: draggedY + draggedHeight}, // Bottom-right
    ];

    // Calculate corners of the target square
    const targetCorners = [
        {x: targetX, y: targetY}, // Top-left
        {x: targetX + targetWidth, y: targetY}, // Top-right
        {x: targetX, y: targetY + targetHeight}, // Bottom-left
        {x: targetX + targetWidth, y: targetY + targetHeight}, // Bottom-right
    ];

    /* True if valid bounds exist. In short this fixes the issue with the corner checking where corners
       themselves count as adjacent with no sides touching.

     */
    const checkBounds = (corner) => {
        let valid = false;

        if (corner === 0) { // top left corner match of drag cage
            if (draggedCorners[corner].x === targetCorners[3].x && draggedCorners[corner].y === targetCorners[3].y) {
                valid = true;
            }

        } else if (corner === 1) { // top right corner match of drag cage
            if (draggedCorners[corner].x === targetCorners[2].x && draggedCorners[corner].y === targetCorners[2].y) {
                valid = true;
            }
        } else if (corner === 2) { // bottom left corner match of drag cage
            if (draggedCorners[corner].x === targetCorners[1].x && draggedCorners[corner].y === targetCorners[1].y) {
                valid = true;
            }
        } else if (corner === 3) { // bottom right corner match of drag cage
            if (draggedCorners[corner].x === targetCorners[0].x && draggedCorners[corner].y === targetCorners[0].y) {
                valid = true;
            }
        }

        return valid;
    };

    // Check if any corner of the dragged square matches any corner of the target square with a matching side.
    for (let i = 0; i < draggedCorners.length; i++) {
        for (let j = 0; j < targetCorners.length; j++) {
            if (draggedCorners[i].x === targetCorners[j].x && draggedCorners[i].y === targetCorners[j].y) {
                if (checkBounds(i)) {
                    continue;
                }
                const direction = getAdjDirection(draggedX, draggedY, targetX, targetY, draggedWidth, draggedHeight, targetWidth, targetHeight);

                // Determine the direction of adjacency based on the matching corner
                if (draggedCorners[i].x === draggedX && draggedCorners[i].y === draggedY) {
                    return {isAdjacent: true, direction: direction};
                } else if (draggedCorners[i].x === draggedX + draggedWidth && draggedCorners[i].y === draggedY) {
                    return {isAdjacent: true, direction: direction};
                } else if (draggedCorners[i].x === draggedX && draggedCorners[i].y === draggedY + draggedHeight) {
                    return {isAdjacent: true, direction: direction};
                } else if (draggedCorners[i].x === draggedX + draggedWidth && draggedCorners[i].y === draggedY + draggedHeight) {
                    return {isAdjacent: true, direction: direction};
                }
            }
        }
    }

    return {isAdjacent: false, direction: '0'};
}

//Offset for the top left corner of the layout, without doing this objects will randomly jump when dragging and placing
export const getLayoutOffset = (props: OffsetProps) => {
    const {layoutSvg, clientX, clientY} = props;
    const svgRect = (layoutSvg.node() as SVGRectElement).getBoundingClientRect();
    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;
    return {x: x, y: y};
};

export const getTargetRect = (x, y, gridSize, transform) => {

    // Adjust the coordinates based on the current zoom and pan transform
    const adjustedX = transform.invertX(x);
    const adjustedY = transform.invertY(y);

    // Calculate the column and row index based on the adjusted grid size
    const col = Math.floor(adjustedX / gridSize);
    const row = Math.floor(adjustedY / gridSize);
    // Return the top-left corner coordinates of the rectangle
    return {
        x: col * gridSize,
        y: row * gridSize,
    };
};

// Layout Drag Helpers
export function createStartDragInLayout(startDragProps: StartDragProps) {
    return (
        function startDragInLayout(event) {
            const {setSelectedObj, localRoomRef} = startDragProps;
            const localRoom = localRoomRef.current;

            const id = d3.select(this).attr('id');
            let foundObj: SelectedObj = localRoom.objects.find(obj => obj.itemId === id);
            if (foundObj) {
                setSelectedObj(foundObj);
            } else {
                localRoom.rackGroups.forEach((group) => {
                    if (foundObj) {
                        return;
                    }
                    if (group.groupId === id) {
                        foundObj = group;
                        return;
                    }
                    foundObj = group.racks.find((rack) => rack.svgId === id);
                });
                if (foundObj) {
                    setSelectedObj(foundObj);
                }
            }

            d3.select(this).raise().classed('active', true);

        }
    );
}

export function createDragInLayout() {
    return (
        function dragInLayout(event) {
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');
            const element = d3.select(this);
            const transform = d3.zoomTransform(layoutSvg.node());
            const scale = transform.k;
            let [newX, newY] = [0,0];
            if(isTouchEvent(event.sourceEvent)){
                [newX, newY] = d3.pointer(event.sourceEvent.touches[0], this.parentNode);

            }else{
                [newX, newY] = d3.pointer(event.sourceEvent, this.parentNode);
            }

            element.attr('transform', `translate(${newX},${newY}) scale(${scale})`);
        }
    );
}

export function createEndDragInLayout(props: LayoutDragProps) {
    return (
        function endDragInLayout(event) {
            const {
                gridSize,
                moveItem
            } = props;
            const shape = d3.select(this);
            shape.classed('active', false);
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('[id=layout-svg]');

            const transform = d3.zoomTransform(layoutSvg.node());
            let [pointerX, pointerY] = [0,0];
            if(isTouchEvent(event.sourceEvent)){
                [pointerX, pointerY] = d3.pointer(event.sourceEvent.changedTouches[0], layoutSvg.node()); // mouse position with respect to layout svg

            }else{
                [pointerX, pointerY] = d3.pointer(event, layoutSvg.node()); // mouse position with respect to layout svg
            }
            const {x, y} = getLayoutOffset({
                clientX: pointerX,
                clientY: pointerY,
                layoutSvg: layoutSvg
            });

            const targetCell = getTargetRect(pointerX, pointerY, gridSize, transform);
            if (targetCell) {
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                const shapeType: RoomItemClass = shape.classed('room-obj') ? 'roomObj' : 'caging';
                placeAndScaleGroup(shape, cellX, cellY, transform);
                // make sure border template is below all other shapes on the layout
                if (shape.attr('id') === 'layout-border') {
                    shape.lower();
                }
                moveItem(shape.attr('id'), shapeType, cellX, cellY, transform.k);
            }
        }
    );
}

export const placeAndScaleGroup = (group, x, y, transform) => {
    // Scale the group to match the grid size relative to the current zoom level
    const scale = transform.k;  // Scale inversely to zoom

    // Adjust x and y for transform
    const newX = transform.applyX(x);
    const newY = transform.applyY(y);
    // Apply the transform (translate to snap to the grid, and scale)
    group.attr('transform', `translate(${newX}, ${newY}) scale(${scale})`)
        .data([{x: x, y: y}]); // keep data x and y because these are pre transform coords
};

export const areCagesInSameRack = (rack: Rack, cage1: LocationCoords, cage2: LocationCoords) => {
    if (!rack.cages || !Array.isArray(rack.cages)) {
        return false;
    }

    const nums = rack.cages.map(item => item.svgId);
    return nums.includes(cage1.cageId) && nums.includes(cage2.cageId);
};


// input is the enum number for rack, default rack, or room obj type. Return true if it is in Rack or Default rack types
export const isRackEnum = (itemType: RoomItemType): itemType is RackTypes | DefaultRackTypes => {
    return itemType in RackTypes || itemType in DefaultRackTypes;
};

export const isRackDefault = (itemType: RoomItemType): itemType is DefaultRackTypes => {
    return itemType in DefaultRackTypes;
};

// finds a cage by cageNum in group of racks if it exists
export const findSelectObjRack = (racks: Rack[], obj: string): Rack => {
    return racks.find(rack => {
        return rack.cages.find((cage) => cage.cageNum === obj);
    });
};

// finds a rack in room/groups of racks if it exists and return the rack and rack group it is apart of
export const findRackInGroup = (targetId: string, groups: RackGroup[]): {
    rack: Rack,
    rackGroup: RackGroup
} | undefined => {
    for (const group of groups) {
        const targetRack = group.racks.find(rack => rack.svgId === targetId);
        if (targetRack) {
            return {rack: targetRack, rackGroup: group};
        }
    }
    return undefined;
};


// finds a cage in room/groups of racks if it exists and return the rack, rack group and cage state
export const findCageInGroup = (targetId: CageSvgId, groups: RackGroup[]): {
    cage: Cage,
    rack: Rack,
    rackGroup: RackGroup
} | undefined => {
    for (const group of groups) {
        for (const rack of group.racks) {
            const targetCage = rack.cages.find(cage => cage.svgId === targetId);
            if (targetCage) {
                return {cage: targetCage, rack: rack, rackGroup: group};
            }
        }
    }
    return undefined;
};

export function updateBorderSize(borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, newWidth: number, newHeight: number) {
    const currentRect = d3.select('#border-rect');
    const resizeHandler = borderGroup.selectAll('#resize-handle');

    function updateSvgBounds(newSvgWidth: number, newSvgHeight: number, svgId: string) {
        // Calculate new dimensions if necessary
        const resizeSvg = borderGroup.select(`#${svgId}`);

        // Update the SVG's viewBox to accommodate the new size, + 1 to add a pixel of distance between the svg and everything inside
        resizeSvg.attr('viewBox', `0 0 ${newSvgWidth + 1} ${newSvgHeight + 1}`);
        resizeSvg.attr('width', newSvgWidth + 1);
        resizeSvg.attr('height', newSvgHeight + 1);
    }

    // Update rect dimensions and position
    currentRect
        .attr('width', newWidth)
        .attr('height', newHeight);

    //update resize rect handler
    resizeHandler.attr('x', newWidth - 15)
        .attr('y', newHeight - 15);

    updateSvgBounds(newWidth, newHeight, 'border_template');
    updateSvgBounds(newWidth, newHeight, 'border_template_wrapper');
}

const createStartResizeDrag = () => {
    return (
        function startResizeDrag(event) {
            event.sourceEvent.stopPropagation();
            const borderRect = d3.select('#border-rect');
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');


            this.startWidth = parseFloat(borderRect.attr('width'));
            this.startHeight = parseFloat(borderRect.attr('height'));

            // start x and y with respect to the layout svg
            const [x, y] = d3.pointer(event.sourceEvent, layoutSvg.node());
            this.startX = x;
            this.startY = y;
        }
    );
};


const createDragResizeDrag = (gridSize: number, borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
    return (
        function dragResizeDrag(event) {
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');

            // get x and y in relation to the layout svg
            const [x, y] = d3.pointer(event.sourceEvent, layoutSvg.node());

            // calculate delta x and y (change) with respect to grid size for snapping
            const dx = Math.round((x - this.startX) / gridSize);
            const dy = Math.round((y - this.startY) / gridSize);

            // calculate new height and width using previous delta and grid size for snapping
            const newLockedWidth: number = this.startWidth + (dx * gridSize);
            const newLockedHeight: number = this.startHeight + (dy * gridSize);


            updateBorderSize(borderGroup, newLockedWidth, newLockedHeight);

        }
    );
};
const createEndResizeDrag = (setLocalRoom) => {
    return (
        function startResizeDrag(event) {
            const currentRect = d3.select('#border-rect');
            setLocalRoom(prevState => ({
                ...prevState,
                layoutData: {
                    ...prevState.layoutData,
                    borderWidth: parseInt(currentRect.attr('width')),
                    borderHeight: parseInt(currentRect.attr('height'))
                }
            }));
        }
    );
};
// functionality to drag/resize the border. closeMenu is a function that sets state of both context menus
export const dragBorder = (closeMenu, gridSize, borderGroup, setLocalRoom) => {
    let targetId: string;
    return d3.drag()
        .on('start', function (event) {
            // store target element to prevent switching
            const targetElement = d3.select(event.sourceEvent.target);
            // store target id, either resize handle id or room border group id
            targetId = targetElement.attr('id');
            closeMenu();
            // Drag group if group is selected, otherwise resize using the rect handlers
            if (targetElement.node().tagName === 'rect') {
                createStartResizeDrag().call(this, event);
            }
        })
        .on('drag', function (event) {
            // Retrieve the stored target element
            const targetElement = d3.select(`#${targetId}`) as d3.Selection<any, unknown, null, undefined>;
            if (targetElement.node().tagName === 'rect') {
                createDragResizeDrag(gridSize, borderGroup).call(this, event);
            }
        })
        .on('end', function (event) {
            const targetElement = d3.select(`#${targetId}`) as d3.Selection<any, unknown, null, undefined>;
            if (targetElement.node().tagName === 'rect') {
                createEndResizeDrag(setLocalRoom).call(this, event);
            }
        });
};

export const getNextGroupId = (groups: RackGroup[]): GroupId => {
    // Extract all numbers from existing groupIds
    const existingNumbers = groups
        .map(obj => {
            const match = obj.groupId.match(/^rack-group-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num) && num > 0); // Filter out invalid numbers

    // If no valid groupIds found, start with 1
    if (existingNumbers.length === 0) {
        return 'rack-group-1';
    }

    // Find the highest number and add 1
    const maxNumber = Math.max(...existingNumbers);
    return `rack-group-${maxNumber + 1}`;
};

export const areAllRacksNonDefault = (room: Room): boolean => {
    // Check if any rack in any rack group is default
    for (const rackGroup of room.rackGroups) {
        for (const rack of rackGroup.racks) {
            // Check if the rack's type is default
            if (rack.type.isDefault) {
                return false;
            }
        }
    }

    return true;
};

export const isRoomHomogeneousDefault = (room: Room): boolean => {
    let hasDefaultRack = false;
    let hasNonDefaultRack = false;

    // Check all racks in the room
    for (const rackGroup of room.rackGroups) {
        for (const rack of rackGroup.racks) {
            if (rack.type.isDefault) {
                hasDefaultRack = true;
            } else {
                hasNonDefaultRack = true;
            }

            // If we found both default and non-default racks, return false immediately
            if (hasDefaultRack && hasNonDefaultRack) {
                return false;
            }
        }
    }

    // Return true if all racks are default OR all racks are non-default
    // This means either both flags are false (no racks) or only one flag is true
    return true;
};

export const addModEntries = (
    connections: ConnectedCage[] | ConnectedRack[],
    locDir: ModLocations,
    rack: Rack,
    isRackConnection: boolean,
    newModData: CageMods[],
    usedMap: Map<string, boolean>
) => {
    connections.forEach((connect) => {
        const newMapKey = [
            `${connect.currCage.cageNum}-${connect.currSubId}`,
            `${connect.adjCage.cageNum}-${connect.adjSubId}`
        ]
            .sort()
            .join('_');

        if (usedMap.has(newMapKey)) {
            return;
        }

        const modId = generateUUID();

        // Add mod data for current cage
        newModData.push({
            cage: connect.currCage.objectId,
            location: locDir,
            modId: modId,
            parentModId: null,
            modification: getDefaultMod(locDir),
            rack: isRackConnection ? (connect as ConnectedRack).currRack.objectId : rack.objectId,
            subId: connect.currSubId
        });

        // Add mod data for adjacent cage
        const adjLocation = getAdjLocation(locDir);
        newModData.push({
            cage: connect.adjCage.objectId,
            location: adjLocation,
            modId: generateUUID(),
            parentModId: modId,
            modification: getDefaultMod(adjLocation),
            rack: isRackConnection ? (connect as ConnectedRack).adjRack.objectId : rack.objectId,
            subId: connect.adjSubId
        });

        usedMap.set(newMapKey, true);
    });
}