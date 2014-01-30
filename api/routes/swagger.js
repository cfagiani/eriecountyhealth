var path=require("path");

app.get('/api-docs', function (req, res) {

    res.sendfile(path.join(__dirname,"../api-docs/api-docs.json"));

});

app.get('/api-docs/facility', function (req, res) {

    res.sendfile(path.join(__dirname,"../api-docs/facility.json"));

});

app.get('/api-docs/inspection', function (req, res) {

    res.sendfile(path.join(__dirname,"../api-docs/inspection.json"));

});