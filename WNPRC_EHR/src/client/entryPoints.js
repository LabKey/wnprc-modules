module.exports = {
    apps: [{
        name: 'breeding',
        title: 'Pregnancies',
        permission: 'read',
        path: './src/client/breeding'
    },{
        name: 'breeding_webpart',
        title: 'Breeding Webpart',
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
        path: './src/client/abstract/base'
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
    },{
        name: 'researchUltrasoundsEntry',
        title: 'Research Ultrasounds Data Entry',
        permission: 'login',
        path: './src/client/researchUltrasoundsEntry'
    }]
};
