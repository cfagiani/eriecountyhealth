app.get('/healthinspections/facility', function (req, res) {
    var page = 0
    if (req.query["page"] != undefined) {
        page = parseInt(req.query["page"]);
    }

    var options = {"limit": pageLimit, "skip": page * pageLimit, "sort": "name"};
    var queryObj = {}
    //TODO: SANITIZE QUERY STRING
    if (req.query["name"] !== undefined) {
        queryObj.name = new RegExp(req.query["name"]);
    }
    if (req.query["city"] !== undefined) {
        queryObj.city = new RegExp(req.query["city"]);
    }
    if (req.query["type"] !== undefined) {
        queryObj.type = req.query["type"];
    }
    if(req.query["sort"] !== undefined){
        if(req.query["sort"] == "current-violations"){
            options.sort = {'inspections.0.critical-violations' : -1, 'inspections.0.non-critical-violations':-1}
        }else if (req.query["sort"] == "total-violations"){
            //TODO: build query using aggregation framework
        }
    }
    if(req.query["blx"] !==undefined  && req.query["bly"] !==undefined && req.query["trx"] !==undefined  && req.query["try"] !==undefined){
        options = {};
        queryObj.loc = {$geoWithin: {$box :[[parseFloat(req.query["blx"]),parseFloat(req.query["bly"]) ],[parseFloat(req.query["trx"]),parseFloat(req.query["try"]) ]] }}
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

