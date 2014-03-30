function initCharts() {
    initViolationChart();
    $('ul.nav.nav-pills li a').click(function(evt) {
        clearChart();
        if(evt.target.id == 'violations-link'){
            initViolationChart();
        }else if (evt.target.id == 'inspections-link'){
            initInspectionChart();
        }else if (evt.target.id == 'facility-link'){
            initFacilityTypeChart();
        }

    });
}

function clearChart(){
    $("#chart-heading").empty();
    $("#chart-content").empty();
}

function initFacilityTypeChart(){
    $.get("/healthinspections/facility/stats?type=facilitytype", function (data) {

        var dataVals = [];

        $.each(data, function (index, value) {
            dataVals.push([value.text, value.count]);
        });


        $("#chart-heading").html("<h3>Facility Type Breakdown</h3>")
        $('#chart-content').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Facility Types'
            },

            series: [
                {
                    type:"pie",
                    data: dataVals
                }
            ]
        });
    });
}

function initInspectionChart(){
    $.get("/healthinspections/inspection/stats?type=inspections", function (data) {

        var dataVals = [];

        $.each(data, function (index, value) {
            dataVals.push([value.text, value.count]);
        });


        $("#chart-heading").html("<h3>Inspection Type Breakdown</h3>")
        $('#chart-content').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Inspections by Category'
            },

            series: [
                {
                    type:"pie",
                    data: dataVals
                }
            ]
        });
    });
}

function initViolationChart() {
    $.get("/healthinspections/inspection/stats?type=violations", function (data) {
        var threshold = 30;
        var categories = [];
        var dataVals = [];
        var excludedCount = 0;
        $.each(data, function (index, value) {
            if(value.count > threshold) {
                categories.push(value.text);
                dataVals.push(value.count);
            }else{
                excludedCount+= value.count;
            }

        });
        if(excludedCount>0){
            categories.push("other");
            dataVals.push(excludedCount);
        }
        $("#chart-heading").html("<h3>All-time violations</h3>")
        $('#chart-content').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Violations by Type'
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Violations'
                }
            },
            series: [
                {
                    name: 'Violations',
                    data: dataVals
                }
            ]
        });
    });



}