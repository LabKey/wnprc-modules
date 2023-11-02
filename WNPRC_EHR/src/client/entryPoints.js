module.exports = {
    apps: [{
        name: 'grid_panel',
        title: 'Default Grid',
        permission: 'read',
        path: './src/client/components/grid_panel'
    },{
        name: 'grid_panel_webpart',
        title: 'Default Grid Webpart',
        permission: 'read',
        path: './src/client/components/grid_panel/webpart',
        generateLib: true
    },{
        name: 'breeding',
        title: 'Pregnancies',
        permission: 'read',
        path: './src/client/breeding'
    },{
        name: 'breeding_webpart',
        title: 'Pregnancies Webpart',
        permission: 'read',
        path: './src/client/breeding/webpart',
        generateLib: true
    },{
        name: 'feeding',
        title: 'Feeding',
        permission: 'read',
        path: './src/client/feeding/base'
    },{
        name: 'abstract',
        title: 'Abstract',
        permission: 'read',
        path: './src/client/abstract/base',
        generateLib: true
    },{
        name: 'research_ultrasounds',
        title: 'Research Ultrasounds',
        permission: 'read',
        path: './src/client/researchUltrasounds'
    },{
        name: 'research_ultrasounds_webpart',
        title: 'Research Ultrasounds Webpart',
        permission: 'read',
        path: './src/client/researchUltrasounds/webpart',
        generateLib: true
    },{
        name: 'weight',
        title: 'Weight',
        permission: 'login',
        path: './src/client/weight'
    }, {
        name: "research_ultrasounds_entry",
        title: "Research Ultrasounds Entry",
        permission: "login",
        path: './src/client/researchUltrasoundsEntry'
    }
]
};
