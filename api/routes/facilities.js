
app.get('/healthinspections/facility', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    if (req.query["name"] == undefined) {
        db.collection('facility', function (err, collection) {

            collection.find({}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.inspections = '/healthinspections/facility/' + item._id + '/inspections';
                });
                res.send(items);
            });
        });
    } else {
        db.collection('facility', function (err, collection) {
            //TODO: SANITIZE QUERY STRING
            collection.find({name: new RegExp(req.query["name"])}, options).toArray(function (err, items) {
                items.forEach(function (item) {
                    item.inspections = '/healthinspections/facility/' + item._id + '/inspections';
                });
                res.send(items);
            });
        });
    }
});

app.get('/healthinspections/facility/:id', function (req, res) {
    var id = req.params.id;
    db.collection('facility', function (err, collection) {
        collection.findOne({'_id': id}, function (err, item) {
            item.inspections = '/healthinspections/facility/' + item._id + '/inspections';
            res.send(item);
        });
    });
});
