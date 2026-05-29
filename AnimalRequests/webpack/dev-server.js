/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var express = require('express');
var webpack = require('webpack');
var cors = require('cors');
var config = require('./dev.config');

var app = express();
var compiler = webpack(config);

app.use(cors());

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    stats: {
        chunks: false
    },
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

/* final catch-all route to index.html defined last */
app.get('/index.html', (req, res) => {
    res.sendFile('/Users/sebranek/labkey/trunk/externalModules/animalRequests/index.html');
})


app.listen(3000, 'localhost', function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://localhost:3000');
});
