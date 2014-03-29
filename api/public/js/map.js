var map = null;
var markers = null;

var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
var projectTo = new OpenLayers.Projection("EPSG:900913"); //The map projection (Spherical Mercator)

var controls = null;


/**
 * initializes the map and the marker layer (vector layer). This function assumes a div called "mapdiv" exists on the page.
 * it centers the map on downtown buffalo at a zoom level of 15
 */
function initMap() {
    map = new OpenLayers.Map("mapdiv");
    var osmLayer = new OpenLayers.Layer.OSM();
    map.addLayer(osmLayer);


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


/**
 * builds pop-up bubble with "close" control when a marker is clicked.
 * @param feature
 */
function createPopup(feature) {
    feature.popup = new OpenLayers.Popup.FramedCloud("pop",
        feature.geometry.getBounds().getCenterLonLat(),
        null,
            '<div class="markerContent">' + buildPopupContent(feature.attributes.content) + '</div>',
        null,
        true,
        function () {
            controls['selector'].unselectAll();
        }
    );
    feature.popup.closeOnMove = true;
    map.addPopup(feature.popup);
}

/**
 * builds the html content for a pop-up bubble
 * @param item
 * @returns {string}
 */
function buildPopupContent(item) {
    var content = "<b>" + item.name + "</b><br>";
    if (item.inspections !== undefined && item.inspections.length > 0) {
        content += item.inspections[0]["critical-violations"] + " critical violations<br>";
        content += item.inspections[0]["non-critical-violations"] + " non-critical violations<br>";
        var date = new Date(item.inspections[0].date);
        content += "Last inspected on:" + date.toDateString() + "<br>";
        content += item.inspections.length + " total inspection records";
    }
    displayDetails(item);
    return content;

}

/**
 * populates the details div with the inspection info
 * @param item
 */
function displayDetails(item) {

    $("#addressdiv").empty();
    $("#addressdiv").html("<h3>" + item.name + "</h3>" + item.street + " " + item.city + ", NY " + item.zip + "<br>" + item.phone);
    $("#inspectiondiv").empty();
    if (item.inspections !== undefined && item.inspections.length > 0) {
        var content = '<div class="panel-group" id="accordion">';
        $.each(item.inspections, function (index, value) {
            var color = "#49F043";
            if(value["critical-violations"]>0){
                color = "#f04d49";
            }else if (value["non-critical-violations"]>0){
                color = "#EEF015";
            }
            content+='<div class="panel panel-default"><div class="panel-heading" style="background-color:'+color+'"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+index+'">';
            var date = new Date(value.date);
            content+=value.type+' ('+date.toDateString()+')</a></h4></div>';
            content+=     ' <div id="collapse'+index+'" class="panel-collapse collapse"><div class="panel-body" id="'+value.id+'">';
            //content inserted here after api call
            content+='</div></div></div>';
        });
        content += '</div>';
        $('#inspectiondiv').append(content);
        $('#accordion').on('show.bs.collapse', function (evt) {
            var contentDiv = $(evt.target.children[0]);

            $.get("/healthinspections/inspection/"+contentDiv[0].id, function(data){
                if(data.violations !== undefined && data.violations.length>0){
                    var inspContent = "";
                    $.each(data.violations, function(index ,value){
                        inspContent+="<p><b>"+value.code+"-"+value.text+"</b><br>";
                        inspContent+=value.note+"</p>";
                    });
                    contentDiv.html(inspContent);

                }else{
                    contentDiv.html("No Violations");
                }
            });
        })
    } else {
        $("#inspectiondiv").html("<h4>No Inspections</h4>");
    }

    $("#detailsdiv").show();


}

/**
 * cleans up a closed popup
 * @param feature
 */
function destroyPopup(feature) {
    feature.popup.destroy();
    feature.popup = null;
}

/**
 * updates the summary statistics based on the data passed in
 */
function updateSummaryContent(mostCritViolated, mostNonCritViolated, totalCritViolations, totalNonCritViolations, totalItems) {
    $("#mostcritical").html(mostCritViolated.name + " (" + mostCritViolated.inspections[0]["critical-violations"] + ")");
    $("#mostnoncritical").html(mostNonCritViolated.name + " (" + mostNonCritViolated.inspections[0]["non-critical-violations"] + ")");
    $("#avgcritviolations").html((totalCritViolations / totalItems).toFixed(2));
    $("#avgnoncritviolations").html((totalNonCritViolations / totalItems).toFixed(2));

}

/**
 * get all the visible points for a map by detecting the map bounds and passing that into the facility API. For each point returned, createa a marker in the vector layer.
 */
function fetchPoints() {
    var bounds = map.getExtent();
    var bottomLeft = new OpenLayers.Geometry.Point(bounds.left, bounds.bottom);
    bottomLeft.transform(projectTo, epsg4326);

    var topRight = new OpenLayers.Geometry.Point(bounds.right, bounds.top);
    topRight.transform(projectTo, epsg4326);

    $.get("/healthinspections/facility?blx=" + bottomLeft.x + "&bly=" + bottomLeft.y + "&trx=" + topRight.x + "&try=" + topRight.y, function (data) {
        markers.removeAllFeatures();
        var mostCritViolated = null;
        var mostNonCritViolated = null;
        var totalCritViolations = 0;
        var totalNonCritViolations = 0;
        $.each(data, function (index, value) {
            if (value.loc !== undefined) {

                var color = "green";
                if (value.inspections !== undefined && value.inspections.length > 0) {
                    if (value.inspections[0]["critical-violations"] > 0) {
                        color = "red";
                        if (mostCritViolated == null || mostCritViolated.inspections[0]["critical-violations"] < value.inspections[0]["critical-violations"]) {
                            mostCritViolated = value;
                        }
                        totalCritViolations += value.inspections[0]["critical-violations"];
                    } else if (value.inspections[0]["non-critical-violations"] > 0) {
                        color = "yellow";
                        if (mostNonCritViolated == null || mostNonCritViolated.inspections[0]["non-critical-violations"] < value.inspections[0]["non-critical-violations"]) {
                            mostNonCritViolated = value;
                        }
                        totalNonCritViolations += value.inspections[0]["non-critical-violations"];
                    }
                }
                var marker = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(value.loc.coordinates[0], value.loc.coordinates[1]).transform(epsg4326, projectTo),
                    {content: value},
                    {externalGraphic: '/images/marker-' + color + '.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset: -12, graphicYOffset: -25  }
                );

                markers.addFeatures(marker);
            }

        });
        updateSummaryContent(mostCritViolated, mostNonCritViolated, totalCritViolations, totalNonCritViolations, data.length);
    });
}