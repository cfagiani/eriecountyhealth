app.get('/healthinspections/facility', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    var queryObj = {}
    //TODO: SANITIZE QUERY STRING
    if (req.query["name"] !== undefined) {
        queryObj.name = new RegExp(req.query["name"], 'i');
    }
    if (req.query["city"] !== undefined) {
        queryObj.city = new RegExp(req.query["city"]);
    }
    if (req.query["type"] !== undefined) {
        queryObj.type = req.query["type"];
    }
    if (req.query["sort"] !== undefined) {
        if (req.query["sort"] == "current-violations") {
            options.sort = {'inspections.0.critical-violations': -1, 'inspections.0.non-critical-violations': -1}
        } else if (req.query["sort"] == "total-violations") {
            //TODO: build query using aggregation framework
        }
    }
    if (req.query["blx"] !== undefined && req.query["bly"] !== undefined && req.query["trx"] !== undefined && req.query["try"] !== undefined) {
        options = {};
        queryObj.loc = {$geoWithin: {$box: [
            [parseFloat(req.query["blx"]), parseFloat(req.query["bly"]) ],
            [parseFloat(req.query["trx"]), parseFloat(req.query["try"]) ]
        ] }};
    }
    if (req.query["cx"] !== undefined && req.query["cy"] !== undefined){
        options = {};
        //ten km default radius
        var rad = 10 ;
        if(req.query['rad']!==undefined && req.query['rad']!==null){
            rad = parseFloat(req.query['rad']);
        }
        queryObj.loc = {$near: {$geometry:{ type: 'Point', coordinates: [parseFloat(req.query["cx"]),parseFloat(req.query["cy"])]}, $maxDistance: 1000*parseFloat(req.query["rad"])}};
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

app.get('/healthinspections/facility/stats', function (req, res) {
    var queryObj = null;
    if (req.query["type"] == "facilitytype") {
        queryObj = {$group: {_id: "$type", count: {$sum: 1}}};
    }
    db.collection('facility', function (err, collection) {
        collection.aggregate(queryObj, function (err, items) {
            items.forEach(function (item) {
                item.text = item._id;
                item._id = undefined;
            });
            //sort descending
            res.send(items.sort(function (a, b) {
                return b.count - a.count
            }));
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

