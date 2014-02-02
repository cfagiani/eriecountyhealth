app.get('/healthinspections/facility', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    var queryObj = {}
    //TODO: SANITIZE QUERY STRING
    if (req.query["name"] != undefined) {
        queryObj.name = new RegExp(req.query["name"]);
    }
    if (req.query["city"] != undefined) {
        queryObj.city = new RegExp(req.query["city"]);
    }
    if (req.query["type"] != undefined) {
        queryObj.type = req.query["type"];
    }


    db.collection('facility', function (err, collection) {

        collection.find(queryObj, options).toArray(function (err, items) {
            items.forEach(function (item) {
                item.inspectionsLink = '/healthinspections/facility/' + item._id + '/inspections';
            });
            res.send(items);
        });
    });

});

app.get('/healthinspections/facility/:id', function (req, res) {
    var id = req.params.id;
    db.collection('facility', function (err, collection) {
        collection.findOne({'_id': id}, function (err, item) {
            item.inspectionsLink = '/healthinspections/facility/' + item._id + '/inspections';
            res.send(item);
        });
    });
});
