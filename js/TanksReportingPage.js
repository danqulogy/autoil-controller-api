var request = 0;
var commands = [];
var counter = 0;
var currentDirection = 0;
var summaryIncreasedVolume = 0;
var summaryDecreasedVolume = 0;
var previousProductVolume = 0;

// Existing tanks configuration
var reportData = [];
var chartData = [];
var tankFuelGradeId = [];
var pumpNozzles = [];
var tankReconciliationData = [];

// Tanks reporting DataTable
var tankReportingDatatable;
var tankReconciliationDatatable;

var SYSTEM_PRICE_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_DECIMAL_DIGITS = 2;
var SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS = 2;
var SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS = 2;

//-------------------------------------------------------------------------------------
// Add tank numbers to the list
$('#rpDeviceNumberLabel').text("Tank");
$('#rpDeviceNumberSelect').empty();
$('#rpDeviceNumberSelect').append('<option value="0">All</option>');
for(counter = 1; counter <= TOTAL_PROBES; counter++)
    $('#rpDeviceNumberSelect').append('<option value="' + counter + '">' + counter + '</option>');

// Hide pump controls
if ($('#rpFuelGradesList').hasClass("d-none") == false)
    $('#rpFuelGradesList').addClass("d-none");
if ($('#rpUsersList').hasClass("d-none") == false)
    $('#rpUsersList').addClass("d-none");
if ($('#rpPumpSummaryReport').hasClass("d-none") == false)
    $('#rpPumpSummaryReport').addClass("d-none");
    
// Show tank controls
if ($('#rpTankDirection').hasClass("d-none") == true)
    $('#rpTankDirection').removeClass("d-none");
if ($('#rpTankReconciliationReport').hasClass("d-none") == true)
    $('#rpTankReconciliationReport').removeClass("d-none");
if ($('#rpTankMeasurementsChart').hasClass("d-none") == true)
    $('#rpTankMeasurementsChart').removeClass("d-none");

//-------------------------------------------------------------------------------------
// Get report data
$('#rpGenerateReportTanksButton').click(function() {    
    commands = [];
    var reportTitle = "";
                                    
    // Hide tables
    if ($('#trpTankTable').hasClass('d-none') == false)
        $('#trpTankTable').addClass('d-none');
    if ($('#trpTankReconciliationTable').hasClass('d-none') == false)
        $('#trpTankReconciliationTable').addClass('d-none');
    if ($('#trpTankMeasurementsChart').hasClass('d-none') == false)
        $('#trpTankMeasurementsChart').addClass('d-none');

    // Date/time start variables
    var dateTimeStart = "20" + 
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[0] + 
                        "-" + 
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[1] +
                        "-" +
                        $('#rpDateTimeStartInput').val().split(' ')[0].split('.')[2] +
                        "T" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[0] +
                        ":" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[1] +
                        ":" +
                        $('#rpDateTimeStartInput').val().split(' ')[1].split(':')[2];

    // Date/time end variables
    var dateTimeEnd = "20" + 
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[0] + 
                      "-" + 
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[1] +
                      "-" +
                      $('#rpDateTimeEndInput').val().split(' ')[0].split('.')[2] +
                      "T" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[0] +
                      ":" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[1] +
                      ":" +
                      $('#rpDateTimeEndInput').val().split(' ')[1].split(':')[2];

    // Validate
    var startDateTime = new Date(dateTimeStart);
    if ((startDateTime instanceof Date) == false || isNaN(startDateTime.valueOf()) == true) {
        showMessage("Start date/time set incorrectly!");
        return;
    }
    var endDateTime = new Date(dateTimeEnd);
    if ((endDateTime instanceof Date) == false || isNaN(endDateTime.valueOf()) == true) {
        showMessage("End date/time set incorrectly!");
        return;
    }

    // Compare datetimes
    if (startDateTime > endDateTime) {
        showMessage("Start datetime is later than end datetime!");
        return;
    }

    $("#trpChart").empty();
    reportData = [];
    tankReconciliationData = [];
    if (tankReportingDatatable != null)
        tankReportingDatatable.destroy();

    commands.push({
        function: ReportGetTankMeasurements,
        arguments: [
            $('#rpDeviceNumberSelect').val(),
            dateTimeStart, 
            dateTimeEnd
        ]
    });
    request = createComplexRequest(commands, true, 60000);

    // Process response
    request.done(function(response) {
        if (responseNull != true) {

            // Report data
            data = response.Packets.filter(Packet => Packet.Type == "ReportTankMeasurements");
            if (data != null &&
                data != undefined) {
                data = data[0].Data;
                if (data != undefined) {

                    if (data.length > 0) {
                        
                        counter = 0;
                        tankReconciliationData.push({
                            DT_RowId: 1,
                            remainsOnStart: "0",
                            summaryIncreasedVolume: "0",
                            summaryDecreasedVolume: "0",
                            pumpsSales: "0",
                            remainsOnEndCalculated: "0",
                            remainsOnEndActual: "0",
                            remainsDifference: "0"
                        });

                        data.forEach(function(reportDataItem, reportDataItemIndex) {
                            // Reconciliation data
                            currentDirection = 0;
                            if (reportDataItemIndex == 0) {
                                tankReconciliationData[0].remainsOnStart = reportDataItem.ProductVolume.toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                            } else if (reportDataItemIndex > 0) {
                                if (parseFloat(reportDataItem.ProductVolume) > parseFloat(previousProductVolume)) {
                                    currentDirection = 1;
                                    tankReconciliationData[0].summaryIncreasedVolume = (parseFloat(tankReconciliationData[0].summaryIncreasedVolume) + parseFloat(reportDataItem.ProductVolume) - parseFloat(previousProductVolume)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                }
                                else if (parseFloat(reportDataItem.ProductVolume) < parseFloat(previousProductVolume)) {
                                    currentDirection = 2;
                                    tankReconciliationData[0].summaryDecreasedVolume = (parseFloat(tankReconciliationData[0].summaryDecreasedVolume) + parseFloat(previousProductVolume) - parseFloat(reportDataItem.ProductVolume)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                }
                            }

                            // Check direction
                            if ($('#rpTankDirectionSelect').val() == 0 ||
                                (parseInt($('#rpTankDirectionSelect').val(), 10) > 0 && parseInt($('#rpTankDirectionSelect').val(), 10) == currentDirection)) {
                                counter++;
                                reportData.push({
                                    DT_RowId: counter.toString(),
                                    Line: counter.toString(),
                                    Datetime: reportDataItem.DateTime.replace(/-/g, ".").replace(/T/g, " "),
                                    Direction: (currentDirection == 1) ? '<i class="fas fa-rotate-180 fa-arrow-down text-success"></i>' : (currentDirection == 2 ? '<i class="fas fa-arrow-down text-danger"></i>' : ""),
                                    ProductHeight: reportDataItem.ProductHeight,
                                    WaterHeight: reportDataItem.WaterHeight,
                                    Temperature: reportDataItem.Temperature,
                                    ProductVolume: reportDataItem.ProductVolume,
                                    WaterVolume: reportDataItem.WaterVolume,
                                    ProductUllage: reportDataItem.ProductUllage,
                                    ProductTCVolume: reportDataItem.ProductTCVolume,
                                    ProductDensity: reportDataItem.ProductDensity,
                                    ProductMass: reportDataItem.ProductMass
                                });
                            }

                            previousProductVolume = reportDataItem.ProductVolume;

                            tankReconciliationData[0].remainsOnEndActual = reportDataItem.ProductVolume.toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                        });

                        reportTitle = " for";

                        if ($('#rpDeviceNumberSelect').val() != 0)
                            reportTitle += " tank " + $('#rpDeviceNumberSelect').val();
                        else
                            reportTitle += " all tanks";

                        reportTitle += ' from ' + $('#rpDateTimeStartInput').val() + ' till ' + $('#rpDateTimeEndInput').val();

                        document.title = 'Tank measurements report' + reportTitle;

                        $("#trpTankMeasurementsReportHeader").html('Tank measurements report' + reportTitle);

                        if ($('#rpTankReconciliationCheckbox').prop("checked") == true) {
                            // Clean arrays
                            commands = [];
                            tankId = 0;
                            pumpNozzles = [];
                        
                            // Get configuration
                            commands.push({
                                function: GetTanksConfiguration
                            },{
                                function: GetFuelGradesConfiguration
                            },{
                                function: GetPumpNozzlesConfiguration
                            },{
                                function: GetSystemDecimalDigits
                            });
                            request = createComplexRequest(commands);
                        
                            // Process response
                            request.done(function(response) {
                                if (responseNull == true)
                                    return;
                                        
                                // Tanks configuration
                                data = response.Packets.filter(Packet => Packet.Type == "TanksConfiguration");
                                if (data != null &&
                                    data != undefined &&
                                    data.length > 0) {
                                    data = data[0].Data;
                                    if (data == undefined) {
                                        return;
                                    } else {
                            
                                        // Fill in response values
                                        if (data.Tanks.length > 0) {
                                            data.Tanks.forEach(function(tankDataItem) {
                                                if (parseInt(tankDataItem.Id, 10) == parseInt($('#rpDeviceNumberSelect').val(), 10))
                                                    tankId = tankDataItem.Id;
                                            });
                                        }
                                        
                                        // System decimal digits
                                        data = response.Packets.filter(Packet => Packet.Type == "SystemDecimalDigits");
                                        if (data != null &&
                                            data != undefined &&
                                            data.length > 0) {
                                            data = data[0].Data;
                                            if (data == undefined) {
                                                return;
                                            } else {
                                                SYSTEM_PRICE_DECIMAL_DIGITS = parseInt(data.Price, 10);
                                                SYSTEM_AMOUNT_DECIMAL_DIGITS = parseInt(data.Amount, 10);
                                                SYSTEM_VOLUME_DECIMAL_DIGITS = parseInt(data.Volume, 10);
                                                SYSTEM_AMOUNT_TOTAL_DECIMAL_DIGITS = parseInt(data.AmountTotal, 10);
                                                SYSTEM_VOLUME_TOTAL_DECIMAL_DIGITS = parseInt(data.VolumeTotal, 10);
                                            }
                                        }
                        
                                        if (tankFuelGradeId > 0) {
                                        
                                            // Pump nozzles configuration
                                            data = response.Packets.filter(Packet => Packet.Type == "PumpNozzlesConfiguration");
                                            if (data != null &&
                                                data != undefined &&
                                                data.length > 0) {
                                                data = data[0].Data;
                                                if (data == undefined) {
                                                    return;
                                                } else {
                                        
                                                    // Fill in response values
                                                    if (data.PumpNozzles.length > 0) {
                                                        data.PumpNozzles.forEach(function(pumpNozzlesDataItem) {
                                                            pumpNozzlesDataItem.TankIds.forEach(function(pumpNozzlesDataTankIdItem, counterItem) {
                                                                if (parseInt(pumpNozzlesDataTankIdItem, 10) == parseInt(tankId, 10)) {
                                                                    pumpNozzles.push({
                                                                        Pump: pumpNozzlesDataItem.PumpId,
                                                                        Nozzle: counterItem + 1
                                                                    });
                                                                }
                                                            });
                                                        });
                
                                                        // Display tank reconciliation report
                                                        if (pumpNozzles.length > 0) {
                
                                                            // Clean arrays
                                                            commands = [];
                                                            reportData = [];
                                                            if (tankReconciliationDatatable != null)
                                                                tankReconciliationDatatable.destroy();
                
                                                            commands.push({
                                                                function: ReportGetPumpTransactions,
                                                                arguments: [
                                                                    "0",    // All pumps
                                                                    dateTimeStart, 
                                                                    dateTimeEnd
                                                                ]
                                                            });
                                                            request = createComplexRequest(commands, true, 60000);
                
                                                            // Process response
                                                            request.done(function(response) {
                                                                if (responseNull != true) {
                                                        
                                                                    // Report data
                                                                    data = response.Packets.filter(Packet => Packet.Type == "ReportPumpTransactions");
                                                                    if (data != null &&
                                                                        data != undefined) {
                                                                        data = data[0].Data;
                                                                        if (data != undefined) {
                                                        
                                                                            if (data.length > 0) {
                                                                                data.forEach(function(reportDataItem) {
                                                                                    pumpNozzles.forEach(function(pumpNozzlesItem) {
                                                                                        if (parseInt(pumpNozzlesItem.Pump, 10) == parseInt(reportDataItem.Pump, 10) &&
                                                                                            parseInt(pumpNozzlesItem.Nozzle, 10) == parseInt(reportDataItem.Nozzle, 10)) {
                                                                                            tankReconciliationData[0].pumpsSales = (parseFloat(tankReconciliationData[0].pumpsSales) + parseFloat(reportDataItem.Volume)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                                                                        }
                                                                                    });
                                                                                });
                
                                                                                tankReconciliationData[0].remainsOnEndCalculated = (parseFloat(tankReconciliationData[0].remainsOnStart) + parseFloat(tankReconciliationData[0].summaryIncreasedVolume) - parseFloat(tankReconciliationData[0].pumpsSales)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                                                                
                                                                                tankReconciliationData[0].remainsDifference = (parseFloat(tankReconciliationData[0].remainsOnEndActual) - parseFloat(tankReconciliationData[0].remainsOnEndCalculated)).toFixed(SYSTEM_VOLUME_DECIMAL_DIGITS);
                                    
                                                                                // Display the table
                                                                                if ($('#trpTankReconciliationTable').hasClass('d-none') == true)
                                                                                    $('#trpTankReconciliationTable').removeClass('d-none');
                                                                        
                                                                                // Fill in tanks reporting table
                                                                                tankReconciliationDatatable = $('#trpTankReconciliation').DataTable({
                                                                                    "pageLength": 1,
                                                                                    "ordering": false,
                                                                                    responsive: true,
                                                                                    select: false,
                                                                                    data: tankReconciliationData,
                                                                                    columns: [
                                                                                        { data: 'remainsOnStart' },
                                                                                        { data: 'summaryIncreasedVolume' },
                                                                                        { data: 'summaryDecreasedVolume' },
                                                                                        { data: 'pumpsSales' },
                                                                                        { data: 'remainsOnEndCalculated' },
                                                                                        { data: 'remainsOnEndActual' },
                                                                                        { data: 'remainsDifference' }
                                                                                    ],
                                                                                    columnDefs: [
                                                                                        {
                                                                                            targets: 0,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 1,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 2,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 3,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 4,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 5,
                                                                                            className: 'dt-body-center',
                                                                                            "width": '15%'
                                                                                        },
                                                                                        {
                                                                                            targets: 6,
                                                                                            className: 'dt-body-center text-danger',
                                                                                            "width": '10%'
                                                                                        }
                                                                                    ],
                                                                                    dom: '<"clearfix"B>rt',
                                                                                    buttons: [
                                                                                        'copyHtml5',
                                                                                        {
                                                                                            extend: 'excelHtml5',
                                                                                            footer: true
                                                                                        },
                                                                                        'csvHtml5',
                                                                                        'print'
                                                                                    ]
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            $("#trpTankReconciliationReportHeader").html('Tank reconciliation report' + reportTitle);
                        }
    
                        // Display the chart
                        if ($('#rpTankDirectionSelect').val() == 0 &&
                            $('#rpTankMeasurementsCheckbox').prop("checked") == true) {
                            // Display chard
                            if ($('#trpTankMeasurementsChart').hasClass('d-none') == true)
                                $('#trpTankMeasurementsChart').removeClass('d-none');
        
                            chartData = [];
                            chartData = reportData.map(function(reportDataItem) {
                                return { value: reportDataItem.ProductVolume, date: reportDataItem.Datetime.replace(".", "-").replace(".", "-").replace(" ", "T") };
                            });
        
                            var data = [{
                                name: "Chart",
                                data: chartData
                            }];
        
                            $tip = $('#trpTip');
                            $tip.hide();
        
                            // Basic
                            options = {
                                height: 400,
                                width: 1000,
                                x: { margin: 15, min: null, max: null },
                                y: { margin: 0.2, min: null, max: null },
                                goal: { show: false, value: 23, color: "#3BAFD7" },
                                tooltip: { show: true, maxRadius: 2 },
                                lines: { show: true, fill: true, curve: true, strokeColor: ["#3BAFD7", "#E1523D"], strokeWidth: 1, fillOpacity: 0.1, fillColor: ["#3BAFD7", "#E1523D"] },
                                points: { show: true, strokeWidth: 3, strokeColor: ["#3BAFD7", "#E1523D"] },
                                labels: {
                                    lineWidth: 0.1,
                                    fontSize: 11,
                                    x: { number: 7, show: true, color: "#000000", grid: true },
                                    y: { number: 4, show: true, color: "#000000", grid: true }
                                }
                            };
        
                            $("#trpChart").chart(data, options, function (tooltip) {
                                if (tooltip.found) {
                                    var pointDate = new Date(tooltip.point.date);
                                    var month = addZero(pointDate.getMonth() + 1);
                                    var date = addZero(pointDate.getDate());
                                    var hours = addZero(pointDate.getHours());
                                    var minutes = addZero(pointDate.getMinutes());
        
                                    $tip.html("<b>Product volume</b>: " + tooltip.point.value + " l<br><b>Date</b>: " + date + "." + month + " " + hours + ":" + minutes);
                                    $tip.css({ left: tooltip.mouse.pageX + 5, top: tooltip.mouse.pageY - 50 }).show();
                                } else {
                                    $tip.hide();
                                }
                            });

                            $("#trpTankMeasurementsChartHeader").html('Tank measurements chart' + reportTitle);
                        }
                    }
                }
            }
        }

        // Display the table
        if ($('#trpTankTable').hasClass('d-none') == true)
            $('#trpTankTable').removeClass('d-none');

        // Fill in tanks reporting table
        tankReportingDatatable = $('#trpTank').DataTable({
            "pageLength": 5,
            "ordering": true,
            responsive: true,
            select: true,
            data: reportData,
            columns: [
                { data: 'Line' },
                { data: 'Datetime' },
                { data: 'Direction' },
                { data: 'ProductHeight' },
                { data: 'WaterHeight' },
                { data: 'Temperature' },
                { data: 'ProductVolume' },
                { data: 'WaterVolume' },
                { data: 'ProductUllage' },
                { data: 'ProductTCVolume' },
                { data: 'ProductDensity' },
                { data: 'ProductMass' }
            ],
            columnDefs: [
                {
                    targets: 0,
                    className: 'dt-body-center',
                    "width": '3%'
                },
                {
                    targets: 1,
                    className: 'dt-body-center',
                    "width": '7%'
                },
                {
                    targets: 2,
                    className: 'dt-body-center',
                    "width": '5%'
                },
                {
                    targets: 3,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 4,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 5,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 6,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 7,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 8,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 9,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 10,
                    className: 'dt-body-center',
                    "width": '10%'
                },
                {
                    targets: 11,
                    className: 'dt-body-center',
                    "width": '5%'
                }
            ],
            dom: '<"clearfix"B>lfrtip',
            buttons: [
                'copyHtml5',
                {
                    extend: 'excelHtml5',
                    footer: true
                },
                'csvHtml5',
                'print'
            ]
        });
    });
});