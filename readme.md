Erie County Health Inspection API
==========

This project has two components:
* scraper - a utility that uses the DataSponge project to crawl the Erie County Dept of Health Inspection website and store the data into a mongo database
* api - a small app that uses node.js and express to expose an API on top of the mongo database. The project integrates Swagger to provide a simple UI on top of the apis for experimentation

###TODO
* augment data in facilities database with geo coordinates to allow geospatial searches
* summarize data (number of violations, etc)
* api keys/ rate limiting
* error handling




