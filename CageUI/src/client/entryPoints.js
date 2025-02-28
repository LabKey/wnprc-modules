module.exports = {
    apps: [
    {
        name: "home",
        title: "Cage Display",
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/pages/home'
    },
    {
        name: "editLayout",
        title: "Room Layout Editor",
        permissionClasses: [
                'org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission',
                'org.labkey.cageui.security.permissions.CageUIRoomModifierPermission',
        ],
        path: './src/client/pages/layoutEditor'
    }]
};
