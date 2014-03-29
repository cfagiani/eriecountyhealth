function initCharts() {
    initViolationChart();

}

function initViolationChart() {
    $.get("/healthinspections/inspection/stats?type=violations", function (data) {
        var totalCount = 0;
        var categories = [];
        var dataVals = [];
        $.each(data, function (index, value) {
           totalCount+=value.count;
            categories.push(value.text);
            dataVals.push(value.count);
        });
        $('#violationChartDiv').highcharts({
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