// Layout Editor Helpers
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import {
    getTranslation,
    getTypeClassFromElement, labkeyActionSelectWithPromise,
    parseLongId,
    parseRack,
    parseRoomItemNum,
    parseRoomItemType
} from './helpers';
import {
    Cage,
    CageActionProps,
    CageNumber,
    DefaultRackTypes,
    DoorResizeProps,
    UnitType,
    GroupId,
    LayoutDragProps,
    LayoutHistoryData,
    LocationCoords,
    OffsetProps,
    PrevRoom,
    Rack,
    RackActions,
    RackGroup,
    RackStringType,
    RackTypes,
    RackTypesStrings,
    Room,
    RoomItemClass,
    RoomItemStringType,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    RoomObjectTypesStrings,
    StartDragProps,
    UnitLocations
} from './typings';
import * as React from 'react';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { Filter } from '@labkey/api';

export const createEmptyUnitLoc = (): UnitLocations => {
    return (
        Object.fromEntries(
            Object.values(RackTypes)
                .filter((value) => typeof value === "number") // Filter out the numeric values from enum
                .map((rackType) => [
                    RackTypesStrings[rackType],
                    [] as LocationCoords[],
                ])
        ) as UnitLocations
    );
}

const generateTypeMaps = () => {
    const rackTypeToDefaultType: { [key in RackTypes]?: DefaultRackTypes } = {};
    const defaultTypeToRackType: { [key in DefaultRackTypes]?: RackTypes } = {};

    // Iterate through the enum keys and filter out numeric ones
    Object.keys(RackTypes)
        .filter((key) => isNaN(Number(key))) // Filters out numeric keys
        .forEach((key) => {
            const rackTypeKey = RackTypes[key as keyof typeof RackTypes];
            const defaultRackTypeKey = `Default${key}` as keyof typeof DefaultRackTypes;

            // Check if the corresponding DefaultRackType key exists
            if (DefaultRackTypes[defaultRackTypeKey] !== undefined) {
                const defaultRackType = DefaultRackTypes[defaultRackTypeKey];

                // Assign mappings
                rackTypeToDefaultType[rackTypeKey as RackTypes] = defaultRackType;
                defaultTypeToRackType[defaultRackType] = rackTypeKey as RackTypes;
            }
        });

    return { rackTypeToDefaultType, defaultTypeToRackType };
}

export const { rackTypeToDefaultType, defaultTypeToRackType } = generateTypeMaps();


// Function to get RoomItemType num from string, not including DefaultRackTypes
export const getRoomItemTypeFromString = (itemTypeString: string): RoomItemType | undefined => {
    const RackTypeFromString: { [key: string]: RackTypes } = Object.fromEntries(
        Object.entries(RackTypesStrings).map(([key, value]) => [value, Number(key) as RackTypes])
    );
    const RoomObjTypeFromString: { [key: string]: RoomObjectTypes } = Object.fromEntries(
        Object.entries(RoomObjectTypesStrings).map(([key, value]) => [value, Number(key) as RoomObjectTypes])
    );
    return RackTypeFromString[itemTypeString] || RoomObjTypeFromString[itemTypeString];
};

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
// Confirmation popup for merging two racks
function showConfirmationPopup(): Promise<RackActions> {
    return new Promise((resolve) => {
        // Create a simple popup
        const popup = d3.select('body').append('div')
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
                popup.remove();
                resolve('merge');
            });

        // Connect button
        popup.append('button')
            .text('Connect Racks')
            .on('click', () => {
                popup.remove();
                resolve('connect');
            });

        // Cancel button
        popup.append('button')
            .text('Cancel')
            .on('click', () => {
                popup.remove();
                resolve('cancel');
            });
    });
}

export function showLayoutEditorConfirmation(msg: string) {
    return new Promise((resolve) => {
        // Create a simple popup
        const popup = d3.select('body').append('div')
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
                popup.remove();
                resolve(true);
            });

        popup.append('button')
            .text('No')
            .on('click', () => {
                popup.remove();
                resolve(false);
            });
    });
}

// Confirmation popup for merging two racks
export function showLayoutEditorError(errorMsg: string) {
    return new Promise((resolve) => {
        // Create a simple popup
        const popup = d3.select('body').append('div')
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
                popup.remove();
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
    setClickedCage: (cageId: string) => void,
    setCtxMenuStyle:  React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
    rackTypeString: RackStringType
): () => void {
    const handleContextMenu = function(this: SVGGElement, event: MouseEvent) {
        event.preventDefault();
        const cageGroupElement = this.closest(`[id^=${rackTypeString}-]`) as SVGGElement | null;
        console.log("Open Menu: ", cageGroupElement)

        setClickedCage(cageGroupElement.id);

        setCtxMenuStyle({
            display: 'block',
            left: `${event.pageX - 10}px`,
            top: `${event.pageY - 10}px`,
        });
    }

    // Attach context menu to the lowest level group for that cage.
    d3.select(cageGroupElement).attr('style', 'pointer-events: bounding-box')
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
export async function mergeRacks(targetRack: Rack, draggedRack: Rack, targetRackGroup: RackGroup, dragRackGroup: RackGroup, doRackAction, layoutDrag: d3.DragBehavior<any, any, any>, cageActionProps: CageActionProps) {
    if(!d3.select('.popup').empty()) return;
    const action: RackActions = await showConfirmationPopup();
    const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('[id=layout-svg]');

    console.log("Performing Merge");

    function isConnected(selectionNode){
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles, give merged cages a grouped class
    function resetElementProperties(element: SVGGElement, shapeType, action) {
        if(action === 'merge'){
            element.setAttribute('class',`grouped-${shapeType}`);
            element.setAttribute('style', "");
        }
        setupEditCageEvent(element, cageActionProps.setSelectedObj, cageActionProps.setCtxMenuStyle, shapeType);
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
                shapeType = parseRoomItemType(targetShape.attr('id'));
            }else{
                shapeType = getTypeClassFromElement(targetShape.node());
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

        console.log("Merge: ", targetRackShape.node(), draggedRackShape.node());

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
            const {setSelectedObj} = startDragProps;
            setSelectedObj(d3.select(this).attr('id'));
            console.log('Drag Layout #1', parseRack(d3.select(this).attr('id')));
            d3.select(this).raise().classed('active', true);
        }
    );
}

export function createDragInLayout() {
    return(
        function dragInLayout(event) {
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');
            console.log('Drag Layout #2', event.x, event.y);
            const element = d3.select(this);
            const transform = d3.zoomTransform(layoutSvg.node());
            const scale = transform.k;
            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
                clientY: event.sourceEvent.clientY,
                layoutSvg: layoutSvg})
            element.attr('transform', `translate(${x},${y}) scale(${scale})`);
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

            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
                clientY: event.sourceEvent.clientY,
                layoutSvg: layoutSvg});

            const targetCell = getTargetRect(x, y, gridSize, transform);

            if (targetCell) {
                console.log('Drag Layout #3', shape, targetCell);
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                const shapeType: RoomItemClass = shape.classed('room-obj') ? 'roomObj' : 'caging';
                placeAndScaleGroup(shape, cellX, cellY, transform);
                // make sure border template is below all other shapes on the layout
                if(shape.attr('id') === 'border-template'){
                    shape.lower();
                }
                console.log("#3: ", cellX, cellY, shape.node());
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

// input is a string for rack or room obj type
export const isRack = (itemType: RoomItemStringType): itemType is RackStringType => {
    return Object.values(RackTypesStrings).includes(itemType as string);
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
        return rack.cages.find((cage) => cage.cageNum === obj)
    });
}

// Finds the next avail group id number
export const findNextGroupId = (groups: GroupId[]): number => {
    const groupNumbers = groups
        .map(group => parseLongId(group))
        .filter(num => num !== undefined)
        .sort((a, b) => a - b);

    // return 1 if no groups exist
    if (groupNumbers.length === 0) {
        return 1;
    }

    // Find the first missing number/group id in case gaps exist
    // Ex. groups = [rack-group-1, rack-group-4] returns 2
    for (let i = 0; i < groupNumbers.length; i++) {
        if (groupNumbers[i] !== i + 1) {
            return i + 1; // Return the missing number
        }
    }
    // If no gaps were found, return the next number
    return groupNumbers[groupNumbers.length - 1] + 1;
};

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
        // TODO find rack type for rack id
        let rackType: RackStringType;
        if(isRackDefault(roomItem.object_type)){
            rackType = RackTypesStrings[defaultTypeToRackType[roomItem.object_type]]
        }else{
            rackType = RackTypesStrings[roomItem.object_type];
        }
        newUnitLocs[rackType].push({
            num: `${rackType}-${parseInt(roomItem.cage)}` as CageNumber, // TODO num here should be RackStringType-roomItem.cage
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
                scale: prevRoom.layoutData.scale,
                x: rackItem.x_coord,
                y: rackItem.y_coord,
                racks: []
            };
            newLocalRoom.rackGroups.push(rackGroup);
        }
        return rackGroup;
    }

    //TODO isActive here tells us if the rack is currently active in the numbering system
    //check if a rack exists for the rackId, if it does return, else create new rack for the group
    const findOrAddRack = async (rackGroup: RackGroup, rackItem: LayoutHistoryData): Promise<Rack> => {
        // if rack is a default aka 0, then use its default ID
        let rack: Rack = rackGroup.racks.find(r => parseRoomItemNum(r.itemId) === rackItem.rack);
        if (!rack) {
            //create new rack if it doesn't exist
            let type: UnitType;
            let typeName;
            const isDefault = isRackDefault(rackItem.object_type);
            const rackPrefix = isDefault ?  'default-rack' : 'rack';

            let optConfig: SelectRowsOptions = {
                schemaName: "cageui",
                queryName: "racks",
                filterArray: [
                    Filter.create('rackid', rackItem.rack, Filter.Types.EQUALS)
                ]
            }

            const rackData = await labkeyActionSelectWithPromise(optConfig);
            typeName = rackData.rows[0].rack_type;

            optConfig = {
                schemaName: "cageui",
                queryName: "rack_types",
                filterArray: [
                    Filter.create('name', typeName, Filter.Types.EQUALS)
                ]
            }

            const rackTypesData = await labkeyActionSelectWithPromise(optConfig);

            type = {
                rowid: rackTypesData.rows[0].rowid,
                name: rackTypesData.rows[0].name,
                type: isDefault ? defaultTypeToRackType[rackTypesData.rows[0].type] : rackTypesData.rows[0].type,
                isDefault: isDefault,
            };

            rack = {
                cages: [],
                isActive: isDefault ? false : true,
                itemId: `${rackPrefix}-${rackItem.rack}`,
                type: type,
                x: rackItem.x_coord - rackGroup.x, // subtract group coords from layout coords to get rack coords
                y: rackItem.y_coord - rackGroup.y
            };
            rackGroup.racks.push(rack);
        }
        return rack;
    }

    const addCageToRack = (rack: Rack, rackItem: LayoutHistoryData, group: RackGroup) => {
        // only string for RackTypes, not DefaultRackTypes, since cageNum is used for location tracking which uses RackTypes
        let cageNumType: RackStringType;
        if(isRackDefault(rackItem.object_type)){
            cageNumType = RackTypesStrings[defaultTypeToRackType[rackItem.object_type]];
        }else{
            cageNumType = RackTypesStrings[rackItem.object_type];
        }
        console.log("cageNum: ", cageNumType);
        const cage: Cage = {
            cageNum: `${cageNumType}-${parseInt(rackItem.cage)}` as CageNumber,
            id: rack.cages.length + 1, // TODO this might not work depending on order of cages in array, fix this
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
        return({
            itemId: `${RoomObjectTypesStrings[roomObjItem.object_type]}-${roomObjNum++}`, // update room obj num after it is used to next num
            type: roomObjItem.object_type as RoomObjectTypes,
            x: roomObjItem.x_coord,
            y: roomObjItem.y_coord,
            scale: prevRoom.layoutData.scale
        });
    }

    prevRoom.cagingData.forEach((roomItem) => {
        if(isRackEnum(roomItem.object_type)){ // Room item is an enclosure for animals
            handleRackItem(roomItem);
        } else{ // Room item is something else in the room, ex. Door
            newLocalRoom.objects.push(generateRoomObj(roomItem))
        }
    })
    return(newLocalRoom);
}

export const addPrevRoomSvgs = (room: Room, layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>, closeMenuThenDrag,setSelectedObj,setShowCtxMenu) => {
    /*
    TODO attach context menus
     */
    const createRackGroup = (parentGroup, rack, groupScale, isSingleRack) => {
        const rackTypeString: RackStringType = RackTypesStrings[rack.type.type];
        const rackGroup = isSingleRack ? parentGroup : parentGroup.append('g')
            .attr('id', rack.itemId)
            .attr('class', `rack type-${rackTypeString}`)
            .attr('transform', `translate(${rack.x},${rack.y})`)
            .style('pointer-events', 'bounding-box');

        rack.cages.forEach((cage) => {
            const cageGroup = rackGroup.append('g')
                .attr('id', cage.cageNum)
                .attr('transform', `translate(${cage.x},${cage.y})`);


            const unitSvg: SVGElement = (d3.select(`[id=${rackTypeString}_template_wrapper]`) as d3.Selection<SVGElement, {}, HTMLElement, any>)
                .node().cloneNode(true) as SVGElement;

            const shape = d3.select(unitSvg);
            shape.classed('draggable', false);
            shape.style('pointer-events', 'none');

            const cageGroupContext = shape.node().closest((`[id*=${rackTypeString}]`)) as SVGGElement;
            setupEditCageEvent(cageGroupContext, setSelectedObj, setShowCtxMenu, rackTypeString);

            (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum(cage.cageNum)}`;

            cageGroup.append(() => shape.node());
            // TODO attach context menu to unit element

        });

        return rackGroup;
    };

    const createGroup = (group) => {
        const isSingleRack = group.racks.length === 1;
        const parentGroup = isSingleRack
            ? layoutSvg.append('g')
                .attr('id', group.racks[0].itemId)
                .attr('class', `draggable rack type-${RackTypesStrings[group.racks[0].type.type]}`)
                .attr('transform', `translate(${group.racks[0].x},${group.racks[0].y}) scale(${group.scale})`)
                .style('pointer-events', 'bounding-box')
            : layoutSvg.append('g')
                .attr('id', group.groupId)
                .attr('class', 'draggable rack-group');

        parentGroup.attr('transform', `translate(${group.x},${group.y}) scale(${group.scale})`);

        group.racks.forEach(rack => {
            // Use parent group as rackGroup if only 1 rack, otherwise create a new rack group
            const rackGroup = createRackGroup(parentGroup, rack, group.scale, isSingleRack);
        });
        placeAndScaleGroup(parentGroup, group.x, group.y, zoomTransform(layoutSvg.node()));
        parentGroup.call(closeMenuThenDrag);
    };

    room.rackGroups.forEach((group) => {
        createGroup(group);
    })

    room.objects.forEach((roomObj) => {
        const roomObjGroup = layoutSvg.append('g')
            .data([{x: roomObj.x, y: roomObj.y}])
            .attr('id', roomObj.itemId)
            .attr('class', 'draggable room-obj')
            .attr('transform', `translate(${roomObj.x}, ${roomObj.y}) scale(${roomObj.scale})`)
            .style('pointer-events', 'bounding-box');

        const objSvg: SVGElement = (d3.select(`[id=${RoomObjectTypesStrings[roomObj.type]}_template_wrapper]`) as  d3.Selection<SVGElement, {}, HTMLElement, any>).node().cloneNode(true) as SVGElement;

        const shape = d3.select(objSvg)
            .classed('draggable', false)
            .attr('pointer-events', 'none');

        roomObjGroup.append(() => shape.node());

        placeAndScaleGroup(roomObjGroup, roomObj.x, roomObj.y, zoomTransform(layoutSvg.node()));
        roomObjGroup.call(closeMenuThenDrag);
    });

}
// END FUNCTIONS FOR LOADING IN PREVIOUS DATA
export function updateBorderSize(borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>, doorDims: DoorResizeProps, newWidth: number, newHeight: number ){
    const currentRect = d3.select('#border-rect');
    const resizeHandler = borderGroup.selectAll('#resize-handle');
    const doorGroup = borderGroup.selectAll('#border-door');

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

    doorGroup.attr('x', doorDims.startX * doorDims.scaleX)
        .attr('y', doorDims.startY * doorDims.scaleY);

    doorGroup.attr('width', doorDims.startWidth * doorDims.scaleX)
        .attr('height', doorDims.startHeight * doorDims.scaleY);

    updateSvgBounds(newWidth, newHeight, 'border_template');
    updateSvgBounds(newWidth, newHeight, 'border_template_wrapper');
}

const createStartResizeDrag = () => {
    return(
        function startResizeDrag(event) {
            event.sourceEvent.stopPropagation();
            const borderRect = d3.select('#border-rect');
            const doorSvg = d3.select('#border-door');
            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');


            this.startWidth = parseFloat(borderRect.attr('width'));
            this.startHeight =  parseFloat(borderRect.attr('height'));

            this.doorStartX = parseFloat(doorSvg.attr('x'));
            this.doorStartY = parseFloat(doorSvg.attr('y'));
            this.doorStartWidth = parseFloat(doorSvg.attr('width'));
            this.doorStartHeight = parseFloat(doorSvg.attr('height'));
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
            const currentRect = d3.select('#border-rect');
            const resizeHandler = borderGroup.selectAll('#resize-handle');
            const doorGroup = borderGroup.selectAll('#border-door');

            const layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select('#layout-svg');

            // get x and y in relation to the layout svg
            const [x, y] = d3.pointer(event.sourceEvent, layoutSvg.node());

            // calculate delta x and y (change) with respect to grid size for snapping
            const dx = Math.round((x - this.startX) / gridSize);
            const dy = Math.round((y - this.startY) / gridSize);

            // calculate new height and width using previous delta and grid size for snapping
            const newLockedWidth: number = this.startWidth + (dx * gridSize);
            const newLockedHeight: number = this.startHeight + (dy * gridSize);

            const scaleX = newLockedWidth / this.startWidth;
            const scaleY = newLockedHeight / this.startHeight;

            const doorDims: DoorResizeProps = {
                startX: this.doorStartX,
                startY: this.doorStartY,
                startWidth: this.doorStartWidth,
                startHeight: this.doorStartHeight,
                scaleX: scaleX,
                scaleY: scaleY
            }

            updateBorderSize(borderGroup, doorDims, newLockedWidth, newLockedHeight)

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

//TODO remove closeMenuThenDrag call if dragging rect across grid is not desired
export const dragBorder = (closeMenuThenDrag, gridSize, borderGroup, setLocalRoom) => {
    let targetId: string;
    return d3.drag()
        .on('start', function(event) {
            // store target element to prevent switching
            const targetElement = d3.select(event.sourceEvent.target);
            // store target id, either resize handle id or room border group id
            targetId = targetElement.attr('id');
            // Drag group if group is selected, otherwise resize using the rect handlers
            if (targetElement.node().tagName === 'g') {
                //closeMenuThenDrag.on('start').call(this,event);
            } else if (targetElement.node().tagName === 'rect') {
                createStartResizeDrag().call(this, event);
            }
        })
        .on('drag', function(event) {
            // Retrieve the stored target element
            const targetElement = d3.select(`#${targetId}`) as  d3.Selection<any, unknown, null, undefined>;
            if (targetElement.node().tagName === 'g') {
                //closeMenuThenDrag.on('drag').call(this,event);

            } else if (targetElement.node().tagName === 'rect') {
                createDragResizeDrag(gridSize, borderGroup).call(this, event);
            }
        })
        .on('end', function(event) {
            const targetElement = d3.select(`#${targetId}`) as  d3.Selection<any, unknown, null, undefined>;

            if (targetElement.node().tagName === 'g') {
                //closeMenuThenDrag.on('end').call(this,event);
            }else if (targetElement.node().tagName === 'rect') {
                createEndResizeDrag(setLocalRoom).call(this, event);
            }
        })
}