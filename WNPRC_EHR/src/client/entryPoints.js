module.exports = {
    apps: [{
        name: 'grid_panel',
        title: 'Default Grid',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/components/grid_panel'
    },{
        name: 'grid_panel_webpart',
        title: 'Default Grid Webpart',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/components/grid_panel/webpart',
        generateLib: true
    },{
        name: 'breeding',
        title: 'Pregnancies',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/breeding'
    },{
        name: 'breeding_webpart',
        title: 'Pregnancies Webpart',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/breeding/webpart',
        generateLib: true
    },{
        name: 'feeding',
        title: 'Feeding',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/feeding/base'
    },{
        name: 'abstract',
        title: 'Abstract',
        path: './src/client/abstract/base',
        generateLib: true
    },{
        name: 'research_ultrasounds',
        title: 'Research Ultrasounds',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/researchUltrasounds'
    },{
        name: 'research_ultrasounds_webpart',
        title: 'Research Ultrasounds Webpart',
        path: './src/client/researchUltrasounds/webpart',
        generateLib: true
    },{
        name: 'weight',
        title: 'Weight',
        // permission: 'login',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client/weight',
        requiresLogin: true
    }]
};
