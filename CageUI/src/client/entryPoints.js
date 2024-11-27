module.exports = {
    apps: [
    {
        name: "home",
        title: "Cage Display",
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/home'
    },
    {
        name: "editLayout",
        title: "Room Layout Editor",
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/layoutEditor'
    }]
};
