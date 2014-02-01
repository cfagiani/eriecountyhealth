app.get('/healthinspections/facility/:id/inspections', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var queryObj = {facilityId: req.params.id}
    //TODO: SANITIZE QUERY STRING
    if (req.query["type"] != undefined) {
        queryObj.type = req.query["type"];
    }

    if (req.query["violations"] != undefined) {
        queryObj.violations = {$not: {$size: 0}}
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};

    db.collection('inspection', function (err, collection) {
        collection.find(queryObj, options).toArray(function (err, items) {
            items.forEach(function (item) {
                item.facility = '/healthinspections/facility/' + item.facilityId;
            });
            res.send(items);
        });
    });

});

app.get('/healthinspections/inspection', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }


    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};

    var queryObj = {}
    if (req.query["type"] != undefined) {
        queryObj.type = req.query["type"];
    }
    if (req.query["violations"] != undefined && req.query["violations"] == "true") {
        queryObj.violations = {$not: {$size: 0}}
    }

    db.collection('inspection', function (err, collection) {

        collection.find(queryObj, options).toArray(function (err, items) {
            items.forEach(function (item) {
                item.facility = '/healthinspections/facility/' + item.facilityId;
            });
            res.send(items);
        });
    });
});

app.get('/healthinspections/inspection/:id', function (req, res) {
    var id = req.params.id;
    db.collection('inspection', function (err, collection) {
        collection.findOne({_id: id}, function (err, item) {
            item.facility = '/healthinspections/facility/' + item.facilityId;
            res.send(item);
        });
    });
});
