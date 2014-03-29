var map = null;
var markers = null;

var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
var projectTo = new OpenLayers.Projection("EPSG:900913"); //The map projection (Spherical Mercator)

var controls = null;


function init() {
    map = new OpenLayers.Map("mapdiv");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);


    var lonlat = new OpenLayers.LonLat(-78.865002, 42.901206).transform(epsg4326, projectTo);

    var zoom = 15;


    markers = new OpenLayers.Layer.Vector("Overlay");

    controls = {
        selector: new OpenLayers.Control.SelectFeature(markers, { onSelect: createPopup, onUnselect: destroyPopup })
    };


    map.addControl(controls['selector']);
    controls['selector'].activate();


    map.addLayer(markers);


    map.setCenter(lonlat, zoom);
    map.events.register('moveend', map, function (evt) {
        fetchPoints();
    });
}


function createPopup(feature) {
    feature.popup = new OpenLayers.Popup.FramedCloud("pop",
        feature.geometry.getBounds().getCenterLonLat(),
        null,
            '<div class="markerContent">' + buildSummaryContent(feature.attributes.content) + '</div>',
        null,
        true,
        function () {
            controls['selector'].unselectAll();
        }
    );
    feature.popup.closeOnMove = true;
    map.addPopup(feature.popup);
}

function buildSummaryContent(item) {
    var content = "<b>" + item.name + "</b><br>";
    if(item.inspections !== undefined && item.inspections.length>0){
        content += item.inspections[0]["critical-violations"]+" critical violations<br>";
        content += item.inspections[0]["non-critical-violations"]+" non-critical violations<br>";
        var date = new Date(item.inspections[0].date);
        content +="Last inspected on:"+ date.toDateString()+"<br>";
        content += item.inspections.length+" total inspection records";
    }
    return content;

}

function destroyPopup(feature) {
    feature.popup.destroy();
    feature.popup = null;
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

                var color = "green";
                if (value.inspections !== undefined && value.inspections.length > 0) {
                    if (value.inspections[0]["critical-violations"] > 0) {
                        color = "red";
                    } else if (value.inspections[0]["non-critical-violations"] > 0) {
                        color = "yellow";
                    }
                }
                var marker = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(value.loc.coordinates[0], value.loc.coordinates[1]).transform(epsg4326, projectTo),
                    {content:value},
                    {externalGraphic: '/images/marker-' + color + '.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset: -12, graphicYOffset: -25  }
                );

                markers.addFeatures(marker);

                /*marker.events.register('mousedown', marker, function(evt) {

                 });*/
            }

        });
    });
}