var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSON;

var server = new Server('localhost', 27017, {auto_reconnect: true});

pageLimit = 100

db = new Db('data', server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'data' database");
    }
});

require('./inspections');
require('./facilities');
require('./swagger');
