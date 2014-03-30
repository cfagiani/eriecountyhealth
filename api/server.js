var express = require('express'),
    url = require("url"),
    fs = require("fs");

//purposely defined as global
app = express();

var path = require('path');
var application_root = __dirname;

//TODO: real error handling This is just quick and dirty to prevent crashes
process.on('uncaughtException', function (err) {
    console.log(err);
})


app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    express.logger('dev');
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


require('./routes');

//TODO: make port config driven
app.listen(3000);
console.log('Server started on port 3000');
