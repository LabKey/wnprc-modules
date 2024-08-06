module.exports = {
    apps: [
    {
        name: "home",
        title: "Cage Display",
        permission: "login",
        path: './src/client/home'
    },
    {
        name: "editLayout",
        title: "Room Layout Editor",
        permission: "login",
        path: './src/client/layoutEditor'
    }]
};
