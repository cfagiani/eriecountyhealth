var map = null;
var markers = null;

function init() {
    map = new OpenLayers.Map("mapdiv");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);


    var lonlat = new OpenLayers.LonLat(-78.865002, 42.901206).transform(
        new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
        new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator
    );

    var zoom = 15;

    markers = new OpenLayers.Layer.Markers("Markers");
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
        markers.clearMarkers();
        $.each(data, function (index, value) {
            if (value.loc !== undefined) {
                var lonlat = new OpenLayers.LonLat(value.loc.coordinates[0], value.loc.coordinates[1]).transform(
                    new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                    new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator
                );
                var marker =new OpenLayers.Marker(lonlat);

                markers.addMarker(marker);
                /*marker.events.register('mousedown', marker, function(evt) {

                });*/
            }

        });
    });
}