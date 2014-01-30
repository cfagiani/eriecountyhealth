app.get('/healthinspections/facility/:id/inspections', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    if (req.query["type"] == undefined) {
        db.collection('inspection', function (err, collection) {

            collection.find({facilityId: req.params.id}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.facility = '/healthinspections/facility/' + item.facilityId;
                });
                res.send(items);
            });
        });
    } else {
        db.collection('inspection', function (err, collection) {
            //TODO: SANITIZE QUERY STRING
            collection.find({facilityId: req.params.id, type: new RegExp(req.query["type"])}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.facility = '/healthinspections/facility/' + item.facilityId;
                });
                res.send(items);
            });
        });
    }
});

app.get('/healthinspections/inspection', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    if (req.query["type"] == undefined) {
        db.collection('inspection', function (err, collection) {

            collection.find({}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.facility = '/healthinspections/facility/' + item.facilityId;
                });
                res.send(items);
            });
        });
    } else {
        db.collection('inspection', function (err, collection) {
            //TODO: SANITIZE QUERY STRING
            collection.find({type: new RegExp(req.query["type"])}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.facility = '/healthinspections/facility/' + item.facilityId;
                });
                res.send(items);
            });
        });
    }
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
