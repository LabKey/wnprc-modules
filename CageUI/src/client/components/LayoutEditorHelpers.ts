// Layout Editor Helpers
import * as d3 from 'd3';
import {
    getTranslation,
    getTypeClassFromElement,
    isTextEditable,
    parseGroupId,
    parseRack,
    parseRoomItemNum,
    parseRoomItemType
} from './helpers';
import {
    Cage,
    CageActionProps,
    CageNumber,
    DEFAULT_CAGE_TYPE,
    GroupId,
    LayoutDragProps,
    LayoutHistoryData,
    LocationCoords,
    OffsetProps,
    PrevRoom,
    Rack,
    RackActions,
    RackGroup,
    RackTypes,
    Room,
    RoomObject,
    RoomObjectTypes,
    StartDragProps, UnitLocations
} from './typings';
import * as React from 'react';
import { zoomTransform } from 'd3';

export const drawGrid = (layoutSvg: d3.Selection<SVGElement, unknown, any, any>, updateGridProps) => {
    layoutSvg.append("g").attr("class", "grid");
    updateGrid(d3.zoomIdentity, updateGridProps.width, updateGridProps.height, updateGridProps.gridSize); // Draw grid with the initial view
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
    for (let x = xMin; x < xMax; x += gridSize) {
        for (let y = yMin; y < yMax; y += gridSize) {
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
    element: SVGTextElement,
    setClickedCage: (cageId: string) => void,
    setCtxMenuStyle:  React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
    rackType: RackTypes
): () => void {
    const handleContextMenu = function(this: SVGGElement, event: MouseEvent) {
        event.preventDefault();
        const cageGroupElement = this.closest(`[id^=${rackType}-]`) as SVGGElement | null;
        console.log("Open Menu: ", cageGroupElement)

        setClickedCage(cageGroupElement.id);

        setCtxMenuStyle({
            display: 'block',
            left: `${event.pageX - 10}px`,
            top: `${event.pageY - 10}px`,
        });
    }

    // Attach context menu to the lowest level group for that cage.
    const cageGroupElement: SVGGElement = element.closest(`[id^=${rackType}]`) as SVGGElement;
    console.log("Attach menu: ", cageGroupElement)
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
export async function mergeRacks(targetRack: Rack, draggedRack: Rack, targetRackGroup: RackGroup, dragRackGroup: RackGroup, doRackAction, layoutDragProps: LayoutDragProps, cageActionProps: CageActionProps) {
    if(!d3.select('.popup').empty()) return;
    const action: RackActions = await showConfirmationPopup();
    const {
        layoutSvg,
        gridSize,
        MAX_SNAP_DISTANCE,
        delRack,
        moveItem,
        itemClass
    } = layoutDragProps;

    console.log("Performing Merge");

    function isConnected(selectionNode){
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles, give merged cages a grouped class
    function resetElementProperties(element, shapeType, action) {
        if(action === 'merge'){
            element.classList = `grouped-${shapeType}`;
            element.style = "";
        }
        const textEle = d3.select(element).selectAll('text').node() as SVGTextElement;
        setupEditCageEvent(textEle, cageActionProps.setEditCageNum, cageActionProps.setCtxMenuStyle, shapeType as RackTypes);
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup, action: RackActions) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'))
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetShape = d3.select(this);
            let shapeType;
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
                    resetElementProperties(this, shapeType, action);
                })
            }else{
                resetElementProperties(this, shapeType, action);
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
                    resetElementProperties(this, getTypeClassFromElement(shape), action);
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

            //Attach data from target to new shape
            const targetData = targetRackShape.datum() as { x: number; y: number };
            if(targetData) {
                newGroup.data([{x: targetData.x, y: targetData.y}])
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

            console.log("End Processing: ", newGroup);
        }

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetRackShape.attr('transform');
        if (transformAttr) {
            newGroup.attr('transform', transformAttr);
        }


        const addProps: LayoutDragProps = {
            gridSize: gridSize,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveItem: moveItem,
            itemClass: itemClass
        };
        newGroup.call(d3.drag().on('start', createStartDragInLayout({setRoomItem: cageActionProps.setEditCageNum}))
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));

        doRackAction(action,targetRackId, draggedRackId, newGroup);

        // Remove the original shapes from the DOM
        targetRackShape.remove();
        draggedRackShape.remove();
    }
}

// This checks the adjacency of two racks to determine if they can be merged
export function checkAdjacent(targetCage: LocationCoords, draggedCage: LocationCoords, gridSize: number, gridRatio: number) {

    console.log("Adj Cage ", targetCage, draggedCage)

    const boxWidth = gridSize * gridRatio;

    let horizontallyAdjacent = false;
    let verticallyAdjacent = false;

    // Check for horizontal adjacency
    if (Math.abs(targetCage.cellX - draggedCage.cellX) === boxWidth &&
        targetCage.cellY === draggedCage.cellY) {
        console.log("Adj found: x");
        horizontallyAdjacent = true;
    }// Check for vertical adjacency
    else if (Math.abs(targetCage.cellY - draggedCage.cellY) === boxWidth &&
        targetCage.cellX === draggedCage.cellX)  {
        console.log("Adj found: y");
        verticallyAdjacent = true;
    }
    const isAdjacent = horizontallyAdjacent || verticallyAdjacent;
    console.log("Is adjacent:", isAdjacent);
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
    // Adjust the grid size according to the current zoom level
    const adjustedGridSize = gridSize;

    // Adjust the coordinates based on the current zoom and pan transform
    const adjustedX = transform.invertX(x);
    const adjustedY = transform.invertY(y);

    // Calculate the column and row index based on the adjusted grid size
    const col = Math.floor(adjustedX / adjustedGridSize);
    const row = Math.floor(adjustedY / adjustedGridSize);
    // Return the top-left corner coordinates of the rectangle
    return {
        x: col * adjustedGridSize,
        y: row * adjustedGridSize,
    };
}

// Layout Drag Helpers
export function createStartDragInLayout(startDragProps: StartDragProps) {
    return(
        function startDragInLayout(event) {
            const {setRoomItem} = startDragProps;
            // Check if the parent <text> element is editable, return if not
            if (isTextEditable(event)) {
                event.on('drag', null).on('end', null); // Detach drag and end events
                return;
            }
            setRoomItem(d3.select(this).attr('id'));
            console.log('Drag Layout #1', parseRack(d3.select(this).attr('id')));
            d3.select(this).raise().classed('active', true);
        }
    );
}

export function createDragInLayout(dragProps) {
    return(
        function dragInLayout(event) {
            const {layoutSvg} = dragProps;
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
                layoutSvg,
                delRack,
                moveItem,
                itemClass
            } = props;
            const shape = d3.select(this);
            shape.classed('active', false);
            const transform = d3.zoomTransform(layoutSvg.node());

            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
                clientY: event.sourceEvent.clientY,
                layoutSvg: layoutSvg})

            const targetCell = getTargetRect(x, y, gridSize, transform);

            if (targetCell) {
                console.log('Drag Layout #3', shape, targetCell);
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                placeAndScaleGroup(shape, cellX, cellY, transform);

                console.log("#3: ", cellX, cellY, shape.node());
                moveItem(shape.attr('id'), itemClass, cellX, cellY, transform.k);
            } else {
                // remove rack from room
                /*console.log("deleting cage from room", getRackFromClass(shape.attr('class')));
                const idToDel = parseInt(getRackFromClass(shape.attr('class')));
                delRack(idToDel);
                shape.remove();*/
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




// TODO might not be needed
export const isRack = (itemType: RackTypes | RoomObjectTypes): itemType is RackTypes => {
    return Object.values(RackTypes).includes(itemType as RackTypes);
}

// finds a cage by cageNum in group of racks if it exists
export const findSelectObjRack = (racks: Rack[], obj: string): Rack => {
    return racks.find(rack => {
        return rack.cages.find((cage) => cage.cageNum === obj)
    });
}

// Finds the next avail group id number
export const findNextGroupId = (groups: GroupId[]): number => {
    const groupNumbers = groups
        .map(group => parseGroupId(group))
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
    let targetRack: Rack | undefined;
    let targetGroup: RackGroup | undefined;

    targetGroup = groups.find((group: RackGroup) =>
        group.racks.some((rack: Rack) => rack.itemId === targetId)
    );

    if (targetGroup) {
        targetRack = targetGroup.racks.find((rack: Rack) => rack.itemId === targetId);
    }
    return {rack: targetRack, rackGroup: targetGroup};
}

// FUNCTIONS FOR LOADING IN PREVIOUS DATA

export const buildNewLocs = (prevRoomData: LayoutHistoryData[]): UnitLocations => {
    const newUnitLocs: UnitLocations = {
        attachedPlayCage: [],
        cage: [],
        pen: [],
        tempCage: []
    }

    prevRoomData.forEach(roomItem => {
        if(roomItem.room_object) return; // ignore room objects here
        // TODO find rack type for rack id

        newUnitLocs.cage.push({
            num: `cage-${roomItem.cage}` as CageNumber, // TODO num here should be RackType-roomItem.cage
            cellX: roomItem.x_coord,
            cellY: roomItem.y_coord
        });
    })
    return newUnitLocs;
}

export const buildNewLocalRoom = (prevRoom: PrevRoom): Room => {
    const newLocalRoom: Room = {
        room: prevRoom.name,
        rackGroups: [],
        objects: []
    };
    let roomObjNum = 1;

    //check if a group exists for the groupId, if it does return, else create new group for the room
    const findOrAddGroup = (rackItem: LayoutHistoryData): RackGroup => {
        // groupId is a single number so check if the GroupId string contains it
        let rackGroup: RackGroup = newLocalRoom.rackGroups.find(group => group.groupId.includes(rackItem.rack_group))
        if (!rackGroup) {
            //create new rack group if it doesn't exist
            rackGroup = {
                groupId: `rack-group-${rackItem.rack_group}` as GroupId,
                scale: rackItem.scale,
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
    const findOrAddRack = (rackGroup: RackGroup, rackItem: LayoutHistoryData): Rack => {
        let rack: Rack = rackGroup.racks.find(r => r.itemId === rackItem.rack);
        if (!rack) {
            //create new rack if it doesn't exist
            rack = {
                cages: [],
                isActive: true,
                itemId: rackItem.rack,
                type: DEFAULT_CAGE_TYPE, // TODO find the rack type in the database for rackId
                x: rackItem.x_coord - rackGroup.x, // subtract group coords from layout coords to get rack coords
                y: rackItem.y_coord - rackGroup.y
            };
            rackGroup.racks.push(rack);
        }
        return rack;
    }

    const addCageToRack = (rack: Rack, rackItem: LayoutHistoryData, group: RackGroup) => {
        const cage: Cage = {
            adjCages: undefined,
            cageNum: `${RackTypes.Cage}-${rackItem.cage}` as CageNumber, // TODO depending on rack type this will change
            cageState: undefined,
            height: 0, // TODO find height at time for cage in Cage History
            id: rack.cages.length + 1, // TODO this might not work depending on order of cages in array, fix this
            length: 0,// TODO find length at time for cage in Cage History
            position: undefined, // TODO find this as well, probably some smart way depending on rack type and cage id number
            sqft: 0,// TODO find height at time for cage in Cage History
            width: 0,// TODO find height at time for cage in Cage History
            x: rackItem.x_coord - rack.x - group.x, // get cage coords by subtracting from both rack and group
            y: rackItem.y_coord - rack.y - group.y
        }
        rack.cages.push(cage);
    }


    const handleRackItem = (rackItem: LayoutHistoryData) => {
        const rackGroup: RackGroup = findOrAddGroup(rackItem);
        const rack: Rack = findOrAddRack(rackGroup, rackItem);
        addCageToRack(rack, rackItem, rackGroup);
    }

    // generates room object state for room objects from layout history data
    const generateRoomObj = (roomObjItem: LayoutHistoryData): RoomObject => {
        return({
            itemId: `${roomObjItem.room_object}-${roomObjNum++}`, // update room obj num after it is used to next num
            type: roomObjItem.room_object,
            x: roomObjItem.x_coord,
            y: roomObjItem.y_coord,
            scale: roomObjItem.scale
        });
    }

    prevRoom.data.forEach((roomItem) => {
        if(!roomItem.room_object){ // Room item is an enclosure for animals
            handleRackItem(roomItem);
        } else{ // Room item is something else in the room, ex. Door
            newLocalRoom.objects.push(generateRoomObj(roomItem))
        }
    })

    return(newLocalRoom);
}

export const addPrevRoomSvgs = (room: Room, layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>) => {
    /*
    TODO attach context menus, layout drags, and support for connected rack groups
     */

    room.rackGroups.forEach((group) => {
        // single rack in group, don't add to svg group of class rack-group
        if(group.racks.length === 1){
            // new group here should have classes 'draggable rack type-{RackType}', id of rack, style and transform
            const rack = group.racks[0];
            // if only one rack in a group, the rack svg group x and y will use the groups coords because
            // technically the rack x and y are local to that rack group
            const rackSVGGroup = layoutSvg.append('g')
                .attr('id', rack.itemId)
                .attr('class', `draggable rack type-${rack.type.type}`)
                .attr('transform', `translate(${group.x},${group.y}) scale(${group.scale})`)
                .style('pointer-events', 'bounding-box');
            rack.cages.forEach((cage) => {
                // for each cage, create group with id = cageNum, transform of that cage,
                // and add to it a RackType_template SVG as a child, the group in this template of id = RackType:
                // add style for pointer events and attach context menu to that child
                const cageGroup = rackSVGGroup.append('g')
                    .attr('id', cage.cageNum)
                    .attr('transform', `translate(${cage.x},${cage.y})`);
                // caging unit svg selected from utils and its node deep cloned to avoid using the real one
                const unitSvg: SVGElement = (d3.select(`[class=${rack.type.type}-template]`).select(':first-child') as  d3.Selection<SVGElement, {}, HTMLElement, any>).node().cloneNode(true) as SVGElement;

                // now that the node is cloned we can change it to fit our use case
                const shape = d3.select(unitSvg);
                shape.classed('draggable', false);
                shape.style('pointer-events', 'none');

                //TODO attach context menu to unit element

                // now add style and context menu attachment to sub group for rack type
                shape.select(`[id=${rack.type.type}]`).style('pointer-events', 'bounding-box');

                // change tspan to reflect the cage number
                (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum(cage.cageNum)}`;

                cageGroup.append(() => shape.node());
            });

            // TODO might need to be replaced with group.scale instead of layoutSvg transform, then fix layoutSvg to fit that scale
            placeAndScaleGroup(rackSVGGroup, group.x, group.y, zoomTransform(layoutSvg.node()));
        }
    })
    room.objects.forEach((roomObj) => {
        const roomObjGroup = layoutSvg.append('g')
            .data([{x: roomObj.x, y: roomObj.y}])
            .attr('id', roomObj.itemId)
            .attr('class', 'draggable room-obj')
            .attr('transform', `translate(${roomObj.x}, ${roomObj.y}) scale(${roomObj.scale})`)
            .style('pointer-events', 'bounding-box');

        const objSvg: SVGElement = (d3.select(`[id=${roomObj.type}-util]`) as  d3.Selection<SVGElement, {}, HTMLElement, any>).node().cloneNode(true) as SVGElement;

        const shape = d3.select(objSvg)
            .classed('draggable', false)
            .attr('pointer-events', 'none');

        roomObjGroup.append(() => shape.node());

        placeAndScaleGroup(roomObjGroup, roomObj.x, roomObj.y, zoomTransform(layoutSvg.node()));
    })
}

// END FUNCTIONS FOR LOADING IN PREVIOUS DATA
