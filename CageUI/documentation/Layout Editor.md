# Layout Editor Documentation

This readme explains how the layout editor works and how to set up new room objects.

You can access the view with this url within your main container

`/cageui/WNPRC/EHR/layoutEditor.view`

If you are running the dev server just edit it slightly.

`/cageui/WNPRC/EHR/layoutEditorDev.view`

In order to use this project, make sure to enable the module in your folder set up within labkey.

This project was built for the Chrome browser. If you use a different browser, it may not work as expected. Additionally,
the layout editor was not built for mobile devices. The idea behind this is that once the users build the rooms, they can
be modified on mobile from different endpoints but the act of room creation is better done on desktop.


# Workflow in detail

## Context Manager

The main layout editor entry point is `LayoutEditor.tsx`. This file loads in previous room data if required or simply starts
a new room layout. When starting a new room layout, the user can select a room size from a list of predefined sizes. These sizes
are present in the `constants.ts` file. Once a room is created with a certain size, this cannot be changed.

The layout editor initializes with a context manager `LayoutEditorContextManager.tsx` with its types described in
`layoutEditorContextTypes.ts`. This context manager serves as a place to store the room state and has functions
for any edits that might occur to the room state.

In the context manager (CM) there are two Room objects, **localRoom** and **room**, **room** serves as the initial room or
previous room, and **localRoom** is the room that has changes applied to. This allows development to work with the previous room and
the current room that has local changes applied to it. You can use **room** when saving to check for changes or apply previous room data
to the **localRoom** that is being saved, **room** should not be modified at all during development.

**unitLocs** is another important state within the CM. This state tracks cage positional data within the layout and
serves it in an easy-to-access object. Its keys are rack types and the values contain the x and y global coords of the cage object.
This state tracks the locations of the cages, by rack type. This is used within the editor to determine if two cages are 
adjacent to each other. Any action that changes the cage location in the editor should update this state with the 
new locations. Please note that the coordinates here are global coords.

The last important state in the CM is **cageConnections** this state tracks which cages
are connected/merged to other cages and is used within the CM when deleting cages to split cages into new groups.
An example this is what happens when you have a row of three connected cages and delete the middle cage? The system will
have to split up the remaining two cages on either side into new groups to handle this correctly. This is a complicated 
group of functions that hopefully shouldn't need to be updated as it should be working, but it's worth noting here. Additionally, 
it can be avoided by proper room creation or by deleting the entire group of cages/racks and rebuilding them if needed.

### **Important**

While the CM manages the state, this doesn't automatically handle the changes completely. There is a lot of DOM
manipulation with adding new objects, merging cages, connecting racks, etc. These DOM changes cannot
be performed within the CM and have to be done on the same file that the layout-grid SVG is served from. That is why the 
`Editor.tsx` file is very long.

## Editor

The `Editor.tsx` file is another important file here in the layout editor portion of the project.
This file manages all the SVG DOM manipulation and changes that occur when adding and moving objects around the room.
The file is also where the majority of the code is written for the layout editor.
By pairing this file with the context manager and any used functions within the helper files you essentially have the
entire layout editor. The editor file uses effects to track changes to the unitLocs state to determine if a merge or connect
is requested, if the room should be reloaded with new changes to **localRoom** or when objects/cages are added to the layout.
It uses D3.js and basic DOM functions to handle the dragging and placement of the objects within the editor.

## Templates vs Real layouts

The layout editor supports two styles of rooms, templates and real. While similar in building they differ on a couple
fundamentals. Template rooms are created with the idea that they do not represent a real physcial location. They are merely
a layout that will be loaded into the editor in the future for easier building by users. The major difference and key point
here is that when a cage is dragged onto the layout it is considered to be a "default" of that cage type. "Defaults" do not 
represent real racks or cages and as such they cannot be saved in real rooms. So in order to save a room as a template,
it's racks must all be a "default" type, otherwise it will throw an error. Likewise in order for a real room to be saved 
it cannot have any "default" types and the user must assign a real physical rack to that position. The system will not show 
racks that are already in other rooms preventing double assignment.

## Editor Context Menu

Every object that can be placed within the room has a context menu that the user can access via right-clicking.
Room objects and cages have different menus, but they use the same component. Developers can add additional components to the
context menu via the "menuItems" prop. Refer to the `CageUI Insturctions.html` file on what each current menu item will do.

## Adding New Objects

If you would like to add additional room objects or cage sizes that is also possible. Here is what you will have to do to 
make this possible.

1. Create your SVG file within an editor, I used Adobe Illustrator for this and exported it as an SVG. Once you create this
file that will be used as your object add it to `CageUI/resources/web/CageUI/static`.
   1. If you encounter issues with loading the file after adding it here try going to `localhost:8080/cageui/static/{filename}.svg` 
to ensure that it works and is loaded in correctly. 
2. Add your object under the correct enum in `typings.ts`.
   1. If your new object is a rack/cage type add it under RackTypes, create a default as well.
   2. If your new object is a room object (ex. door) then add it under RoomObjectTypes.
   3. Add your new object to ehr_lookups.cageui_item_types. Ensure your enum value and table values are matching. Additionally,
if your item is a caging type, give it a size in the description field of the table. The size is the number of cells of the object both length and width. 
This is untested for caging types that aren't perfect squares.
3. Next you should add your object into the `Editor.tsx` file via the **RoomItemTemplate** component. Look to others for examples.

If done correctly, your new object should be available to be placed within the editor.

## Important Notes

Here are some additional things to keep in mind when using the layout editor.

1. When cages are placed within the layout they are assigned a rack group, rack and then their cage number/id
2. Users can merge two cages. When this is done, it moves the dragged cage into the target cages rack. 
3. Users can connect two cages. When this is done, it moves the dragged cage and rack into the target cages rack group.
4. Merging and connecting is created with the idea that it lets users build racks and then connect racks, all from single cages. These
changes are reflected within the DOM as well as the state.
   1. To get a grasp on what goes on here, I would suggest inspecting the 'layout-grid' SVG within the DOM and using an
   effect to console log the localRoom state variable from the Editor.tsx file.











