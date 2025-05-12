module.exports = {
    apps: [
    {
        name: "editLayout",
        title: "Room Layout Editor",
        permissionClasses: [
            'org.labkey.api.security.permissions.ReadPermission',
            'org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission',
        ],
        path: './src/client/pages/layoutEditor'
    }]
};
