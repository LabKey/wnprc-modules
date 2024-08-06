import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { addNewRack, changeStyleProperty, createDragBehavior } from './helpers';
import { useCurrentContext } from './ContextManager';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import { Rack, RackTypes } from './typings';
import { Popup } from './Popup';
import { RackTemplate } from './RackTemplate';

const TestSVG = () => {
    const svgRef = useRef(null);
    const [totalCages, setTotalCages] = useState(0);
    const [addingRack, setAddingRack] = useState<boolean>(false);
    const [selectedEditRect, setSelectedEditRect] = useState<SVGRectElement>(null);
    const {
        localRoom,
        loading,
        error,
        addRack,
        updateLocalRacks,
        saveChanges,
        hasUnsavedChanges,
        room,
        isEditingRoom,
        isDraggingEnabled
    } = useCurrentContext();

    const gridSize = 30; // Adjust based on your room size, in pixels the size of the grid square side
    const gridWidth = 43; // col of grid
    const gridHeight = 27; // row of grid
    console.log("render");

    //Effect for loading in new racks to the room grid
    useEffect(() => {
        if (loading || error || !svgRef.current) return;

        const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

        // Clear previous rack elements, but keep the room template elements
        svg.selectAll('g.rack').remove();

        const drag = createDragBehavior(svgRef, gridSize, gridWidth, gridHeight, updateLocalRacks, isDraggingEnabled);

        // Select the existing 'racks' group or create it if it doesn't exist
        let rackGroup = svg.select('g.racks');
        if (rackGroup.empty()) {
            rackGroup = svg.append('g').attr('class', 'racks');
        }
        let cageCounter = 1;

        const groups = rackGroup.selectAll<SVGGElement, Rack>('g.rack')
            .data(localRoom)
            .join('g')
            .attr('class', `rack`)
            .attr('id', d => `rack-${d.id}`)
            .attr('transform', d => {
                const x = (d.xPos || 0) * gridSize;
                const y = (d.yPos || 0) * gridSize;
                return `translate(${x}, ${y})`;
            })
            //.call(drag);

        groups.each(function(d) {
            const width = (d.width || 1) * gridSize;
            const height = (d.height || 1) * gridSize;
            d3.select(this).select('rect')
                .attr('width', width)
                .attr('height', height);
        });

        // Function to get the appropriate template based on rack type
        const getTemplateForRack = (rackType) => {
            switch(rackType) {
                case RackTypes.OneOfOne:
                    return svg.select('#two-rack-template');
                case RackTypes.TwoOfTwo:
                    return svg.select('#four-rack-template');
                default:
                    console.error("Unknown rack type:", rackType);
                    return null;
            }
        };

        groups.each(function(d, rackIdx) {
            const group = d3.select(this);
            const rackTemplate = getTemplateForRack(d.type);

            if (rackTemplate && !rackTemplate.empty()) {
                const templateHTML = rackTemplate.html();

                // Copy the rack template for each rack
                group.html(templateHTML);

                // Update the rack ID
                group.select('[id="rack-x"]').attr('id', `rack-${d.id}`);
                // Update the cage names and handle variable number of cages and get all cage elements and reverse their order
                // Get the cage elements
                const cageElements = group.selectAll('[id^="cage-"]').nodes().reverse();

                // Calculate the midpoint of the array
                const midpoint = Math.ceil(groups.size() / 2);
                if(midpoint < d.id){
                    cageElements.reverse();
                }

                // Update the cage names and handle variable number of cages
                cageElements.forEach((cageElement, index) => {
                    const cageGroup = d3.select(cageElement);
                    const cageId = cageGroup.attr('id');
                    cageGroup.attr('id', `${cageId}-${d.id}`);
                    cageGroup.select('text tspan').text(cageCounter);
                    cageCounter++;
                });
            } else {
                console.error("Rack template not found for type:", d.type);
            }
        });

        setTotalCages(cageCounter - 1);

    }, [localRoom, loading, error, updateLocalRacks, isDraggingEnabled]);
    const handleAddNewRack = (event) => {
        const rack = event.target;
        setSelectedEditRect(rack);
        setAddingRack(true);
    }

    const updateViewBox = (svg) => {
        const width = svg.width.baseVal.value
        const height = svg.height.baseVal.value

        if (svg) {
            svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svgRef.current.setAttribute('width', width);
            svgRef.current.setAttribute('height', height);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return (
        <div>
            <svg
                preserveAspectRatio="xMidYMid meet"
                width={gridWidth * gridSize}
                height={gridHeight * gridSize}
                ref={svgRef}
            >
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/RoomGrid.svg`}
                    wrapper={'svg'}
                    beforeInjection={(svg) => {
                        const addRacks: NodeListOf<SVGRectElement> = svg.querySelectorAll('[id^="add-rack"]');
                        // Add handlers to the blue rectangles that control locations to add racks
                        addRacks.forEach((rack) => {
                            rack.onclick = (event) => handleAddNewRack(event);
                        });
                    }}
                    afterInjection={(svg) => {
                        //Shows the boxes that are available locations to place cages.
                        if (isEditingRoom) {
                            const rackLoc = svg.querySelector<SVGElement>('#rack-locations');
                            [...rackLoc.children].forEach((childNode: SVGElement) => {
                                changeStyleProperty(childNode, 'fill', '#224085');
                            });
                        }
                        // Add racks depending on room defaults
                        room.forEach((rack) => {
                            if (!localRoom.find(locRack => locRack.id === rack.id)) {
                                addNewRack(
                                    selectedEditRect,
                                    gridSize,
                                    localRoom,
                                    room,
                                    addRack,
                                    setAddingRack,
                                    rack.type,
                                    rack.id
                                );
                            }
                        });
                        updateViewBox(svg);
                    }}
                />
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/FourRack.svg`}
                    id={'four-rack-template'}
                    hidden={true}
                    wrapper={'svg'}
                />
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/TwoRack.svg`}
                    id={'two-rack-template'}
                    hidden={true}
                    wrapper={'svg'}
                />
            </svg>
            <button onClick={saveChanges} disabled={!hasUnsavedChanges}>Save Changes</button>
            {hasUnsavedChanges && <span>You have unsaved changes</span>}
            <div>Total Cages: {totalCages}</div>
        </div>
    );
};
export default TestSVG;

