// Layout Editor Helpers
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import {
    defaultTypeToRackType,
    getTypeClassFromElement,
    parseLongId,
    parseRoomItemNum,
    parseRoomItemType,
    roomItemToString
} from './helpers';
import {
    Cage,
    CageNumber,
    DefaultRackTypes,
    GroupId,
    LayoutHistoryData,
    LocationCoords,
    PrevRoom,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemClass,
    RoomItemStringType,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    UnitLocations,
    UnitType
} from '../types/typings';
import {
    ExtraContext,
    LayoutDragProps,
    MergeProps,
    OffsetProps,
    RackActions,
    SelectedObj,
    StartDragProps
} from '../types/layoutEditorTypes';
import { labkeyActionSelectWithPromise } from '../api/labkeyActions';
import * as React from 'react';
import { MutableRefObject } from 'react';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter, Security } from '@labkey/api';
import { GetUserPermissionsResponse } from '@labkey/api/dist/labkey/security/Permission';


export const isTemplateCreator = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission');
}

export const isRoomCreator = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission');
}

export const isRoomModifier = (user: GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomModifierPermission');
}


export const getTranslation = (transform) => {
    // Regex to extract the translate(x, y) values
    const translate = transform.match(/translate\(([^)]+)\)/);
    if (translate) {
        const [x, y] = translate[1].split(',').map(Number);
        return { x, y };
    }
    return { x: 0, y: 0 }; // Default to (0, 0) if no translation is found
}

export const convertCageNumToNum = (num: CageNumber) => {
    const parts = num.split('-');
    const cageNum = parts[1];
    return parseInt(cageNum);
}

export const createEmptyUnitLoc = (): UnitLocations => {
    return (
        Object.fromEntries(
            Object.values(RackTypes)
                .filter((value) => typeof value === "number") // Filter out the numeric values from enum
                .map((rackType) => [
                    roomItemToString(rackType as RackTypes),
                    [] as LocationCoords[],
                ])
        ) as UnitLocations
    );
}

export const parseWrapperId = (input: string): RoomItemStringType => {
    const regex = /^[a-zA-Z]+/; // matches "x_template_wrapper"

    const match = input.match(regex);
    if (match) { // if a match return whatever x is (any string of chars)
        return match[0] as RoomItemStringType;
    }
    return;
}


export const drawGrid = (layoutSvg: d3.Selection<SVGElement, unknown, any, any>, updateGridProps) => {
    const transform = zoomTransform(layoutSvg.node());
    layoutSvg.select('.grid').remove();
    layoutSvg.append("g")
        .attr("class", "grid")
        .attr("id", "layout-grid")
        .attr("width", updateGridProps.width)
        .attr('height', updateGridProps.height)
        .attr('transform', `translate(0,0) scale(${transform.k})`);
    updateGrid(zoomTransform(layoutSvg.node()), updateGridProps.width, updateGridProps.height, updateGridProps.gridSize); // Draw grid with the initial view
}

export const updateGrid = (transform, width, height, gridSize) => {
    const g = d3.select("g.grid");
    g.selectAll(".cell").remove(); // Clear existing grid

    // Calculate grid bounds (starting and ending points) based on transform
    const xMin = Math.floor(-transform.x / transform.k / gridSize) * gridSize;
    const yMin = Math.floor(-transform.y / transform.k / gridSize) * gridSize;
    const xMax = Math.ceil((width - transform.x) / transform.k / gridSize) * gridSize;
    const yMax = Math.ceil((height - transform.y) / transform.k / gridSize) * gridSize;

    // Draw the grid within the current visible area
    for (let x = xMin; x <= xMax; x += gridSize) {
        for (let y = yMin; y <= yMax; y += gridSize) {
            g.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("class", "cell")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .attr("fill", "none")
                .attr("stroke", "lightgray");
        }
    }
}

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
    targetNode.setAttribute("transform", `translate(0, 0)`);

    // Set the second node to be exactly at the dynamic distance relative to the first node
    draggedNode.setAttribute("transform", `translate(${distanceX}, ${distanceY})`);
}

export function setupEditCageEvent(
    cageGroupElement: SVGGElement,
    setSelectedObj: React.Dispatch<React.SetStateAction<SelectedObj>>,
    setCtxMenuStyle: React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
    localRoomRef: MutableRefObject<Room>,
    rackTypeString?: RackStringType
): () => void {
    const handleContextMenu = (event: MouseEvent)=> {
        event.preventDefault();
        const localRoom = localRoomRef.current;
        let tempObj: SelectedObj;
        const element = event.currentTarget as SVGGElement;

        //set selected object to either room object or cage
        if(d3.select(element).classed('room-obj')){
            tempObj = localRoom.objects.find((obj) => obj.itemId === element.id);
        }else{
            const cageGroupElement = element.closest(`[id^=${rackTypeString}-]`) as SVGGElement | null;
            localRoom.rackGroups.forEach((g) => {
                g.racks.forEach((r) => {
                    if(tempObj){
                        return;
                    }
                    tempObj = r.cages.find(c => c.cageNum === cageGroupElement.id);
                })
            })
        }
        setSelectedObj(tempObj);
        setCtxMenuStyle((prevState) => ({
            ...prevState,
            display: 'block',
            left: `${event.pageX - 10}px`,
            top: `${event.pageY - 10}px`,
        }));
    };

    // Attach context menu to the lowest level group for that cFage.
    cageGroupElement.style.pointerEvents = 'bounding-box';
    cageGroupElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
        cageGroupElement.removeEventListener('contextmenu', handleContextMenu);
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
        cageActionProps
    } = props;
    if(!d3.select('.popup').empty()) return;
    const action: RackActions = await showConfirmationPopup();
    const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('[id=layout-svg]');

    function isConnected(selectionNode){
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles, give merged cages a grouped class
    function resetElementProperties(element: SVGGElement, shapeType, action) {
        if(action === 'merge'){
            element.setAttribute('class',`grouped-${shapeType}`);
            element.setAttribute('style', "");
        }
        setupEditCageEvent(element, cageActionProps.setSelectedObj, cageActionProps.setCtxMenuStyle, contextMenuRef, shapeType);
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup, action: RackActions) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'))
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetShape = d3.select(this);
            let shapeType: RackStringType;
            if(action === 'merge'){
                shapeType = parseRoomItemType(targetShape.attr('id')) as RackStringType;
            }else{
                shapeType = getTypeClassFromElement(targetShape.node()) as RackStringType;
            }
            const {x: localX, y: localY} = getTranslation(targetShape.attr('transform'));
            const newX = startX + localX;
            const newY = startY + localY;
            targetShape.attr('transform', `translate(${newX},${newY})`);

            // When connecting merged groups that have been connected before make sure to reset each cage but
            // add the rack shape instead of cage shape
            const mergedChildren = d3.select(this).selectAll(':scope > g');
            if(!mergedChildren.empty()){
                mergedChildren.each(function () {
                    resetElementProperties(this as SVGGElement, shapeType, action);
                })
            }else{
                resetElementProperties(this as SVGGElement, shapeType, action);
            }
            mergedGroup.node().appendChild(this);
        });
    }

    function processShape(shape, action, mergedGroup) {
        if(action === 'merge'){
            processChildNodes(shape, mergedGroup, action);
        }else{
            if(shape.getAttribute('class').includes('rack-group')){
                processChildNodes(shape, mergedGroup, action);
            }else{// When connecting racks for the first time
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
            = layoutSvg.select(`[id^=${targetRack.itemId}]`);

        let draggedRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id^=${draggedRack.itemId}]`);

        let newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>;

        // Clone the target and dragged shapes before using
        let clonedTargetShape = targetRackShape.node().cloneNode(true) as Element;
        let clonedDraggedShape = draggedRackShape.node().cloneNode(true) as Element;

        let targetRackId = clonedTargetShape.id;
        let draggedRackId = clonedDraggedShape.id;

        if(action === 'merge'){
            if(isConnected(draggedRackShape.node()) || isConnected(targetRackShape.node())){
                await showLayoutEditorError("Invalid Configuration: Please do not merge connected racks");
                return;
            }
            if(draggedRack.type.type !== targetRack.type.type){
                await showLayoutEditorError("Invalid Configuration: Please do not merge cages of different types, use connection instead");
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
        }
        else{ // action = connect

            // If connecting already connected groups these will be populated
            const connectedTargetGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${targetRackGroup.groupId}`);

            const connectedDragGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${dragRackGroup.groupId}`);

            if(!connectedTargetGroupShape.empty()){
                clonedTargetShape = connectedTargetGroupShape.node().cloneNode(true) as Element;
                targetRackShape = connectedTargetGroupShape;
            }

            if(!connectedDragGroupShape.empty()){
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
            processShape(clonedDraggedShape,action, newGroup);
        }

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetRackShape.attr('transform');
        if (transformAttr) {
            newGroup.attr('transform', transformAttr);
        }

        //Attach data from target to new shape
        const targetData = targetRackShape.datum() as { x: number; y: number };
        if(targetData) {
            newGroup.data([{x: targetData.x, y: targetData.y}])
        }

        newGroup.call(layoutDrag);

        doRackAction(action,targetRackId, draggedRackId, newGroup);

        // Remove the original shapes from the DOM
        targetRackShape.remove();
        draggedRackShape.remove();
    }
}

// This checks the adjacency of two racks to determine if they can be merged
export function checkAdjacent(targetCage: LocationCoords, draggedCage: LocationCoords, gridSize: number, gridRatio: number) {

    const boxWidth = gridSize * gridRatio;

    let horizontallyAdjacent = false;
    let verticallyAdjacent = false;

    // Check for horizontal adjacency
    if (Math.abs(targetCage.cellX - draggedCage.cellX) === boxWidth &&
        targetCage.cellY === draggedCage.cellY) {
        horizontallyAdjacent = true;
    }// Check for vertical adjacency
    else if (Math.abs(targetCage.cellY - draggedCage.cellY) === boxWidth &&
        targetCage.cellX === draggedCage.cellX)  {
        verticallyAdjacent = true;
    }
    const isAdjacent = horizontallyAdjacent || verticallyAdjacent;
    return isAdjacent;
}

//Offset for the top left corner of the layout, without doing this objects will randomly jump when dragging and placing
export const getLayoutOffset = (props: OffsetProps) => {
    const {layoutSvg, clientX, clientY} = props;
    const svgRect = (layoutSvg.node() as SVGRectElement).getBoundingClientRect();
    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;
    return {x: x, y: y};
}

export const getTargetRect =(x, y, gridSize, transform) => {

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
}

// Layout Drag Helpers
export function createStartDragInLayout(startDragProps: StartDragProps) {
    return(
        function startDragInLayout(event) {
            const {setSelectedObj, localRoomRef} = startDragProps;
            const localRoom = localRoomRef.current;

            const id = d3.select(this).attr('id');
            let foundObj: SelectedObj = localRoom.objects.find(obj => obj.itemId === id);
            if(foundObj){
                setSelectedObj(foundObj);
            }else{
                localRoom.rackGroups.forEach((group) => {
                    if(foundObj) return;
                    if(group.groupId === id){
                        foundObj = group;
                        return;
                    }
                    foundObj = group.racks.find((rack) => rack.itemId === id)
                })
                if(foundObj){
                    setSelectedObj(foundObj);
                }
            }

            d3.select(this).raise().classed('active', true);

        }
    );
}

export function createDragInLayout() {
    return(
        function dragInLayout(event) {
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');
            const element = d3.select(this);
            const transform = d3.zoomTransform(layoutSvg.node());
            const scale = transform.k;

            element.attr('transform', `translate(${event.x},${event.y}) scale(${scale})`);
        }
    )
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
            const [pointerX,pointerY] = d3.pointer(event, layoutSvg.node()); // mouse position with respect to layout svg
            const {x,y} = getLayoutOffset({
                clientX: pointerX,
                clientY: pointerY,
                layoutSvg: layoutSvg});

            const targetCell = getTargetRect(pointerX, pointerY, gridSize, transform);
            if (targetCell) {
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                const shapeType: RoomItemClass = shape.classed('room-obj') ? 'roomObj' : 'caging';
                placeAndScaleGroup(shape, cellX, cellY, transform);
                // make sure border template is below all other shapes on the layout
                if(shape.attr('id') === 'layout-border'){
                    shape.lower();
                }
                moveItem(shape.attr('id'),shapeType, cellX, cellY, transform.k);
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
    group.attr("transform", `translate(${newX}, ${newY}) scale(${scale})`)
        .data([{x: x, y: y}]); // keep data x and y because these are pre transform coords
}

export const areCagesInSameRack = (rack: Rack, cage1: LocationCoords, cage2: LocationCoords) => {
    if (!rack.cages || !Array.isArray(rack.cages)) {
        return false;
    }

    const nums = rack.cages.map(item => item.cageNum);
    return nums.includes(cage1.num) && nums.includes(cage2.num);
}


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
        return rack.cages.find((cage) => cage.cageNum === obj)
    });
}

// finds a rack in room/groups of racks if it exists and return the rack and rack group it is apart of
export const findRackInGroup = (targetId: string, groups: RackGroup[]): {rack: Rack, rackGroup: RackGroup} | undefined => {
    for (const group of groups) {
        const targetRack = group.racks.find(rack => rack.itemId === targetId);
        if (targetRack) {
            return { rack: targetRack, rackGroup: group };
        }
    }
    return undefined;
};


// finds a cage in room/groups of racks if it exists and return the rack, rack group and cage state
export const findCageInGroup = (targetId: CageNumber, groups: RackGroup[]): {cage: Cage, rack: Rack, rackGroup: RackGroup} | undefined => {
    for (const group of groups) {
        for (const rack of group.racks) {
            const targetCage = rack.cages.find(cage => cage.cageNum === targetId);
            if (targetCage) {
                return { cage: targetCage, rack: rack, rackGroup: group };
            }
        }
    }
    return undefined;
};

// FUNCTIONS FOR LOADING IN PREVIOUS DATA

export const buildNewLocs = (prevRoomData: LayoutHistoryData[]): UnitLocations => {
    // Empty Unit locations object
    const newUnitLocs: UnitLocations = createEmptyUnitLoc();

    prevRoomData.forEach(roomItem => {
        if(!isRackEnum(roomItem.object_type)) return; // ignore room objects here
        let rackType: RoomItemStringType;
        if(isRackDefault(roomItem.object_type)){
            rackType = roomItemToString(defaultTypeToRackType(roomItem.object_type));
        }else{
            rackType = roomItemToString(roomItem.object_type);
        }
        newUnitLocs[rackType].push({
            num: `${rackType}-${parseInt(roomItem.cage)}` as CageNumber,
            cellX: roomItem.x_coord,
            cellY: roomItem.y_coord
        });
    })
    return newUnitLocs;
}

export const buildNewLocalRoom = async (prevRoom: PrevRoom): Promise<Room> => {
    const newLocalRoom: Room = {
        name: prevRoom.name,
        rackGroups: [],
        objects: [],
        layoutData: null
    };
    let roomObjNum = 1;

    //check if a group exists for the groupId, if it does return, else create new group for the room
    const findOrAddGroup = (rackItem: LayoutHistoryData): RackGroup => {
        // groupId is a single number so check if the GroupId string contains it
        let rackGroup: RackGroup = newLocalRoom.rackGroups.find(group => parseLongId(group.groupId) === rackItem.rack_group)
        if (!rackGroup) {
            //create new rack group if it doesn't exist
            rackGroup = {
                groupId: `rack-group-${rackItem.rack_group}` as GroupId,
                selectionType: 'rackGroup',
                scale: prevRoom.layoutData.scale,
                x: rackItem.x_coord,
                y: rackItem.y_coord,
                racks: []
            };
            newLocalRoom.rackGroups.push(rackGroup);
        }
        return rackGroup;
    }

    //check if a rack exists for the rackId, if it does return, else create new rack for the group
    const findOrAddRack = async (rackGroup: RackGroup, rackItem: LayoutHistoryData): Promise<Rack> => {
        let rackId = rackItem?.rack;
        let extraContext: ExtraContext;
        // if rack is default, use default rack id instead
        if(!rackId && rackItem.extra_context){
            extraContext = JSON.parse(rackItem.extra_context);
            if(extraContext?.rack?.rackId){
                rackId = extraContext.rack.rackId;
            }
        }
        let rack: Rack = rackGroup.racks.find(r => parseRoomItemNum(r.itemId) === rackId);
        if (!rack) {
            //create new rack if it doesn't exist
            let type: UnitType;
            let typeName = rackItem;
            const isDefault = isRackDefault(rackItem.object_type);
            const rackPrefix = isDefault ?  'default-rack' : 'rack';

            if(!isDefault){
                const optConfig: SelectRowsOptions = {
                    schemaName: "cageui",
                    queryName: "racks",
                    filterArray: [
                        Filter.create('rackid', rackItem.rack, Filter.Types.EQUALS)
                    ]
                }

                const rackData = await labkeyActionSelectWithPromise(optConfig);
                typeName = rackData.rows[0].rack_type;
            }


            // if default get base type, else get rack type from rack id
            const optConfig = {
                schemaName: "cageui",
                queryName: "rack_types",
                filterArray: [
                    Filter.create(isDefault ? 'type' : 'name', isDefault ? rackItem.object_type : typeName, Filter.Types.EQUALS)
                ]
            }

            const rackTypesData = await labkeyActionSelectWithPromise(optConfig);

            type = {
                rowid: rackTypesData.rows[0].rowid,
                name: rackTypesData.rows[0].name,
                type: isDefault ? defaultTypeToRackType(rackTypesData.rows[0].type) : rackTypesData.rows[0].type,
                isDefault: isDefault,
            };

            rack = {
                selectionType: 'rack',
                cages: [],
                isActive: !isDefault,
                itemId: `${rackPrefix}-${rackId}`,
                type: type,
                x: rackItem.x_coord - rackGroup.x, // subtract group coords from layout coords to get rack coords
                y: rackItem.y_coord - rackGroup.y,
                extraContext: extraContext?.rack
            };
            rackGroup.racks.push(rack);
        }
        return rack;
    }

    const addCageToRack = (rack: Rack, rackItem: LayoutHistoryData, group: RackGroup) => {
        // only string for RackTypes, not DefaultRackTypes, since cageNum is used for location tracking which uses RackTypes
        let cageNumType: RoomItemStringType;
        let extraContext: ExtraContext;
        if(rack.type.isDefault){
            cageNumType = roomItemToString(defaultTypeToRackType(rackItem.object_type as DefaultRackTypes));
        }else{
            cageNumType = roomItemToString(rackItem.object_type);
        }
        if(rackItem.extra_context){
            extraContext = JSON.parse(rackItem.extra_context);
        }
        const cage: Cage = {
            cageNum: `${cageNumType}-${parseInt(rackItem.cage)}` as CageNumber,
            extraContext: extraContext?.cage,
            selectionType: 'cage',
            id: rack.cages.length + 1,
            x: rackItem.x_coord - rack.x - group.x, // get cage coords by subtracting from both rack and group
            y: rackItem.y_coord - rack.y - group.y
        }
        rack.cages.push(cage);
    }

    const handleRackItem = async (rackItem: LayoutHistoryData) => {
        const rackGroup: RackGroup = findOrAddGroup(rackItem);
        const rack: Rack = await findOrAddRack(rackGroup, rackItem);
        addCageToRack(rack, rackItem, rackGroup);
    }

    // generates room object state for room objects from layout history data
    const generateRoomObj = (roomObjItem: LayoutHistoryData): RoomObject => {
        let context;
        if(roomObjItem.extra_context){
            context = JSON.parse(roomObjItem.extra_context);
        }
        return({
            itemId: `${roomItemToString(roomObjItem.object_type)}-${roomObjNum++}`, // update room obj num after it is used to next num
            type: roomObjItem.object_type as RoomObjectTypes,
            selectionType: 'obj',
            x: roomObjItem.x_coord,
            y: roomObjItem.y_coord,
            scale: prevRoom.layoutData.scale,
            extraContext: context
        });
    }

    for (const roomItem of prevRoom.cagingData) {
        if (isRackEnum(roomItem.object_type)) { // Room item is an enclosure for animals
            await handleRackItem(roomItem);
        } else { // Room item is something else in the room, ex. Door
            newLocalRoom.objects.push(generateRoomObj(roomItem));
        }
    }
    return(newLocalRoom);
}

// END FUNCTIONS FOR LOADING IN PREVIOUS DATA
export function updateBorderSize(borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, newWidth: number, newHeight: number ){
    const currentRect = d3.select('#border-rect');
    const resizeHandler = borderGroup.selectAll('#resize-handle');

    function updateSvgBounds(newSvgWidth: number, newSvgHeight: number, svgId: string) {
        // Calculate new dimensions if necessary
        const resizeSvg = borderGroup.select(`#${svgId}`);

        // Update the SVG's viewBox to accommodate the new size, + 1 to add a pixel of distance between the svg and everything inside
        resizeSvg.attr("viewBox", `0 0 ${newSvgWidth + 1} ${newSvgHeight + 1}`);
        resizeSvg.attr("width", newSvgWidth + 1);
        resizeSvg.attr("height", newSvgHeight + 1);
    }
    // Update rect dimensions and position
    currentRect
        .attr('width', newWidth)
        .attr('height', newHeight);

    //update resize rect handler
    resizeHandler.attr("x", newWidth - 15)
        .attr("y", newHeight - 15);

    updateSvgBounds(newWidth, newHeight, 'border_template');
    updateSvgBounds(newWidth, newHeight, 'border_template_wrapper');
}

const createStartResizeDrag = () => {
    return(
        function startResizeDrag(event) {
            event.sourceEvent.stopPropagation();
            const borderRect = d3.select('#border-rect');
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');


            this.startWidth = parseFloat(borderRect.attr('width'));
            this.startHeight =  parseFloat(borderRect.attr('height'));

            // start x and y with respect to the layout svg
            const [x, y] = d3.pointer(event.sourceEvent, layoutSvg.node());
            this.startX = x;
            this.startY = y;
        }
    );
}



const createDragResizeDrag = (gridSize: number, borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>) => {
    return(
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


            updateBorderSize(borderGroup, newLockedWidth, newLockedHeight)

        }
    );
}
const createEndResizeDrag = (setLocalRoom) => {
    return(
        function startResizeDrag(event) {
            const currentRect = d3.select('#border-rect');
            setLocalRoom(prevState => ({
                ...prevState,
                layoutData: {
                    ...prevState.layoutData,
                    borderWidth: parseInt(currentRect.attr('width')),
                    borderHeight: parseInt(currentRect.attr('height'))
                }
            }))
        }
    );
}
// functionality to drag/resize the border. closeMenu is a function that sets state of both context menus
export const dragBorder = (closeMenu, gridSize, borderGroup, setLocalRoom) => {
    let targetId: string;
    return d3.drag()
        .on('start', function(event) {
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
        .on('drag', function(event) {
            // Retrieve the stored target element
            const targetElement = d3.select(`#${targetId}`) as  d3.Selection<any, unknown, null, undefined>;
            if (targetElement.node().tagName === 'rect') {
                createDragResizeDrag(gridSize, borderGroup).call(this, event);
            }
        })
        .on('end', function(event) {
            const targetElement = d3.select(`#${targetId}`) as  d3.Selection<any, unknown, null, undefined>;
            if (targetElement.node().tagName === 'rect') {
                createEndResizeDrag(setLocalRoom).call(this, event);
            }
        })
}