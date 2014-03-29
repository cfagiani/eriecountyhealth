var map = null;
var markers = null;

var epsg4326 =  new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
var projectTo = new OpenLayers.Projection("EPSG:900913"); //The map projection (Spherical Mercator)



function init() {
    map = new OpenLayers.Map("mapdiv");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);


    var lonlat = new OpenLayers.LonLat(-78.865002, 42.901206).transform(epsg4326, projectTo);

    var zoom = 15;

    markers =  new OpenLayers.Layer.Vector("Overlay");
    map.addLayer(markers);

    map.setCenter(lonlat, zoom);
    map.events.register('moveend',map,function(evt){fetchPoints();});
}


function fetchPoints() {
    var bounds = map.getExtent();
    var bottomLeft = new OpenLayers.Geometry.Point(bounds.left, bounds.bottom);
    bottomLeft.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

    var topRight = new OpenLayers.Geometry.Point(bounds.right, bounds.top);
    topRight.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

    $.get("/healthinspections/facility?blx=" + bottomLeft.x + "&bly=" + bottomLeft.y + "&trx=" + topRight.x + "&try=" + topRight.y, function (data) {
        markers.removeAllFeatures();
        $.each(data, function (index, value) {
            if (value.loc !== undefined) {

                var marker = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point( value.loc.coordinates[0], value.loc.coordinates[1]).transform(epsg4326, projectTo),
                    {description:'This is the value of<br>the description attribute'} ,
                    {externalGraphic: '/images/marker-red.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
                );

                markers.addFeatures(marker);

                /*marker.events.register('mousedown', marker, function(evt) {

                });*/
            }

        });
    });
}